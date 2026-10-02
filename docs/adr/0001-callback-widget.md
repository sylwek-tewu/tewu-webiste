# ADR 0001: Implementacja widżetu call-back „Bezpłatna wycena – oddzwonimy”

## Status
Zaakceptowany (Accepted)

## Kontekst
Strona Biura Rachunkowego TEWU (tewu.szczecin.pl) kieruje dziś ruch z przycisków „Bezpłatna wycena” na podstronę `/kontakt`, gdzie znajdują się wyłącznie numery telefonów oraz adresy e-mail. Biuro pracuje od poniedziałku do piątku w godzinach 8:00–16:00. Poza tymi godzinami oraz w dni wolne od pracy użytkownik nie ma możliwości pozostawienia prośby o kontakt.

Wycena usług w TEWU jest indywidualna i powstaje w rozmowie. Strona nie liczy ceny i nie zbiera szczegółów działalności. Celem jest wdrożenie lekkiego, autorskiego widżetu call-back („Oddzwonimy”), który stanie się głównym punktem konwersji przed startem kampanii Google Ads, bez ponoszenia kosztów zewnętrznych narzędzi (np. CallPage, 150–400 zł/mies.) i bez naruszania prywatności użytkowników skryptami śledzącymi.

## Decyzje architektoniczne i projektowe

### 1. Punkty wejścia i prezentacja UI
- **Punkty wejścia na stronie:**
  - Przyciski „Bezpłatna wycena” w `Navbar` (desktop oraz Drawer mobile) otwierają modal widżetu (przekazując `source: 'header'`), zachowując `href="/kontakt"` jako graceful degradation.
  - Główny przycisk CTA w `Hero` („Skontaktuj się z nami”) oraz w `ServicesClient` („Umów się na konsultację”) pozostają standardowymi linkami do `/kontakt`.
  - Globalny pływający element (`source: 'floating'`) obecny na wszystkich stronach serwisu.
- **Prezentacja pływającego widżetu:**
  - **Desktop:** Pływający zaokrąglony przycisk ze słuchawką i tekstem w prawym dolnym rogu ekranu, z konfigurowalnym offsetem dolnym (aby w przyszłości nie kolidował z banerem Cookiebot).
  - **Mobile (~375 px):** Przyklejony przy dolnej krawędzi pasek akcji (`safe-area-inset-bottom` + offset cookies) z dwoma przyciskami:
    1. „Zadzwoń” – widoczny/aktywny wyłącznie w dni robocze w godz. 8:00–16:00 (numer z `NEXT_PUBLIC_CALLBACK_CALL_NUMBER`, domyślnie stacjonarny `+48914824190`),
    2. „Oddzwońcie” – otwiera formularz wyceny w panelu dolnym / modalu.

### 2. Pola formularza i walidacja
- **Pola:**
  - Numer telefonu (wymagany): akceptacja formatów polskich (9 cyfr normalizowane do E.164 `+48XXXXXXXXX`) oraz poprawnych numerów międzynarodowych z prefiksem `+`.
  - Preferowana pora kontaktu:
    - `asap` („Jak najszybciej”),
    - `8-12` („8:00–12:00”),
    - `12-16` („12:00–16:00”),
    - `17-18` („17:00–18:00” – dyżur telefoniczny po godzinach biura, z informacją pomocniczą pod wyborem).
  - Temat zapytania (opcjonalny): spółka / fundacja lub stowarzyszenie / działalność gospodarcza / kadry i płace / inne.
  - Klauzula RODO: zwięzła notka informacyjna nad przyciskiem wyślij z linkiem do `/polityka-prywatnosci` (bez konieczności zaznaczania checkboxa, art. 6 ust. 1 lit. b RODO).
  - Antyspam: niewidoczne pole-pułapka (honeypot) oraz time-trap (odrzucenie zgłoszeń przesłanych szybciej niż 2 sekundy od otwarcia formularza). Brak zewnętrznych captcha/reCAPTCHA.

### 3. Logika godzin pracy i kalkulacji dni roboczych
- Wszystkie obliczenia czasu wykonywane w strefie `Europe/Warsaw` (odporność na środowisko serwerowe Netlify działające w UTC).
- Logika świąt zportowana z forka biblioteki `mtk3d/poland-public-holidays` (gałąź `feature/add-christmas-eve`, commit `4ad14bc536051155a81b25b3cda7e76ecf41cfaa`, licencja MIT Kamila Szydłowskiego). Obsługuje stałe święta (w tym Wigilię 24 XII) oraz święta ruchome (Wielkanoc, Poniedziałek Wielkanocny, Boże Ciało, Zielone Świątki).
- Dodatkowe dni wolne (`EXTRA_CLOSED_DATES`) konfigurowane w pliku konfiguracyjnym oraz opcjonalnie nadpisywane/uzupełniane zmienną środowiskową `EXTRA_CLOSED_DATES` (lista `YYYY-MM-DD` po przecinku).
- Funkcja `getCallbackMessage(slot, now)` wylicza obietnicę kontaktu:
  - Dla przedziałów: bufor min. 15 minut przed końcem slotu (np. dla `17-18` do godz. 17:45 w dzień roboczy → „Oddzwonimy dziś w godzinach 17:00–18:00”, później lub w dni wolne → „Oddzwonimy w najbliższym dniu roboczym w godzinach 17:00–18:00”).
  - Dla `asap`: w godz. 8:00–16:00 w dzień roboczy → „Oddzwonimy jak najszybciej, w godzinach pracy biura (pn–pt 8:00–16:00)”, poza godzinami lub w dni wolne → „Biuro jest teraz zamknięte. Oddzwonimy w najbliższym dniu roboczym od 8:00.”

### 4. Powiadomienia backendowe i odporność na awarie (Netlify Blobs Outbox)
- Endpoint: `POST /api/callback` (App Router, funkcja serverless).
- Każde zgłoszenie otrzymuje krótki unikalny identyfikator: 6 znaków szesnastkowych (np. `#C9F1A2`).
- **Podwójny kanał powiadomień:**
  1. **E-mail (SMTP / Nodemailer):** niesie pełne dane zgłoszenia wraz z numerem telefonu.
  2. **Telegram Bot API:** wysyła wyłącznie krótki ping **bez danych osobowych** (`#ID`, pora, temat, źródło, znacznik czasu). Brak numeru telefonu chroni przed wyciekiem PII do komunikatora zewnętrznego.
- **Zasada sukcesu i bufor awaryjny (Netlify Blobs):**
  - E-mail wysłany pomyślnie → sukces (200), Telegram dostaje ping (awaria Telegrama nie blokuje sukcesu użytkownika).
  - Awaria e-maila → zgłoszenie jest zapisywane w buforze awaryjnym `@netlify/blobs` (store `callback-outbox`, klucz `#ID`). Pole `phone` szyfrowane algorytmem AES-256-GCM za pomocą `OUTBOX_ENCRYPTION_KEY`. Użytkownik otrzymuje kod 200 i normalne potwierdzenie, a Telegram otrzymuje alarm bez PII o kolejkowaniu zgłoszenia.
  - Awaria e-maila ORAZ awaria bufora Blobs → użytkownik otrzymuje błąd 502 z bezpośrednim numerem telefonu biura, a Telegram otrzymuje alarm o awarii.
- **Ponawianie i retencja:**
  - Zaplanowana funkcja Netlify Scheduled Function (`netlify/functions/process-outbox.mts` z cronem `*/10 * * * *`) co 10 minut wznawia wysyłkę e-maili z bufora. Po udanej wysyłce wpis jest natychmiast usuwany.
  - Zgłoszenia starsze niż `CALLBACK_OUTBOX_TTL_HOURS` (domyślnie 72 godziny) są bezpowrotnie usuwane z wysłaniem alarmu na Telegram.

### 5. Analityka, RODO i standaryzacja danych
- `window.dataLayer.push`:
  - `callback_widget_open` (`source: 'header' | 'floating'`),
  - `callback_request_submit` (`source`, `topic`, `time_slot`, `delivery: 'direct' | 'buffered'`). Brak PII.
- Nowa podstrona `/polityka-prywatnosci` opisująca administratora (Biuro Rachunkowe TEWU Sp. z o.o.), cele, podstawy prawne, brak przekazywania numerów do Telegrama, retencję bufora Blobs (72h), DPA z Netlify oraz placeholdery pod weryfikację prawną i sekcję cookies.
- Ujednolicenie wszystkich numerów telefonów w serwisie do formatu `tel:+48…` oraz adresów e-mail do `mailto:`.
- Usunięcie nieużywanego katalogu `biuro-rachunkowe-tewu-2026-prototype/`.

### 6. Narzędzia i jakość kodu
- Dodanie Vitest do testów jednostkowych logiki biznesowej, godzin, świąt i endpointu.
- Konfiguracja ESLint kompatybilna z Next 16 i TypeScript.
- Dodanie `netlify.toml` z integracją `@netlify/plugin-nextjs`.

## Konsekwencje
- **Pozytywne:**
  - Klienci mogą wygodnie zamawiać rozmowę o dowolnej porze, także po godzinach i w święta.
  - Pełna zgodność z RODO (minimalizacja danych w Telegramie, szyfrowany bufor awaryjny o krótkim TTL).
  - Brak kosztów abonamentowych narzędzi zewnętrznych i brak obciążania strony trackerami.
  - Bezpieczeństwo i niezawodność dzięki awaryjnemu buforowaniu w Netlify Blobs.
- **Wymagania operacyjne dla właściciela:**
  - Konfiguracja zmiennych środowiskowych w Netlify: SMTP (`CALLBACK_SMTP_*`), Telegram (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`), `OUTBOX_ENCRYPTION_KEY`, opcjonalnie `NEXT_PUBLIC_CALLBACK_CALL_NUMBER`.
  - Weryfikacja treści szkicu polityki prywatności przez radcę/prawnika biura.

## Zmiany po przeglądzie kodu (2026-10-03)

### Polityka prywatności – decyzja właściciela
Właściciel serwisu zdecydował (commit `622cf18`), że opublikowana treść `/polityka-prywatnosci` odbiega od sekcji 5 tego ADR:
- usunięty baner „szkic do weryfikacji prawnej” – treść jest traktowana jako wersja docelowa,
- usunięta sekcja o Telegramie (brak danych osobowych w powiadomieniach) – zasada nadal obowiązuje w kodzie, ale nie jest opisywana w polityce,
- usunięte `TODO` dotyczące regionu Netlify Blobs i podstawy przekazania danych poza EOG,
- umowa powierzenia (DPA) z Netlify i szyfrowanie bufora AES-256-GCM są opisane jako fakty.

Konsekwencje dla kodu: deklaracja szyfrowania jest wymuszana – na produkcji brak `OUTBOX_ENCRYPTION_KEY` blokuje zapis do bufora (zamiast zapisu numeru jawnym tekstem). Okres retencji w polityce jest pobierany z `CALLBACK_OUTBOX_TTL_HOURS` podczas kompilacji, więc tekst i zachowanie bufora pozostają spójne.

### Pozostałe zmiany
- **Time-trap:** przeglądarka wysyła czas wypełniania formularza (`elapsedMs`) mierzony własnym zegarem; serwer nie porównuje już swojego zegara z zegarem odwiedzającego. Brak `elapsedMs` = zgłoszenie odrzucane po cichu. Formularz wysłany szybciej niż w 2 s (np. z autouzupełnieniem) czeka w przeglądarce do upływu 2 s, więc prawdziwy klient nigdy nie wpada w pułapkę. Odpowiedzi pułapek antyspamowych nie zawierają pola `delivery`, więc widżet nie wysyła dla nich zdarzenia `callback_request_submit`.
- **Pola `topic` i `source`:** przyjmowane tylko z zamkniętych list (`CALLBACK_TOPICS`, `CALLBACK_SOURCES`); nieznany temat jest pomijany, nieznane źródło zapisywane jako `unknown`. Wartości w HTML e-maila są escapowane.
- **Walidacja numeru telefonu:** biblioteka `libphonenumber-js`. API (i numer „Zadzwoń”, wyliczany na serwerze w layoucie i przekazywany do widżetu) używa pełnych metadanych `max`, które odrzucają m.in. nieprzydzielone polskie prefiksy. Formularz w przeglądarce używa mniejszych metadanych `min` jako wstępnej kontroli – nieliczne numery przepuszczone przez nią odrzuca API (400).
- **Brak konfiguracji SMTP:** endpoint zwraca 500 z numerem biura i alarmem na Telegram, zamiast buforować zgłoszenia, które nie mogłyby zostać wysłane.
- **Budżet czasu odpowiedzi:** e-mail i ping Telegram ≤ 5 s, zapis do bufora ≤ 2 s, alarm ≤ 1,5 s – razem poniżej domyślnego limitu 10 s funkcji Netlify. Limity czasu SMTP (połączenie 2 s, powitanie 1,5 s, gniazdo 3 s) są krótsze niż budżet, żeby wolny serwer poczty nie doręczył e-maila już po zbuforowaniu zgłoszenia (co dałoby duplikat).
- **Bufor awaryjny:** na produkcji zawsze Netlify Blobs (brak kontekstu Blobs = błąd 502 zamiast utraty danych w pamięci); wpisy, których nie da się odszyfrować (np. po zmianie klucza), są usuwane z alarmem; przejściowe błędy odczytu/zapisu (sieć, Blobs 5xx) zostawiają wpis do następnego przebiegu i nie przerywają przetwarzania pozostałych; zaplanowana funkcja zawsze używa Netlify Blobs (nie zależy od `NODE_ENV`); ponowienia z rosnącą przerwą (10, 20, 40, 80 min, potem co 2 h) aż do upływu TTL; niepoprawne lub niecałkowite `CALLBACK_OUTBOX_TTL_HOURS` → domyślne 72 h.
- **Dodatkowe dni wolne:** zmienna przemianowana na `NEXT_PUBLIC_EXTRA_CLOSED_DATES`, bo komunikat o terminie i przycisk „Zadzwoń” są liczone w przeglądarce. Zmiana wymaga ponownego deployu.
- **Formularz ładowany leniwie** (`React.lazy`) przy pierwszym otwarciu widżetu, z komunikatem „Ładowanie formularza…”; gdy pobranie się nie powiedzie (offline, stara karta po deployu), widżet pokazuje numer biura; na mobile strona ma dolny margines równy wysokości paska, by nie zasłaniał stopki.

### Wymagania operacyjne (aktualizacja)
- `OUTBOX_ENCRYPTION_KEY` jest wymagany na produkcji.
- `EXTRA_CLOSED_DATES` → `NEXT_PUBLIC_EXTRA_CLOSED_DATES`.
