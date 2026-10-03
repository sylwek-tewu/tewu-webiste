# Biuro Rachunkowe TEWU

A modern web application for "Biuro Rachunkowe TEWU Sp. z o.o.", an accounting office in Szczecin, offering comprehensive accounting, HR, and tax advisory services.

## Tech Stack

- **Framework**: [Next.js 16 (App Router / Turbopack)](https://nextjs.org/)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **UI Component Library**: [Mantine UI v8](https://mantine.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Hosting & Serverless**: [Netlify](https://www.netlify.com/) (Next.js Runtime + Netlify Blobs + Scheduled Functions)
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
  - **Bufor awaryjny (Netlify Blobs)**: w razie awarii serwera pocztowego zgłoszenie trafia do szyfrowanego bufora (AES-256-GCM), a zaplanowana funkcja Netlify ponawia wysyłkę z rosnącą przerwą (10, 20, 40, 80 min, potem co 2 h) do upływu `CALLBACK_OUTBOX_TTL_HOURS` (domyślnie 72 godziny).
  - Analityka: zdarzenia `callback_widget_open` i `callback_request_submit` przekazywane do `window.dataLayer` (bez danych osobowych).
- **Service Listings**: Szczegółowe opisy usług księgowych (pełna księgowość, KPiR, ryczałt, kadry i płace, ZUS/US).
- **Certificate Showcase**: Galeria certyfikatów z wbudowaną przeglądarką PDF.
- **Podstrona Polityki Prywatności (`/polityka-prywatnosci`)**: Zgodna z RODO, opisująca cele, podstawy, retencję bufora w Blobs (wartość z `CALLBACK_OUTBOX_TTL_HOURS`), DPA z Netlify i szyfrowanie bufora.
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
| `CALLBACK_SMTP_PORT` | Tak | Port SMTP (587 dla STARTTLS, 465 dla SSL) | `587` |
| `CALLBACK_SMTP_USER` | Tak | Nazwa użytkownika / login konta pocztowego | `biuro@tewu.szczecin.pl` |
| `CALLBACK_SMTP_PASS` | Tak | Hasło konta pocztowego | `tajne-haslo` |
| `CALLBACK_FROM` | Tak | Nagłówek nadawcy wiadomości e-mail | `"Biuro TEWU <biuro@tewu.szczecin.pl>"` |
| `CALLBACK_TO` | Tak | Adres(y) odbiorcy powiadomień w biurze | `biuro@tewu.szczecin.pl` |
| `NEXT_PUBLIC_CALLBACK_CALL_NUMBER` | Nie | Numer pod przyciskiem „Zadzwoń” (mobile) w formacie E.164. Domyślnie stacjonarny biura. *(Wymaga ponownego deployu na Netlify po zmianie)* | `+48914824190` lub `+48501482555` |
| `TELEGRAM_BOT_TOKEN` | Nie | Token bota z @BotFather (opcjonalny ping bez PII) | `123456789:ABC...` |
| `TELEGRAM_CHAT_ID` | Nie | ID czatu lub grupy biura na Telegramie | `-1001234567890` |
| `OUTBOX_ENCRYPTION_KEY` | Tak (produkcja) | Klucz szyfrowania danych w Netlify Blobs (AES-256-GCM). Bez niego bufor awaryjny nie przyjmie zgłoszenia. Zmiana klucza usuwa oczekujące wpisy (z alarmem); brak klucza wstrzymuje ponawianie bez usuwania (alarm) | `losowy-32-bajtowy-klucz` |
| `CALLBACK_OUTBOX_TTL_HOURS` | Nie | Czas retencji zgłoszeń w buforze awaryjnym (w godzinach, domyślnie 72). Wartość pojawia się też w polityce prywatności – zmiana wymaga ponownego deployu | `72` |
| `NEXT_PUBLIC_EXTRA_CLOSED_DATES` | Nie | Dodatkowe dni wolne biura (np. Sylwester, mostki). Wstrzykiwana podczas kompilacji – zmiana wymaga ponownego deployu | `2026-12-31,2026-05-02` |

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
6. Wprowadź `TELEGRAM_BOT_TOKEN` i `TELEGRAM_CHAT_ID` w panelu Netlify w sekcji:
   *Site configuration* > *Environment variables*.

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

---

## Otwarte kwestie prawne i organizacyjne (dla właściciela TEWU)

1. **Weryfikacja szkicu Polityki Prywatności (`/polityka-prywatnosci`)**:
   - Skonsultowanie treści szkicu z radcą prawnym biura (potwierdzenie podstawy prawnej z art. 6 ust. 1 lit. b vs f RODO).
   - Potwierdzenie regionu danych w usłudze Netlify Blobs oraz zawarcia umowy powierzenia przetwarzania danych (DPA) z Netlify.
   - Uzupełnienie sekcji dotyczącej plików cookies po późniejszym wdrożeniu baneru CMP / Cookiebota.
2. **Kolejne kroki marketingowe**:
   - Wdrożenie Cookiebota / Google Consent Mode v2.
   - Podpięcie tagów konwersji Google Ads i GA4 pod zaimplementowane zdarzenia `dataLayer` (`callback_widget_open`, `callback_request_submit`).
