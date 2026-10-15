# ADR 0003: Migracja hostingu z platformy Netlify na VPS w OVHcloud (Coolify) i bufor SQLite (Drizzle ORM)

## Status
Zaakceptowany (Accepted)

## Kontekst
Dotychczas serwis Biura Rachunkowego TEWU wdrażany był na platformie Netlify. Wiązało się to z kilkoma istotnymi ograniczeniami:
1. **Zależność od technologii dostawcy (vendor lock-in):** Awaryjny bufor zgłoszeń call-back opierał się na usłudze `@netlify/blobs`, a ponawianie wysyłki – na funkcji harmonogramu `netlify/functions/process-outbox.mts`.
2. **Kwestie RODO i lokalizacja danych:** Funkcje serverless Netlify oraz bufor Blobs domyślnie przetwarzały żądania w regionie US East (USA), co wymuszało powoływanie się w Polityce Prywatności na ramy *EU-US Data Privacy Framework* i deklarowanie transferu danych poza Europejski Obszar Gospodarczy.
3. **Koszty i elastyczność:** Przejście na własny serwer wirtualny VPS w OVHcloud zarządzany przez platformę Coolify zapewnia pełną suwerenność technologiczną, niezależność od zewnętrznych limitów serverless oraz gwarantuje, że hosting serwisu i bufor zgłoszeń znajdują się na terenie EOG.

## Decyzje architektoniczne i projektowe

### 1. Konteneryzacja i tryb Next.js Standalone
- Aplikacja Next.js kompilowana jest z flagą `output: 'standalone'` oraz jawnym `outputFileTracingRoot`.
- Wdrożono wieloetapowy `Dockerfile` oparty o `node:24-alpine`:
  - **Etap deps:** instalacja zależności (`pnpm install --frozen-lockfile`, wersja pnpm przypięta polem `packageManager`) wraz z narzędziami kompilacji (`python3`, `make`, `g++`), których skrypt instalacyjny `better-sqlite3` (`node-gyp rebuild`, dopuszczony w `allowBuilds`) używa do zbudowania natywnego modułu.
  - **Etap builder:** kompilacja produkcyjna Next.js (`pnpm build`). Zmienne odczytywane podczas kompilacji (`CALLBACK_OUTBOX_TTL_HOURS` – okres w statycznej polityce prywatności, `NEXT_PUBLIC_*`) przekazywane są jako `ARG` (w Coolify: *Build Variable*).
  - **Etap runner:** minimalny obraz uruchomieniowy działający z uprawnieniami nieuprzywilejowanego użytkownika `nextjs` (UID 1001), z zainstalowaną biblioteką współdzieloną `libstdc++`.
- **Alpine to świadomy wybór (październik 2026):** przy przenoszeniu CI na runner `ubuntu-26.04` rozważono oparcie obrazu o `ubuntu:26.04` i pozostawiono `node:24-alpine`. System runnera CI i system obrazu produkcyjnego są od siebie niezależne. Zmierzony obraz na Ubuntu był większy (450 MB zamiast 348 MB) i zawierał 97 pakietów systemowych zamiast 18. Ubuntu 26.04 dostarcza Node.js 22, więc Node.js 24 trzeba było kopiować z innego obrazu. Różnice w zużyciu pamięci i czasie odpowiedzi były pomijalne przy ruchu tej strony.
  - Akceptowany koszt: CI testuje kod na glibc, a produkcja działa na musl, którego obsługę Node.js oznacza jako *Experimental*. Moduł `better-sqlite3` kompilowany jest podczas budowania obrazu, więc błąd kompilacji przerywa wdrożenie, a błąd otwarcia bazy przy starcie jest logowany i zgłaszany na Telegram (sekcja 2).
  - Do ponownego rozważenia, jeżeli któraś zależność natywna nie zadziała na musl. Wtedy prostszą alternatywą dla Ubuntu jest oficjalny obraz `node:24-slim` (Debian, glibc).
- Port aplikacji: standardowy 3000, zarządzany za pośrednictwem wbudowanego w Coolify reverse proxy (Traefik / Caddy) z automatyczną obsługą certyfikatów Let's Encrypt SSL.

### 2. Silnik bufora awaryjnego: Drizzle ORM + SQLite (`better-sqlite3`)
- Zastąpiono `@netlify/blobs` lokalną bazą danych SQLite zarządzaną przez `drizzle-orm` oraz `drizzle-kit`.
- Schemat bazy danych (`src/db/schema.ts`):
  - `outbox_records`: unikalny klucz zgłoszenia (`id`), zaszyfrowany numer telefonu (`phone`, algorytm AES-256-GCM), slot, temat, źródło, język, znacznik czasu `createdAt`, liczba prób i data ostatniej próby.
  - `outbox_meta`: przechowuje stan ograniczenia częstotliwości powiadomień technicznych (rate limiting alertów o błędach magazynu lub braku klucza szyfrowania, zastępując dawny store `callback-outbox-meta`).
- Lokalizacja bazy danych: domyślnie `/app/data/outbox.db` w kontenerze, mapowane w Coolify jako trwały wolumen dyskowy (Persistent Storage). Ścieżka może być nadpisana zmienną środowiskową `OUTBOX_DB_PATH`.
- **Automatyczne migracje:** Przy starcie serwera (`src/instrumentation.ts`) otwierane jest połączenie z bazą i uruchamiana funkcja `runMigrations()` oparta o migrator Drizzle (`drizzle-orm/better-sqlite3/migrator`), co zapewnia bezobsługową inicjalizację bazy na nowo uruchomionych wolumenach VPS bez konieczności ręcznego wykonywania poleceń CLI. Połączenie staje się domyślne dopiero po udanej migracji; błąd (np. brak katalogu migracji, brak uprawnień do wolumenu) jest logowany i zgłaszany na Telegram, a kolejne użycie bazy ponawia próbę.
- **Trwałe usuwanie:** baza działa z `secure_delete = ON` i `journal_size_limit = 0`, a każde usunięcie wpisu kończy się `wal_checkpoint(TRUNCATE)`, więc usunięte zgłoszenie nie pozostaje w wolnych stronach pliku bazy ani w pliku WAL (zgodnie z „bezpowrotnym usunięciem” w polityce prywatności).
- **Brak podwójnej wysyłki:** przed każdą próbą wysyłki przebieg „zajmuje” wpis atomową instrukcją `UPDATE … WHERE id = ? AND attempts = ?` (`OutboxStore.claim`). Wysyła tylko przebieg, który zajął wpis, a nieudana próba nie wymaga już zapisu, który mógłby odtworzyć wpis usunięty przez inny przebieg. Dodatkowo endpoint pomija przebieg (kod 200, `{"status":"skipped","reason":"run-in-progress"}`, aby zadanie w Coolify nie było oznaczane jako nieudane), gdy poprzedni w tym samym procesie jeszcze trwa, a każda ponowna wysyłka ma twardy limit czasu (30 s).

### 3. Harmonogram przetwarzania bufora (zastąpienie Netlify Scheduled Functions)
- Wdrożono dedykowany wewnętrzny punkt końcowy: `POST /api/internal/process-outbox`.
- **Bezpieczeństwo:** Endpoint chroniony jest tokenem przekazywanym w nagłówku `Authorization: Bearer <CRON_SECRET>` (lub `x-cron-secret`). Na środowisku produkcyjnym brak skonfigurowanej zmiennej `CRON_SECRET` blokuje wykonanie z kodem 500 (fail-safe).
- **Wyzwalanie:** W Coolify konfigurowane jest cykliczne zadanie (Scheduled Task) wykonujące żądanie HTTP co 10 minut (`*/10 * * * *`). Zadanie działa wewnątrz kontenera aplikacji, a obraz `node:24-alpine` nie zawiera `curl`, dlatego używany jest `wget` z BusyBox:
  ```bash
  wget -qO- --post-data='' --header="Authorization: Bearer $CRON_SECRET" http://127.0.0.1:3000/api/internal/process-outbox
  ```
- Endpoint zwraca szczegółowy obiekt JSON `ProcessResult` (liczba przetworzonych, wysłanych, przeterminowanych, uszkodzonych i błędnych wpisów) i zapisuje go jedną linią w logach aplikacji (same liczby, bez danych osobowych). Nieudany przebieg (np. niedostępna baza) zgłaszany jest alarmem na Telegram.

### 3a. Hasło do Preview Deployment
- Coolify pozwala chronić hasłem (HTTP Basic Auth) tylko całą aplikację – razem z Production Deployment albo wcale. Dlatego hasło do Preview Deployment (wdrożenia pull requesta pod `<nr PR>.<domena>`) sprawdza aplikacja w `src/proxy.ts` (`src/lib/preview-auth.ts`).
- Ochronę włącza zmienna `PREVIEW_BASIC_AUTH` (`uzytkownik:haslo`, runtime), ustawiona w Coolify wyłącznie jako zmienna Preview. Bez niej strona jest publiczna – brak zmiennej oznacza otwarty podgląd (fail-open), w zamian za brak zależności od wewnętrznych zmiennych Coolify.
- Hasła wymaga każda ścieżka: podstrony, `/api/*` (preview ma prawdziwe dane SMTP, więc otwarte `/api/callback` pozwalałoby wysyłać zgłoszenia do biura) i pliki statyczne. Wyjątki: `/api/health` (healthcheck kontenera `HEALTHCHECK` w `Dockerfile`, tylko żywotność procesu, bez bazy) oraz `/api/internal/*` (chronione `CRON_SECRET`; oba mechanizmy używają nagłówka `Authorization`).
- Szablon adresu preview w Coolify (*Preview URL Template*) należy ustawić na sztywno na `{{pr_id}}.test-tewu-website.projekty-tewu.it` najpóźniej przy przepięciu aplikacji na `tewu.szczecin.pl`. Domyślny `{{pr_id}}.{{domain}}` przeniósłby podglądy do domeny klienta (wildcard DNS, wspólne ciasteczka).
- Odpowiedzi po zalogowaniu mają nagłówki pozwalające na cache współdzielony (`s-maxage`, `public` dla `_next/static`). Dziś przed aplikacją stoi tylko Traefik bez cache, ale dodanie CDN lub proxy z cache wymagałoby wyłączenia cache dla preview, inaczej podgląd byłby dostępny bez hasła.

### 3b. Domeny i stałe przekierowania (ręczne etykiety Traefika)
- Production Deployment ma domeny `https://tewu.szczecin.pl` i `https://www.tewu.szczecin.pl` z ustawieniem *Redirect* „non-www” (od 13.10.2026).
- Coolify generuje przekierowania `http` → `https` i `www` → domena główna jako tymczasowe (307). Dla SEO i kampanii Ads potrzebne są stałe przekierowania w jednym skoku, z zachowaniem ścieżki i parametrów. Dlatego etykiety Traefika aplikacji poprawiono ręcznie:
  - middleware `vove4fk84fv8vr6plcgwrgeo-to-https` (`redirectscheme`, `permanent=true`) na routerze `http-0`;
  - middleware `1-vove4fk84fv8vr6plcgwrgeo-to-non-www` (`redirectregex`, `permanent=true`, `replacement=https://${2}`) na routerach `http-1` i `https-1`, więc `http://www…` trafia na `https://tewu.szczecin.pl/…` jednym przekierowaniem 301.
- Wspólnego middleware `redirect-to-https` nie zmieniano. Definiują go wszystkie aplikacje na serwerze, więc zmiana w jednej powodowałaby konflikt w Traefiku.
- Żeby Coolify nie nadpisywał tych etykiet, w aplikacji wyłączono *Readonly labels*.
- Aplikacja ma własne zabezpieczenia na wypadek utraty etykiet (`next.config.mjs`):
  - przekierowanie 308 z `www.tewu.szczecin.pl` na domenę główną;
  - nagłówek `X-Robots-Tag: noindex` dla każdego hosta innego niż dokładnie `tewu.szczecin.pl`.

  Przekierowania `http` → `https` aplikacja nie przejmuje, bo nie widzi schematu połączenia z przeglądarką.

**Ryzyko:** etykiety są stanem ręcznym, którego nie ma w repozytorium.
- **Zmiana domen, ustawienia *Redirect* albo ponowne włączenie *Readonly labels*:** Coolify generuje etykiety od nowa i usuwa poprawki. Przekierowania wracają wtedy do 307 albo przestają działać.
- **Zmiana nazw routerów lub UUID aplikacji** (np. przy odtworzeniu aplikacji) wymaga dopasowania nazw middleware w etykietach.
- **Etykiety nie mogą zmieniać nagłówka `Host` przekazywanego do aplikacji.** `X-Robots-Tag: noindex` zależy od `Host`. Gdyby proxy przepisywało go na inną wartość, produkcja dostałaby `noindex` i wypadłaby z indeksu.

### 3c. HTTP/3 i wymagany port UDP/443
- Proxy Coolify (Traefik) ma domyślnie włączone HTTP/3. Nasłuchuje na `443/udp` i w każdej odpowiedzi wysyła nagłówek `alt-svc: h3=":443"; ma=2592000`. Przeglądarka zapamiętuje go na 30 dni i kolejne połączenia próbuje nawiązać przez QUIC (UDP).
- Dlatego port **UDP/443 musi być otwarty na obu poziomach**:
  - **lokalny firewall VPS:** w ufw reguła `443/udp ALLOW`. Porty publikowane przez Dockera omijają reguły ufw i przechodzą przez łańcuchy `DOCKER` i `DOCKER-USER`, więc reguła blokująca w `DOCKER-USER` też odcina UDP/443;
  - **Edge Network Firewall OVH** dla adresu IP serwera (panel OVHcloud → Network → IP): reguła `permit udp` na port 443 przed końcową regułą `deny`. Reguły przepuszczające tylko TCP 80/443 blokują HTTP/3, choć strona przez HTTP/1.1 i HTTP/2 działa normalnie.
- **Skutek blokady:** gdy HTTP/3 jest ogłaszane, a pakiety UDP/443 są po cichu gubione (DROP), Chrome i Firefox wracają do TCP, ale Safari może w ogóle nie otworzyć strony.
- Wyłączenie HTTP/3 w Traefiku nie jest równoważną poprawką: przeglądarki, które zapamiętały `alt-svc`, próbują HTTP/3 jeszcze do 30 dni. Jeśli HTTP/3 ma zostać wyłączone, UDP/443 trzeba odrzucać z odpowiedzią (REJECT), a nie gubić (DROP), żeby przeglądarka od razu wróciła do TCP.

**Incydent z 15.10.2026: strona nie otwierała się w Safari.**
- Przez TCP strona działała, a silnik WebKit (Playwright, profile desktop i iPhone) renderował ją bez błędów. Połączenie HTTP/3 z zewnątrz kończyło się timeoutem, a kontrolne połączenia HTTP/3 do innych serwisów działały.
- Na serwerze konfiguracja była poprawna: `coolify-proxy` z HTTP/3 i portem `443/udp`, ufw z `443/udp ALLOW`, a `DOCKER-USER` i nftables nie blokowały UDP/443.
- Pakiety gubił **Edge Network Firewall OVH**. Przy włączonym firewallu `tcpdump` na interfejsie serwera nie pokazywał żadnych pakietów UDP/443, a licznik reguły DNAT `udp dpt:443` stał na 0. Po wyłączeniu firewalla pakiety dochodziły i QUIC działał.
- Reguła `permit udp` na port 443, dodana przed regułą `deny`, miała w API OVH stan `ok`, ale nie była stosowana, także po wyłączeniu i ponownym włączeniu firewalla. Zgłoszono to do supportu OVH.
- **Stan tymczasowy:** Edge Network Firewall OVH jest **wyłączony** (reguły bez zmian). Serwer chroni ufw (domyślnie `deny`) i `DOCKER-USER`, który blokuje porty 8000, 8080, 6001 i 6002 z zewnątrz. Po odpowiedzi OVH firewall trzeba włączyć i powtórzyć test z punktu 6 wymagań operacyjnych.
- Diagnostyka na serwerze: `tcpdump -ni <interfejs> udp port 443` oraz licznik `iptables -t nat -L DOCKER -v -n -x | grep 'udp dpt:443'`. Jeśli pakiety nie dochodzą do interfejsu, blokada jest przed serwerem.
- Zgłaszający jeszcze nie potwierdził, że Safari działa. Nie znamy też komunikatu błędu ani wersji systemu.

### 4. Polityka Prywatności i zgodność z RODO
- Zaktualizowano treści polityki w języku polskim i ukraińskim (`src/i18n/pl.ts`, `src/i18n/uk.ts`, `PrivacyPolicyClient.tsx`):
  - Wskazano hostingodawcę: **OVHcloud – OVH Sp. z o.o. (Wrocław)**, strona umowy powierzenia (DPA), z infrastrukturą w centrum danych w EOG.
  - **Usunięto sekcję dotyczącą transferu danych do USA** oraz odwołania do *EU-US Data Privacy Framework* – serwer i baza bufora znajdują się na terenie Europejskiego Obszaru Gospodarczego. Deklaracja w polityce obejmuje wyłącznie hosting i bufor awaryjny (dane z formularza); usługi zewnętrzne osadzane na stronie zostaną opisane osobno.
  - Bufor awaryjny opisano jako lokalną, szyfrowaną bazę danych na serwerze o retencji do 72 godzin (zgodnie z `CALLBACK_OUTBOX_TTL_HOURS`).
  - Określono retencję logów serwera i aplikacji na 7 dni. Docker nie usuwa logów po czasie, dlatego retencję zapewnia konfiguracja logrotate na serwerze VPS (`deploy/logrotate/docker-containers`).

### 5. Likwidacja zależności od Netlify
- Usunięto pakiet `@netlify/blobs` z `package.json`.
- Usunięto plik konfiguracyjny `netlify.toml` oraz wtyczkę `@netlify/plugin-nextjs`.
- Usunięto katalog `netlify/` wraz z funkcją `process-outbox.mts`.
- Zaktualizowano zestaw testów jednostkowych i integracyjnych (Vitest).

## Konsekwencje

### Pozytywne
- **Prywatność i RODO:** Hosting i bufor awaryjny nie przekazują danych z formularza poza Europejski Obszar Gospodarczy.
- **Odporność i brak vendor lock-in:** Aplikacja działa jako w 100% standardowy kontener Docker możliwy do uruchomienia na dowolnym serwerze VPS / chmurze.
- **Trwałość danych:** SQLite w trybie WAL na wolumenie trwałym zapewnia niezawodne, transakcyjne kolejkowanie zgłoszeń w przypadku awarii SMTP.
- **Determinizm środowiska:** Standalone Next.js z Drizzle ORM eliminuje narzut i nieprzewidywalność platform serverless.

### Wymagania operacyjne dla wdrożenia w Coolify
0. **Lokalizacja VPS:** serwer musi znajdować się w centrum danych OVHcloud na terenie EOG (np. WAW, GRA, SBG, RBX, DE) i być zamówiony u OVH Sp. z o.o. – na tym opiera się deklaracja w polityce prywatności. Zmiana regionu lub dostawcy wymaga aktualizacji polityki.
1. **Konfiguracja wolumenu (Persistent Storage):** Zamontować wolumen zarządzany Dockera (Named Volume) lub katalog hosta do ścieżki kontenera `/app/data` (w przypadku korzystania z bind mountu katalog na hoście musi posiadać uprawnienia do zapisu dla UID 1001: `chown -R 1001:1001 <sciezka>`).
2. **Zmienne środowiskowe:** Ustawić zmienne w Coolify:
   - `CRON_SECRET` – silny losowy token autoryzacyjny dla crona,
   - `OUTBOX_ENCRYPTION_KEY` – 32-bajtowy klucz szyfrowania danych osobowych w buforze SQLite,
   - Standardowe zmienne SMTP (`CALLBACK_SMTP_*`, `CALLBACK_FROM`, `CALLBACK_TO`) oraz opcjonalne zmienne Telegrama (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`).
   - `CALLBACK_OUTBOX_TTL_HOURS`, `NEXT_PUBLIC_CALLBACK_CALL_NUMBER`, `NEXT_PUBLIC_EXTRA_CLOSED_DATES` – oznaczone jako *Build Variable*.
   - `PREVIEW_BASIC_AUTH` – tylko w sekcji zmiennych Preview (sekcja 3a); HTTP Basic Auth w ustawieniach aplikacji Coolify pozostaje wyłączone, a *Preview URL Template* wskazuje domenę `test-tewu-website.projekty-tewu.it`. Ścieżka healthchecka Coolify (jeśli zostanie włączony) to `/api/health`.
3. **Konfiguracja Scheduled Task:** Dodać w Coolify zadanie cron z interwałem `*/10 * * * *` wywołujące `POST /api/internal/process-outbox` poleceniem `wget` (powyżej) i jednorazowo uruchomić je ręcznie, aby sprawdzić wynik.
4. **Retencja logów:** Zainstalować na VPS `deploy/logrotate/docker-containers` w `/etc/logrotate.d/` (usuwanie logów kontenerów po 7 dniach).
5. **Etykiety Traefika (sekcja 3b):** po każdej zmianie domen, ustawienia *Redirect* lub *Readonly labels* w Coolify ponownie nanieść ręczne middleware i sprawdzić:
   - `curl -sI http://www.tewu.szczecin.pl/uslugi/kpir?utm_source=test` → jedno `301` na `https://tewu.szczecin.pl/uslugi/kpir?utm_source=test`;
   - `curl -sI http://tewu.szczecin.pl/` → `301` na `https://tewu.szczecin.pl/`;
   - `curl -sI https://tewu.szczecin.pl/` → `200` **bez** `x-robots-tag`.
6. **HTTP/3 (sekcja 3c):** po każdej zmianie lokalnego firewalla, Edge Network Firewall OVH lub konfiguracji proxy sprawdzić z maszyny spoza serwera (z samego VPS test przejdzie mimo blokady na Edge Network Firewall OVH):
   - `docker run --rm alpine/curl-http3 curl -sS --http3-only -o /dev/null --max-time 15 -w '%{http_version}\n' https://tewu.szczecin.pl/` → `3`; timeout oznacza, że UDP/443 jest po drodze blokowany.
