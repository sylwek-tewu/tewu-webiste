# ADR 0003: Migracja hostingu z platformy Netlify na VPS w OVHcloud (Coolify) i bufor SQLite (Drizzle ORM)

## Status
Zaakceptowany (Accepted)

## Kontekst
Dotychczas serwis Biura Rachunkowego TEWU wdrażany był na platformie Netlify. Wiązało się to z kilkoma istotnymi ograniczeniami:
1. **Zależność od technologii dostawcy (vendor lock-in):** Awaryjny bufor zgłoszeń call-back opierał się na usłudze `@netlify/blobs`, a ponawianie wysyłki – na funkcji harmonogramu `netlify/functions/process-outbox.mts`.
2. **Kwestie RODO i lokalizacja danych:** Funkcje serverless Netlify oraz bufor Blobs domyślnie przetwarzały żądania w regionie US East (USA), co wymuszało powoływanie się w Polityce Prywatności na ramy *EU-US Data Privacy Framework* i deklarowanie transferu danych poza Europejski Obszar Gospodarczy.
3. **Koszty i elastyczność:** Przejście na własny serwer wirtualny VPS w OVHcloud zarządzany przez platformę Coolify zapewnia pełną suwerenność technologiczną, niezależność od zewnętrznych limitów serverless oraz gwarantuje lokalizację przetwarzania w 100% na terenie EOG.

## Decyzje architektoniczne i projektowe

### 1. Konteneryzacja i tryb Next.js Standalone
- Aplikacja Next.js kompilowana jest z flagą `output: 'standalone'` oraz jawnym `outputFileTracingRoot`.
- Wdrożono wieloetapowy `Dockerfile` oparty o `node:24-alpine`:
  - **Etap deps:** instalacja narzędzi kompilacji (`python3`, `make`, `g++`) wymaganych przez natywne wiązania `better-sqlite3`.
  - **Etap builder:** kompilacja produkcyjna Next.js (`pnpm build`).
  - **Etap runner:** minimalny obraz uruchomieniowy działający z uprawnieniami nieuprzywilejowanego użytkownika `nextjs` (UID 1001), z zainstalowaną biblioteką współdzieloną `libstdc++`.
- Port aplikacji: standardowy 3000, zarządzany za pośrednictwem wbudowanego w Coolify reverse proxy (Traefik / Caddy) z automatyczną obsługą certyfikatów Let's Encrypt SSL.

### 2. Silnik bufora awaryjnego: Drizzle ORM + SQLite (`better-sqlite3`)
- Zastąpiono `@netlify/blobs` lokalną bazą danych SQLite zarządzaną przez `drizzle-orm` oraz `drizzle-kit`.
- Schemat bazy danych (`src/db/schema.ts`):
  - `outbox_records`: unikalny klucz zgłoszenia (`id`), zaszyfrowany numer telefonu (`phone`, algorytm AES-256-GCM), slot, temat, źródło, język, znacznik czasu `createdAt`, liczba prób i data ostatniej próby.
  - `outbox_meta`: przechowuje stan ograniczenia częstotliwości powiadomień technicznych (rate limiting alertów o błędach magazynu lub braku klucza szyfrowania, zastępując dawny store `callback-outbox-meta`).
- Lokalizacja bazy danych: domyślnie `/app/data/outbox.db` w kontenerze, mapowane w Coolify jako trwały wolumen dyskowy (Persistent Storage). Ścieżka może być nadpisana zmienną środowiskową `OUTBOX_DB_PATH`.
- **Automatyczne migracje:** Przy inicjalizacji połączenia z bazą danych uruchamiana jest funkcja `runMigrations()` oparta o migrator Drizzle (`drizzle-orm/better-sqlite3/migrator`), co zapewnia bezobsługową inicjalizację bazy na nowo uruchomionych wolumenach VPS bez konieczności ręcznego wykonywania poleceń CLI.

### 3. Harmonogram przetwarzania bufora (zastąpienie Netlify Scheduled Functions)
- Wdrożono dedykowany wewnętrzny punkt końcowy: `POST /api/internal/process-outbox`.
- **Bezpieczeństwo:** Endpoint chroniony jest tokenem przekazywanym w nagłówku `Authorization: Bearer <CRON_SECRET>` (lub `x-cron-secret`). Na środowisku produkcyjnym brak skonfigurowanej zmiennej `CRON_SECRET` blokuje wykonanie z kodem 500 (fail-safe).
- **Wyzwalanie:** W Coolify konfigurowane jest cykliczne zadanie (Scheduled Task) wykonujące żądanie HTTP co 10 minut (`*/10 * * * *`):
  ```bash
  curl -s -X POST http://localhost:3000/api/internal/process-outbox -H "Authorization: Bearer ${CRON_SECRET}"
  ```
- Endpoint zwraca szczegółowy obiekt JSON `ProcessResult` (liczba przetworzonych, wysłanych, przeterminowanych, uszkodzonych i błędnych wpisów), logowany w standardowym strumieniu dostępowym serwera.

### 4. Polityka Prywatności i zgodność z RODO
- Zaktualizowano treści polityki w języku polskim i ukraińskim (`src/i18n/pl.ts`, `src/i18n/uk.ts`, `PrivacyPolicyClient.tsx`):
  - Wskazano hostingodawcę: **OVHcloud (OVH SAS / OVH Sp. z o.o.)** z infrastrukturą w centrum danych w EOG.
  - **Usunięto sekcję dotyczącą transferu danych do USA** oraz odwołania do *EU-US Data Privacy Framework* – wszystkie dane przetwarzane są wyłącznie na terenie Europejskiego Obszaru Gospodarczego.
  - Bufor awaryjny opisano jako lokalną, szyfrowaną bazę danych na serwerze o retencji do 72 godzin (zgodnie z `CALLBACK_OUTBOX_TTL_HOURS`).
  - Określono retencję logów serwera i aplikacji na 7 dni.

### 5. Likwidacja zależności od Netlify
- Usunięto pakiet `@netlify/blobs` z `package.json`.
- Usunięto plik konfiguracyjny `netlify.toml` oraz wtyczkę `@netlify/plugin-nextjs`.
- Usunięto katalog `netlify/` wraz z funkcją `process-outbox.mts`.
- Zaktualizowano zestaw testów jednostkowych i integracyjnych (Vitest).

## Konsekwencje

### Pozytywne
- **Prywatność i RODO:** Brak transferu jakichkolwiek danych poza Europejski Obszar Gospodarczy.
- **Odporność i brak vendor lock-in:** Aplikacja działa jako w 100% standardowy kontener Docker możliwy do uruchomienia na dowolnym serwerze VPS / chmurze.
- **Trwałość danych:** SQLite w trybie WAL na wolumenie trwałym zapewnia niezawodne, transakcyjne kolejkowanie zgłoszeń w przypadku awarii SMTP.
- **Determinizm środowiska:** Standalone Next.js z Drizzle ORM eliminuje narzut i nieprzewidywalność platform serverless.

### Wymagania operacyjne dla wdrożenia w Coolify
1. **Konfiguracja wolumenu (Persistent Storage):** Zamontować wolumen hosta do ścieżki kontenera `/app/data`.
2. **Zmienne środowiskowe:** Ustawić zmienne w Coolify:
   - `CRON_SECRET` – silny losowy token autoryzacyjny dla crona,
   - `OUTBOX_ENCRYPTION_KEY` – 32-bajtowy klucz szyfrowania danych osobowych w buforze SQLite,
   - Standardowe zmienne SMTP (`CALLBACK_SMTP_*`, `CALLBACK_FROM`, `CALLBACK_TO`) oraz opcjonalne zmienne Telegrama (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`).
3. **Konfiguracja Scheduled Task:** Dodać w Coolify zadanie cron z interwałem `*/10 * * * *` wywołujące `POST /api/internal/process-outbox`.
