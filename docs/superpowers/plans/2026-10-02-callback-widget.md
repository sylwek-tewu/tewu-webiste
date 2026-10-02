# Callback Widget („Bezpłatna wycena – oddzwonimy”) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zbudować i wdrożyć kompletny, lekki widżet call-back „Bezpłatna wycena – oddzwonimy” z obsługą godzin pracy biura TEWU, kalkulacją świąt w Polsce, podwójnym kanałem powiadomień (SMTP + Telegram bez PII), buforem awaryjnym w Netlify Blobs z retencją 72h i szyfrowaniem AES-256-GCM oraz nową podstroną polityki prywatności.

**Architecture:** Modułowa architektura z warstwą czystych funkcji biznesowych (`src/lib/holidays`, `src/lib/callback`), warstwą powiadomień i bufora awaryjnego (`src/lib/notify`, `src/lib/outbox`), serwerowym route handlerem `POST /api/callback`, kontekstem React (`CallbackContext`) i komponentem widżetu Mantine z responsywnym zachowaniem desktop/mobile oraz podstroną `/polityka-prywatnosci`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Mantine UI 8.3, `@netlify/blobs`, `nodemailer`, `lucide-react`, Vitest, ESLint.

**Spec:** [ADR 0001: docs/adr/0001-callback-widget.md](file:///home/przemek/work/priv/tewu-webiste/docs/adr/0001-callback-widget.md)

## Global Constraints
- Wszystkie obliczenia dat i godzin wykonywane w strefie czasowej `Europe/Warsaw`.
- Zero danych osobowych w Telegramie i w zdarzeniach `dataLayer` – numer telefonu trafia wyłącznie do e-maila oraz szyfrowanego bufora Blobs.
- Kod i komentarze po angielsku, teksty UI po polsku.
- Ton UI: zwięzły, profesjonalny, bez nachalnych auto-popupów.
- Brak nowych bibliotek UI poza Mantine. Jedyna nowa zależność storage'owa: `@netlify/blobs`.
- Zmienne środowiskowe z `.env.example` bez sekretów.

---

### Task 1: Tooling, dependencies & repo cleanup

**Files:**
- Delete: `biuro-rachunkowe-tewu-2026-prototype/`
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `eslint.config.mjs`
- Create: `netlify.toml`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `pnpm test` (uruchamia Vitest), `pnpm lint` (uruchamia ESLint), `pnpm build` (uruchamia Next.js build).

- [ ] **Step 1: Usuń nieużywany katalog `biuro-rachunkowe-tewu-2026-prototype`**
- [ ] **Step 2: Zainstaluj niezbędne zależności robocze i produkcyjne**
  - dependencies: `@netlify/blobs`, `nodemailer`
  - devDependencies: `@types/nodemailer`, `vitest`, `eslint`, `@eslint/js`, `typescript-eslint`
- [ ] **Step 3: Skonfiguruj `vitest.config.ts`, `eslint.config.mjs` oraz `netlify.toml`**
- [ ] **Step 4: Zaktualizuj skrypty w `package.json`** (`test: "vitest run"`, `lint: "eslint ."`)
- [ ] **Step 5: Uruchom `pnpm lint` i `pnpm test` w celu weryfikacji konfiguracji**
- [ ] **Step 6: Commit zmian** (`chore: setup vitest, eslint, netlify configuration and cleanup prototype`)

---

### Task 2: Polish Public Holidays port & timezone-safe business days

**Files:**
- Create: `src/lib/holidays/LICENSE.poland-public-holidays.txt`
- Create: `src/lib/holidays/types.ts`
- Create: `src/lib/holidays/easter.ts`
- Create: `src/lib/holidays/holidays.ts`
- Create: `src/lib/holidays/business-days.ts`
- Create: `src/lib/holidays/config.ts`
- Create: `src/lib/holidays/index.ts`
- Test: `src/lib/holidays/holidays.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export function isPolishHoliday(date: Date | string): boolean;
  export function isBusinessDay(date: Date | string, extraClosed?: string[]): boolean;
  export function nextBusinessDay(date: Date | string, extraClosed?: string[]): Date;
  export function getWarsawDateString(date: Date): string; // 'YYYY-MM-DD'
  ```

- [ ] **Step 1: Pobierz pliki źródłowe z forka `mtk3d/poland-public-holidays` (commit `4ad14bc536051155a81b25b3cda7e76ecf41cfaa`) oraz zapisz licencję MIT Kamila Szydłowskiego**
- [ ] **Step 2: Napisz testy Vitest pokrywające święta stałe (w tym Wigilię od 2025), ruchome dla lat 2026, 2027, 2028, strefę czasową `Europe/Warsaw` i przejścia północy w UTC**
- [ ] **Step 3: Zaimplementuj moduły w `src/lib/holidays/` z pełnym wsparciem TypeScript i czasem warszawskim**
- [ ] **Step 4: Zaimplementuj obsługę `EXTRA_CLOSED_DATES` z pliku konfiguracyjnego oraz zmiennej środowiskowej `EXTRA_CLOSED_DATES`**
- [ ] **Step 5: Uruchom testy `pnpm test` i upewnij się, że wszystkie przechodzą na zielono**
- [ ] **Step 6: Commit zmian** (`feat: add timezone-safe polish public holidays engine`)

---

### Task 3: Business hours, phone validation & call number resolver

**Files:**
- Create: `src/lib/callback/phone.ts`
- Create: `src/lib/callback/call-number.ts`
- Create: `src/lib/callback/business-hours.ts`
- Create: `src/lib/callback/types.ts`
- Test: `src/lib/callback/phone.test.ts`
- Test: `src/lib/callback/call-number.test.ts`
- Test: `src/lib/callback/business-hours.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type CallbackSlot = 'asap' | '8-12' | '12-16' | '17-18';
  export function normalizePhoneNumber(raw: string): { valid: boolean; normalized: string; formatted: string };
  export function getCallNumber(): { raw: string; display: string };
  export function isOfficeOpen(now?: Date): boolean;
  export function getCallbackMessage(slot: CallbackSlot, now?: Date): { message: string; isToday: boolean };
  ```

- [ ] **Step 1: Napisz testy dla normalizacji numerów polskich i międzynarodowych oraz `getCallNumber()` z fallbackiem do `+48914824190`**
- [ ] **Step 2: Napisz testy dla `getCallbackMessage` (bufor 15 min, slot `17-18`, weekendy, święta, `asap` w godzinach i poza nimi)**
- [ ] **Step 3: Zaimplementuj `phone.ts`, `call-number.ts`, `business-hours.ts`**
- [ ] **Step 4: Uruchom testy i potwierdź 100% zgodność reguł biznesowych**
- [ ] **Step 5: Commit zmian** (`feat: implement business hours logic, phone normalization and call number resolver`)

---

### Task 4: Outbox store, AES-256-GCM encryption & retry processor

**Files:**
- Create: `src/lib/outbox/types.ts`
- Create: `src/lib/outbox/crypto.ts`
- Create: `src/lib/outbox/store.ts`
- Create: `src/lib/outbox/processor.ts`
- Create: `netlify/functions/process-outbox.mts`
- Test: `src/lib/outbox/crypto.test.ts`
- Test: `src/lib/outbox/processor.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface OutboxRecord {
    id: string;
    phone: string;
    slot: string;
    topic?: string;
    source: string;
    createdAt: string;
    attempts: number;
    lastAttemptAt?: string;
  }
  export interface OutboxStore {
    put(record: OutboxRecord): Promise<void>;
    get(id: string): Promise<OutboxRecord | null>;
    list(): Promise<OutboxRecord[]>;
    delete(id: string): Promise<void>;
  }
  export function processOutbox(store: OutboxStore, sendEmail: (r: OutboxRecord) => Promise<boolean>, now?: Date): Promise<ProcessResult>;
  ```

- [ ] **Step 1: Napisz testy dla szyfrowania i deszyfrowania AES-256-GCM pola `phone` z kluczem w ENV**
- [ ] **Step 2: Napisz testy dla `processOutbox` (sukces usuwa wpis, porażka zwiększa `attempts`, wpisy > TTL są kasowane z alarmem)**
- [ ] **Step 3: Zaimplementuj `crypto.ts`, `store.ts` (obsługa `@netlify/blobs` i in-memory fallback do testów) oraz `processor.ts`**
- [ ] **Step 4: Utwórz `netlify/functions/process-outbox.mts` ze zdefiniowanym cronem `*/10 * * * *`**
- [ ] **Step 5: Uruchom testy i potwierdź poprawność działania**
- [ ] **Step 6: Commit zmian** (`feat: add encrypted netlify blobs outbox and scheduled retry processor`)

---

### Task 5: Notifications (SMTP + Telegram ping) & route handler `POST /api/callback`

**Files:**
- Create: `src/lib/notify/types.ts`
- Create: `src/lib/notify/email.ts`
- Create: `src/lib/notify/telegram.ts`
- Create: `src/lib/notify/index.ts`
- Create: `src/app/api/callback/route.ts`
- Test: `src/lib/notify/telegram.test.ts`
- Test: `src/app/api/callback/route.test.ts`

**Interfaces:**
- Produces:
  - `POST /api/callback` przyjmujący `{ phone, slot, topic, source, honeypot, formOpenedAt }`
  - Odpowiedź 200 `{ success: true, id: string, delivery: 'direct' | 'buffered' }` lub błąd 400/502 `{ error: string, callNumber: string }`

- [ ] **Step 1: Napisz test jednostkowy weryfikujący, że treść wiadomości wysyłanej do Telegram Bot API NIGDY nie zawiera numeru telefonu**
- [ ] **Step 2: Napisz testy endpointu `/api/callback` (sukces bezpośredni, sukces z buforowaniem, odrzucenie honeypota, odrzucenie time-trapa)**
- [ ] **Step 3: Zaimplementuj obsługę e-mail przez Nodemailer (temat `[Oddzwonienie #{id}]`, pełne dane) oraz ping Telegram (tylko serwer)**
- [ ] **Step 4: Zaimplementuj route handler z równoległym wywołaniem `Promise.allSettled`, timeoutami i regułą sukcesu**
- [ ] **Step 5: Uruchom testy i potwierdź bezbłędną izolację danych osobowych**
- [ ] **Step 6: Commit zmian** (`feat: implement notification channels and callback API route handler`)

---

### Task 6: Frontend Callback Widget UI & React Context

**Files:**
- Create: `src/components/callback-widget/types.ts`
- Create: `src/components/callback-widget/analytics.ts`
- Create: `src/components/callback-widget/CallbackContext.tsx`
- Create: `src/components/callback-widget/CallbackWidget.module.css`
- Create: `src/components/callback-widget/CallbackWidget.tsx`
- Create: `src/components/callback-widget/index.ts`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces:
  ```tsx
  export const useCallbackWidget = (): { openWidget: (source: 'header' | 'floating' | string) => void; closeWidget: () => void; isOpen: boolean };
  export default function CallbackWidget(): React.ReactNode;
  ```

- [ ] **Step 1: Zaimplementuj `analytics.ts` z bezpiecznym pushowaniem zdarzeń `callback_widget_open` i `callback_request_submit` do `window.dataLayer`**
- [ ] **Step 2: Zaimplementuj `CallbackContext` udostępniający stan otwarcia i źródło wywołania widżetu**
- [ ] **Step 3: Zbuduj komponent `CallbackWidget.tsx` w Mantine UI (pływający pill na desktop, dolny pasek z „Zadzwoń” i „Oddzwońcie” na mobile, modal formularza, dynamiczny podgląd komunikatu, dostępność, focus trap)**
- [ ] **Step 4: Zintegruj `CallbackProvider` i leniwie ładowany `CallbackWidget` w `src/app/layout.tsx`**
- [ ] **Step 5: Commit zmian** (`feat: add callback widget UI, mobile bar and react context`)

---

### Task 7: Contact data standardization, Navigation hooks & Privacy Policy page

**Files:**
- Modify: `src/constants.tsx`
- Modify: `src/components/Navbar.tsx`
- Modify: `src/components/Footer.tsx`
- Modify: `src/app/kontakt/ContactClient.tsx`
- Create: `src/app/polityka-prywatnosci/page.tsx`
- Create: `.env.example`

**Interfaces:**
- Wszystkie numery telefonów posiadają format `tel:+48…`, adresy mailowe `mailto:`.
- Przyciski w `Navbar` wywołują `openWidget('header')` z fallbackiem `href="/kontakt"`.
- Nowa strona `/polityka-prywatnosci` dostępna w menu stopki i w klauzuli widżetu.

- [ ] **Step 1: Ujednolic linki telefoniczne i e-mailowe w `constants.tsx`, `Footer.tsx` i `ContactClient.tsx`**
- [ ] **Step 2: Podepnij `useCallbackWidget` pod przyciski „Bezpłatna wycena” w `Navbar.tsx` (desktop i drawer mobile)**
- [ ] **Step 3: Utwórz podstronę `/polityka-prywatnosci/page.tsx` ze szkicem prawnym i oznaczonymi sekcjami TODO**
- [ ] **Step 4: Dodaj link do polityki prywatności w `Footer.tsx`**
- [ ] **Step 5: Zaktualizuj plik `.env.example` o wszystkie zmienne (`CALLBACK_SMTP_*`, `TELEGRAM_*`, `OUTBOX_*`, `NEXT_PUBLIC_CALLBACK_CALL_NUMBER`)**
- [ ] **Step 6: Commit zmian** (`feat: standardize contact links, connect navbar triggers and add privacy policy page`)

---

### Task 8: Full verification, linting, build & documentation

**Files:**
- Modify: `README.md`
- Run: `pnpm lint`
- Run: `pnpm test`
- Run: `pnpm build`

- [ ] **Step 1: Uruchom pełny zestaw testów jednostkowych Vitest (`pnpm test`)**
- [ ] **Step 2: Uruchom linter ESLint (`pnpm lint`) i usuń ewentualne ostrzeżenia/błędy**
- [ ] **Step 3: Zbuduj aplikację Next.js (`pnpm build`) i zweryfikuj czy wszystkie strony statyczne i dynamiczny endpoint budują się bez błędów**
- [ ] **Step 4: Uzupełnij `README.md` o instrukcję konfiguracji zmiennych środowiskowych i bota Telegram dla właściciela**
- [ ] **Step 5: Końcowy commit i podsumowanie wdrożenia** (`docs: update documentation and finalize callback widget implementation`)
