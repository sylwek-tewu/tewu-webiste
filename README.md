# Biuro Rachunkowe TEWU

A modern web application for "Biuro Rachunkowe TEWU Sp. z o.o.", an accounting office in Szczecin, offering comprehensive accounting, HR, and tax advisory services.

## Tech Stack

- **Framework**: [Next.js 16 (App Router / Turbopack)](https://nextjs.org/)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **UI Component Library**: [Mantine UI v8](https://mantine.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database & Outbox Storage**: [Drizzle ORM](https://orm.drizzle.team/) + SQLite ([better-sqlite3](https://github.com/WiseLibs/better-sqlite3))
- **Hosting & Deployment**: [Coolify](https://coolify.io/) na serwerze VPS w [OVHcloud](https://www.ovhcloud.com/) (konteneryzacja Docker w trybie Next.js standalone)
- **Testing**: [Vitest](https://vitest.dev/)
- **Linter**: [ESLint](https://eslint.org/) (Flat Config)
- **Package Manager**: [pnpm](https://pnpm.io/)

---

## Features

- **Widżet Call-Back „Bezpłatna wycena – oddzwonimy”**:
  - Globalny pływający widżet w prawym dolnym rogu (desktop) oraz dwuprzyciskowy pasek akcji „Zadzwoń” / „Oddzwońcie” (mobile).
  - Otwierany ze wszystkich przycisków „Bezpłatna wycena” w nagłówku menu (desktop i mobile Drawer).
  - Inteligentne wyliczanie obietnicy kontaktu w strefie `Europe/Warsaw`: uwzględnia godziny pracy biura (8:00–16:00), 15-minutowy bufor, dyżur telefoniczny (17:00–18:00) oraz polskie dni ustawowo wolne od pracy (w tym Wigilię i święta ruchome).
  - Zabezpieczenia antyspamowe: honeypot oraz time-trap (bez zewnętrznych skryptów śledzących i captcha).
  - Podwójny tor powiadomień:
    - **E-mail (SMTP)**: pełne dane zgłoszenia (w tym numer telefonu).
    - **Telegram Bot API**: powiadomienia techniczne **bez danych osobowych** (brak numeru telefonu chroni przed wyciekiem PII).
  - **Bufor awaryjny (SQLite Outbox)**: w razie awarii serwera pocztowego zgłoszenie trafia do szyfrowanego bufora (AES-256-GCM) w lokalnej bazie SQLite na wolumenie trwałym. Wewnętrzny endpoint `/api/internal/process-outbox` wywoływany przez zadanie harmonogramu Coolify ponawia wysyłkę z rosnącą przerwą (10, 20, 40, 80 min, potem co 2 h) do upływu `CALLBACK_OUTBOX_TTL_HOURS` (domyślnie 72 godziny).
  - Analityka: zdarzenia `callback_widget_open` i `callback_request_submit` przekazywane do `window.dataLayer` (bez danych osobowych).
- **Service Listings**: Szczegółowe opisy usług księgowych (pełna księgowość, KPiR, ryczałt, kadry i płace, ZUS/US).
- **Certificate Showcase**: Galeria certyfikatów z wbudowaną przeglądarką PDF.
- **Wielojęzyczność (i18n)**: Pełne wsparcie dla języka polskiego (`/`) i ukraińskiego (`/uk`) z przełącznikiem języka i wykrywaniem preferencji.
- **Podstrona Polityki Prywatności (`/polityka-prywatnosci`)**: Zgodna z RODO, z pełną lokalizacją danych w EOG (serwer VPS w OVHcloud), opisem retencji bufora SQLite (wartość z `CALLBACK_OUTBOX_TTL_HOURS`) i szyfrowania AES-256-GCM.
- **Ujednolicone linki kontaktowe**: Wszystkie numery jako `tel:+48…`, adresy pocztowe jako `mailto:`.

---

## Konfiguracja środowiska (Environment Variables)

Skopiuj plik `.env.example` do `.env.local` na potrzeby pracy lokalnej:

```bash
cp .env.example .env.local
```

### Lista zmiennych środowiskowych:

| Zmienna | Wymagana | Opis | Przykład |
|---|---|---|---|
| `CALLBACK_SMTP_HOST` | Tak | Host serwera poczty wychodzącej | `smtp.twojadomena.pl` |
| `CALLBACK_SMTP_PORT` | Tak | Port SMTP (587 dla STARTTLS, 465 dla SSL). TLS jest wymagany: serwer bez STARTTLS odrzuci wysyłkę (zgłoszenia trafią do bufora) | `587` |
| `CALLBACK_SMTP_USER` | Tak | Nazwa użytkownika / login konta pocztowego | `biuro@tewu.szczecin.pl` |
| `CALLBACK_SMTP_PASS` | Tak | Hasło konta pocztowego | `tajne-haslo` |
| `CALLBACK_FROM` | Tak | Nagłówek nadawcy wiadomości e-mail | `"Biuro TEWU <biuro@tewu.szczecin.pl>"` |
| `CALLBACK_TO` | Tak | Adres(y) odbiorcy powiadomień w biurze | `biuro@tewu.szczecin.pl` |
| `CRON_SECRET` | Tak (produkcja) | Token zabezpieczający endpoint ponawiania bufora (`POST /api/internal/process-outbox`) | `silny-losowy-token-cron` |
| `OUTBOX_ENCRYPTION_KEY` | Tak (produkcja) | Klucz szyfrowania danych w bazie SQLite (AES-256-GCM). Bez niego bufor awaryjny nie przyjmie zgłoszenia. Zmiana klucza usuwa oczekujące wpisy (z alarmem); brak klucza wstrzymuje ponawianie bez usuwania (alarm) | `losowy-32-bajtowy-klucz` |
| `OUTBOX_DB_PATH` | Nie | Ścieżka do pliku bazy SQLite (w kontenerze `/app/data/outbox.db`, lokalnie domyślnie `./data/outbox.db`) | `/app/data/outbox.db` |
| `NEXT_PUBLIC_CALLBACK_CALL_NUMBER` | Nie | Numer pod przyciskiem „Zadzwoń” (mobile) w formacie E.164. Domyślnie stacjonarny biura. *(Wymaga ponownego buildu kontenera po zmianie)* | `+48914824190` lub `+48501482555` |
| `TELEGRAM_BOT_TOKEN` | Nie | Token bota z @BotFather (opcjonalny ping bez PII) | `123456789:ABC...` |
| `TELEGRAM_CHAT_ID` | Nie | ID czatu lub grupy biura na Telegramie | `-1001234567890` |
| `CALLBACK_OUTBOX_TTL_HOURS` | Nie | Czas retencji zgłoszeń w buforze awaryjnym (w godzinach, domyślnie 72). Wartość pojawia się też w polityce prywatności – zmiana wymaga ponownego buildu | `72` |
| `NEXT_PUBLIC_EXTRA_CLOSED_DATES` | Nie | Dodatkowe dni wolne biura (np. Sylwester, mostki). Wstrzykiwana podczas kompilacji – zmiana wymaga ponownego buildu | `2026-12-31,2026-05-02` |

---

## Wdrożenie w Coolify na VPS OVHcloud

1. **Utworzenie aplikacji w panelu Coolify**:
   - Wybierz serwer VPS w OVHcloud i dodaj nowy zasób typu **Application** (źródło: repozytorium Git).
   - Jako metodę budowania wybierz **Dockerfile** (Coolify automatycznie wykryje wieloetapowy `Dockerfile` w głównym katalogu).
2. **Konfiguracja pamięci trwałej (Persistent Storage)**:
   - W ustawieniach aplikacji przejdź do zakładki **Storages**.
   - Dodaj nowy wolumen:
     - **Destination Path**: `/app/data`
     - **Name**: `tewu-data` (lub domyślna nazwa wolumenu)
   - Umożliwia to zachowanie bazy SQLite (`/app/data/outbox.db`) pomiędzy kolejnymi wdrożeniami i restartami kontenera.
   - *Wskazówka dotycząca uprawnień:* Przy korzystaniu z wolumenów zarządzanych Dockera (Named Volumes) uprawnienia katalogu są dziedziczone automatycznie dla użytkownika `nextjs` (UID 1001). W przypadku bind mountu z katalogu hosta VPS upewnij się, że katalog na hoście ma uprawnienia zapisu dla UID 1001 (`chown -R 1001:1001 <sciezka_na_hoscie>`).
3. **Zmienne środowiskowe**:
   - Wprowadź zmienne produkcyjne z powyższej tabeli w zakładce **Environment Variables**.
   - Zmienne `CALLBACK_OUTBOX_TTL_HOURS`, `NEXT_PUBLIC_CALLBACK_CALL_NUMBER` i `NEXT_PUBLIC_EXTRA_CLOSED_DATES` zaznacz jako **Build Variable** – są odczytywane podczas kompilacji (`ARG` w `Dockerfile`). `CALLBACK_OUTBOX_TTL_HOURS` musi być dostępna także w czasie działania (domyślnie jest), aby okres w polityce prywatności zgadzał się z faktycznym usuwaniem.
4. **Zadanie harmonogramu (Coolify Scheduled Task)**:
   - W zakładce **Scheduled Tasks** dodaj zadanie cykliczne (uruchamiane wewnątrz kontenera aplikacji):
     - **Cron Expression**: `*/10 * * * *` (co 10 minut)
     - **Command** (obraz nie zawiera `curl`, dostępny jest `wget` z BusyBox):
       ```bash
       wget -qO- --post-data='' --header="Authorization: Bearer $CRON_SECRET" http://127.0.0.1:3000/api/internal/process-outbox
       ```
   - Po zapisaniu uruchom zadanie ręcznie i sprawdź w logach wynik `{"processed":…}`. Odpowiedź `{"status":"skipped","reason":"run-in-progress"}` oznacza, że poprzedni przebieg jeszcze trwał – wpisy zostaną obsłużone w kolejnym przebiegu.
5. **Retencja logów (7 dni, wymagana przez politykę prywatności)**:
   - Docker nie usuwa logów kontenerów po czasie. Na serwerze VPS (jako root) zainstaluj konfigurację logrotate z repozytorium:
     ```bash
     cp deploy/logrotate/docker-containers /etc/logrotate.d/docker-containers
     logrotate --debug /etc/logrotate.d/docker-containers
     ```
   - Sprawdź `/etc/docker/daemon.json`: jeżeli zawiera `log-opts` z `max-size` / `max-file` (instalator Coolify może je ustawić), usuń je i zrestartuj Dockera. Pliki rotowane przez samego Dockera (`*-json.log.1` …) są usuwane według liczby, a nie wieku, więc mogłyby leżeć dłużej niż 7 dni. Codzienna rotacja logrotate ogranicza wtedy logi do 7 dni.
   - Jeżeli w Coolify włączono logi dostępowe proxy (Traefik), dopisz ich plik do tej konfiguracji.

---

## Instrukcja konfiguracji bota Telegram dla właściciela biura

Powiadomienia na Telegramie mają charakter czysto pomocniczy i **nie zawierają żadnych danych osobowych klientów** (numer telefonu trafia wyłącznie do bezpiecznej skrzynki e-mail biura).

1. Otwórz aplikację Telegram i wyszukaj bota **@BotFather**.
2. Wpisz polecenie `/newbot` i postępuj zgodnie z instrukcjami, podając nazwę oraz unikalny username bota (np. `TewuCallbackBot`).
3. Po utworzeniu bota skopiuj wygenerowany **HTTP API token** – będzie to wartość zmiennej `TELEGRAM_BOT_TOKEN`.
4. Utwórz grupę na Telegramie dla pracowników biura (lub użyj istniejącej) i dodaj do niej nowo utworzonego bota.
5. Aby pozyskać identyfikator grupy (`TELEGRAM_CHAT_ID`):
   - Wyślij do grupy dowolną wiadomość (np. `test`).
   - Otwórz w przeglądarce adres: `https://api.telegram.org/bot<TWOJ_TOKEN>/getUpdates`.
   - W sekcji `"chat":{"id": ...}` odczytaj identyfikator (dla grup jest to liczba ujemna, np. `-1001234567890`).
6. Wprowadź `TELEGRAM_BOT_TOKEN` i `TELEGRAM_CHAT_ID` w panelu Coolify w zakładce **Environment Variables** aplikacji i wdróż ją ponownie.

---

## Otwarte kwestie prawne i organizacyjne (dla właściciela TEWU)
1. **Weryfikacja szkicu Polityki Prywatności (`/polityka-prywatnosci`)**:
   - Skonsultowanie treści szkicu z radcą prawnym biura (potwierdzenie podstawy prawnej z art. 6 ust. 1 lit. b vs f RODO).
   - Potwierdzenie zawarcia umowy powierzenia przetwarzania danych (DPA) z OVH Sp. z o.o. (wskazaną w polityce) i lokalizacji centrum danych VPS w EOG.
   - Uzupełnienie sekcji dotyczącej plików cookies po późniejszym wdrożeniu baneru CMP / Cookiebota.
2. **Kolejne kroki marketingowe**:
   - Wdrożenie Cookiebota / Google Consent Mode v2.
   - Podpięcie tagów konwersji Google Ads i GA4 pod zaimplementowane zdarzenia `dataLayer` (`callback_widget_open`, `callback_request_submit`).

---

## Development i weryfikacja

### Uruchomienie lokalne:
```bash
pnpm dev
```

### Uruchomienie testów jednostkowych (Vitest):
```bash
pnpm test
```

### Uruchomienie lintera (ESLint):
```bash
pnpm lint
```

### Budowanie aplikacji produkcyjnej:
```bash
pnpm build
```

### Zarządzanie bazą danych (Drizzle ORM):
```bash
# Generowanie migracji na podstawie zmian w src/db/schema.ts
pnpm db:generate

# Aplikowanie migracji ręcznie
pnpm db:migrate
```
*(Uwaga: w środowisku kontenerowym aplikacja otwiera bazę i automatycznie aplikuje oczekujące migracje przy starcie serwera (`src/instrumentation.ts`); błąd zgłaszany jest w logach i alarmem na Telegramie).*
