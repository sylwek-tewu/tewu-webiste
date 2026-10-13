# Codebase Architectural Deepening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the TEWU website codebase to deepen shallow modules, eliminate leaky seams, establish a canonical domain model, and align test surfaces directly with module interfaces across callback intake, outbox processing, calendar math, and the frontend widget.

**Architecture:**
1. Unify domain typing under a canonical `CallbackLead` model.
2. Encapsulate intake orchestration, dual-channel dispatch, timeouts, and fallback buffering behind a deep `submitCallbackLead` pipeline.
3. Consolidate retry backoff, re-entrancy locking, storage status checks, and rate-limited alerting into an autonomous `runOutboxProcessing` coordinator.
4. Merge fragmented holiday micro-files into a cohesive `src/lib/calendar` module returning language-neutral commitment data, moving grammatical declensions into `src/i18n/`.
5. Extract frontend form state and anti-bot cancellation into a headless `useCallbackForm` controller, deleting the artificial `reload.ts` seam.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5.8, Mantine 8.3, Drizzle ORM, better-sqlite3, Vitest 5.0.

**Spec:** an architecture review report from 2026-10-04 (generated outside the repository and not kept), checked against [`CONTEXT.md`](../../../CONTEXT.md), [ADR 0001](../../adr/0001-callback-widget.md), [ADR 0002](../../adr/0002-ukrainian-language-support.md) and [ADR 0003](../../adr/0003-migration-to-coolify-ovhcloud-and-sqlite.md).

## Global Constraints

- Preserve all behavioral, privacy, and security guarantees: E.164 phone normalization, AES-256-GCM outbox encryption, zero-PII in Telegram pings and client analytics, 72h outbox retention, and strict Europe/Warsaw timezone calculation.
- Maintain exact error codes: `invalid_request`, `phone_required`, `phone_invalid`, `slot_invalid`, `unavailable`, `delivery_failed`, `unexpected`.
- Maintain dictionary separation from ADR 0002: Polish bundles must never contain Ukrainian declensions or translations.
- All tests must pass: `pnpm test` (zero regressions across all existing test suites).
- Type checking must pass: `pnpm check:types`.
- Linting must pass: `pnpm lint`.

---

### Task 1: Canonical `CallbackLead` Domain Model

**Files:**
- Modify: `src/lib/callback/types.ts`
- Modify: `src/lib/notify/types.ts`
- Modify: `src/lib/outbox/types.ts`

**Interfaces:**
- Consumes: `CallbackSlot`, `CallbackTopic`, `CallbackSource`, `CallbackErrorCode` from `src/lib/callback/types.ts`, `Locale` from `src/i18n/types.ts`.
- Produces:
  ```ts
  export interface CallbackLead {
    id: string; // 6 uppercase hex characters, e.g. 'A1B2C3'
    phone: string; // E.164 normalized, e.g. '+48501482555'
    slot: CallbackSlot;
    topic?: CallbackTopic | '';
    source: CallbackSource | 'unknown';
    locale: Locale;
    createdAt: string; // ISO 8601
  }

  export interface OutboxRecord extends CallbackLead {
    attempts: number;
    lastAttemptAt?: string;
  }
  ```

- [x] **Step 1: Write type definitions for `CallbackLead` in `src/lib/callback/types.ts`**
Add `CallbackLead` and re-export `Locale` if helpful. Note: `source` is `CallbackSource | 'unknown'`.

- [x] **Step 2: Update `src/lib/notify/types.ts` to alias/extend `CallbackLead`**
Replace loose `CallbackNotificationData` with `CallbackLead` (maintaining backward-compatible type alias `export type CallbackNotificationData = CallbackLead;`).

- [x] **Step 3: Update `src/lib/outbox/types.ts` to extend `CallbackLead`**
Update `OutboxRecord` to extend `CallbackLead` directly instead of mirroring properties with loose string types.

- [x] **Step 4: Run type check and tests**
Run: `pnpm check:types && pnpm test`
Expected: PASS (all tests pass).

- [x] **Step 5: Commit**
```bash
git add src/lib/callback/types.ts src/lib/notify/types.ts src/lib/outbox/types.ts
git commit -m "refactor(domain): define canonical CallbackLead model across callback, notify and outbox"
```

---

### Task 2: Deep Callback Intake & Delivery Pipeline (`submitCallbackLead`)

**Files:**
- Create: `src/lib/callback/delivery-pipeline.ts`
- Test: `src/lib/callback/delivery-pipeline.test.ts`
- Modify: `src/lib/callback/index.ts`

**Interfaces:**
- Consumes: `CallbackLead`, `CallbackErrorCode`, `ResolvedCallNumber`, `OutboxStore`.
- Produces:
  ```ts
  export interface CallbackDeliveryDependencies {
    sendEmail: (lead: CallbackLead, options?: { deadlineMs?: number }) => Promise<boolean>;
    sendTelegramPing: (lead: CallbackLead) => Promise<boolean>;
    sendAlert: (message: string) => Promise<boolean>;
    outboxStore: OutboxStore;
    isSmtpConfigured: () => boolean;
    getCallNumber: () => ResolvedCallNumber;
  }

  export type CallbackSubmissionResult =
    | { status: 'delivered'; id: string }
    | { status: 'buffered'; id: string }
    | { status: 'silently_ignored' }
    | { status: 'validation_error'; code: CallbackErrorCode; message: string }
    | { status: 'fallback_office_call'; code: 'unavailable' | 'delivery_failed' | 'unexpected'; message: string; httpStatus: 500 | 502; callNumber: ResolvedCallNumber };

  export async function submitCallbackLead(
    payload: unknown,
    dependencies?: Partial<CallbackDeliveryDependencies>
  ): Promise<CallbackSubmissionResult>;
  ```

- [x] **Step 1: Write failing unit tests for `submitCallbackLead` in `src/lib/callback/delivery-pipeline.test.ts`**
Cover:
1. Rejection of malformed JSON / non-object payload (`status: 'validation_error'`, code `invalid_request`).
2. Honeypot populated -> `status: 'silently_ignored'`.
3. Elapsed time < 2000ms -> `status: 'silently_ignored'`.
4. Invalid phone -> `status: 'validation_error'`, code `phone_invalid`.
5. Invalid slot -> `status: 'validation_error'`, code `slot_invalid`.
6. Missing SMTP configuration -> alert sent, `status: 'fallback_office_call'`, code `unavailable`, httpStatus 500.
7. Direct SMTP delivery success -> `status: 'delivered'`.
8. SMTP failure -> buffered in outbox -> alert sent, `status: 'buffered'`.
9. SMTP and Outbox failure -> fatal alert sent, `status: 'fallback_office_call'`, code `delivery_failed`, httpStatus 502.

- [x] **Step 2: Run test to verify it fails**
Run: `pnpm vitest run src/lib/callback/delivery-pipeline.test.ts`
Expected: FAIL (module not found).

- [x] **Step 3: Implement `src/lib/callback/delivery-pipeline.ts`**
Absorb validation, antispam rules, delivery timeout budgets (`DELIVERY_BUDGET`), parallel SMTP + Telegram dispatch, outbox failover, and office call fallbacks with production defaults.

- [x] **Step 4: Re-export from `src/lib/callback/index.ts`**
Export `submitCallbackLead`, `CallbackSubmissionResult`, `CallbackDeliveryDependencies`.

- [x] **Step 5: Run tests to verify they pass**
Run: `pnpm vitest run src/lib/callback/delivery-pipeline.test.ts`
Expected: PASS.

- [x] **Step 6: Commit**
```bash
git add src/lib/callback/delivery-pipeline.ts src/lib/callback/delivery-pipeline.test.ts src/lib/callback/index.ts
git commit -m "feat(callback): implement deep submitCallbackLead delivery pipeline"
```

---

### Task 3: Connect HTTP Route to Delivery Pipeline & Simplify `route.ts`

**Files:**
- Modify: `src/app/api/callback/route.ts`
- Modify: `src/app/api/callback/route.test.ts`

**Interfaces:**
- Consumes: `submitCallbackLead` from `@/lib/callback/delivery-pipeline`.
- Produces: `POST(request: NextRequest): Promise<NextResponse>`.

- [x] **Step 1: Simplify `src/app/api/callback/route.ts`**
Replace 165 lines of procedural orchestration with a clean HTTP adapter:
```ts
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowe dane formularza', code: 'invalid_request' }, { status: 400 });
  }

  const result = await submitCallbackLead(body);

  switch (result.status) {
    case 'delivered':
      return NextResponse.json({ success: true, id: result.id, delivery: 'direct' }, { status: 200 });
    case 'buffered':
      return NextResponse.json({ success: true, id: result.id, delivery: 'buffered' }, { status: 200 });
    case 'silently_ignored':
      return NextResponse.json({ success: true, id: 'OK' }, { status: 200 });
    case 'validation_error':
      return NextResponse.json({ error: result.message, code: result.code }, { status: 400 });
    case 'fallback_office_call':
      return NextResponse.json(
        {
          error: `${result.message} ${result.callNumber.display}`,
          code: result.code,
          callNumber: result.callNumber.display,
          telUri: result.callNumber.telUri,
        },
        { status: result.httpStatus }
      );
  }
}
```

- [x] **Step 2: Update `src/app/api/callback/route.test.ts`**
Ensure route tests verify JSON parsing, status code mappings, and headers, maintaining all existing test expectations.

- [x] **Step 3: Run all callback tests**
Run: `pnpm vitest run src/app/api/callback/ src/lib/callback/`
Expected: PASS.

- [x] **Step 4: Commit**
```bash
git add src/app/api/callback/route.ts src/app/api/callback/route.test.ts
git commit -m "refactor(api): delegate POST /api/callback to submitCallbackLead pipeline"
```

---

### Task 4: Deepen `OutboxStore` with Status Inspection & Meta Storage

**Files:**
- Modify: `src/lib/outbox/types.ts`
- Modify: `src/lib/outbox/store.ts`
- Test: `src/lib/outbox/store.test.ts`

**Interfaces:**
- Consumes: `CallbackLead` from `@/lib/callback/types`.
- Produces:
  ```ts
  export type StoredRecordResult =
    | { status: 'valid'; record: OutboxRecord }
    | { status: 'key_missing'; createdAt?: string }
    | { status: 'corrupt' }
    | { status: 'not_found' };

  export interface OutboxStore {
    put(record: CallbackLead & Partial<Pick<OutboxRecord, 'attempts' | 'lastAttemptAt'>>): Promise<void>;
    claim(id: string, attempts: number, at: string): Promise<boolean>;
    get(id: string): Promise<OutboxRecord | null>;
    getRecordStatus(id: string): Promise<StoredRecordResult>;
    listIds(): Promise<string[]>;
    delete(id: string): Promise<void>;
    getMeta(key: string): Promise<string | null>;
    setMeta(key: string, value: string): Promise<void>;
  }
  ```

- [x] **Step 1: Update interface in `src/lib/outbox/types.ts`**
Add `StoredRecordResult` (including `not_found`) and meta methods to `OutboxStore`. Ensure `put` accepts optional `attempts` and `lastAttemptAt` so existing tests can seed test records.

- [x] **Step 2: Implement `getRecordStatus`, `getMeta`, and `setMeta` in `MemoryOutboxStore`**
Store metadata in an in-memory `Map<string, string>`. Return `{ status: 'valid' }`, `{ status: 'key_missing' }`, `{ status: 'corrupt' }`, or `{ status: 'not_found' }`.

- [x] **Step 3: Implement `getRecordStatus`, `getMeta`, and `setMeta` in `SqliteOutboxStore`**
Use `schema.outboxMeta` for meta operations. In `getRecordStatus`, catch crypto errors and return typed status objects instead of rethrowing, returning `{ status: 'not_found' }` if the row does not exist. Default nullable `locale` from database to `'pl'`: `(row.locale as Locale) ?? 'pl'`.

- [x] **Step 4: Add tests for `getRecordStatus` and meta operations in `src/lib/outbox/store.test.ts`**
Verify both `MemoryOutboxStore` and `SqliteOutboxStore`.

- [x] **Step 5: Run tests**
Run: `pnpm vitest run src/lib/outbox/store.test.ts`
Expected: PASS.

- [x] **Step 6: Commit**
```bash
git add src/lib/outbox/types.ts src/lib/outbox/store.ts src/lib/outbox/store.test.ts
git commit -m "feat(outbox): add getRecordStatus and metadata storage to OutboxStore"
```

---

### Task 5: Autonomous Outbox Processing Coordinator (`runOutboxProcessing`)

**Files:**
- Create: `src/lib/outbox/coordinator.ts`
- Modify: `src/lib/outbox/run-alerts.ts`
- Modify: `src/lib/outbox/run-alerts.test.ts`
- Modify: `src/lib/outbox/index.ts`
- Modify: `src/app/api/internal/process-outbox/route.ts`
- Test: `src/lib/outbox/coordinator.test.ts`
- Modify: `src/app/api/internal/process-outbox/route.test.ts`

**Interfaces:**
- Consumes: `OutboxStore`, `StoredRecordResult`, `sendCallbackEmail`, `sendTelegramAlert`.
- Produces:
  ```ts
  export interface OutboxCoordinatorDependencies {
    store: OutboxStore;
    sendEmail: (record: CallbackLead) => Promise<boolean>;
    sendAlert: (text: string) => Promise<boolean>;
    ttlHours: number;
    now: () => Date;
  }

  export async function runOutboxProcessing(
    dependencies?: Partial<OutboxCoordinatorDependencies>
  ): Promise<ProcessResult | { status: 'skipped'; reason: 'run-in-progress' }>;
  ```

- [x] **Step 1: Write unit tests in `src/lib/outbox/coordinator.test.ts`**
Test:
1. In-process mutex prevents concurrent runs (`status: 'skipped'`).
2. Succeeded delivery deletes record from store.
3. Expired record (> TTL) deletes record and triggers expiration alert.
4. Corrupt record deletes record and triggers corruption alert.
5. Missing key triggers rate-limited alert.
6. Store errors trigger rate-limited alert.
7. Database crash during run triggers fatal alert.

- [x] **Step 2: Implement `src/lib/outbox/coordinator.ts`**
Consolidate mutex guard, `processOutbox`, `sendRateLimitedRunAlert`, and error handling into `runOutboxProcessing`.

- [x] **Step 3: Update `src/lib/outbox/run-alerts.ts` to support `OutboxStore`**
Accept `storeOrDb: OutboxStore | BetterSQLite3Database<typeof schema>` so both direct database tests in `run-alerts.test.ts` and store-based coordinator calls pass seamlessly.

- [x] **Step 4: Simplify `src/app/api/internal/process-outbox/route.ts`**
Route handler becomes a thin ~25-line endpoint verifying `CRON_SECRET` and calling `runOutboxProcessing()`.

- [x] **Step 5: Run tests**
Run: `pnpm vitest run src/lib/outbox/ src/app/api/internal/process-outbox/`
Expected: PASS.

- [x] **Step 6: Commit**
```bash
git add src/lib/outbox/coordinator.ts src/lib/outbox/coordinator.test.ts src/lib/outbox/run-alerts.ts src/lib/outbox/run-alerts.test.ts src/lib/outbox/index.ts src/app/api/internal/process-outbox/route.ts src/app/api/internal/process-outbox/route.test.ts
git commit -m "feat(outbox): consolidate retry processing, mutex and alerting in OutboxCoordinator"
```

---

### Task 6: Consolidate Calendar & Office Hours Module

**Files:**
- Create: `src/lib/calendar/index.ts`
- Create: `src/lib/calendar/calendar.test.ts`
- Deprecate: `src/lib/holidays/*` (forward to `@/lib/calendar`)

**Interfaces:**
- Consumes: None (pure computation).
- Produces:
  ```ts
  export interface CallbackCommitment {
    isToday: boolean;
    isTomorrow: boolean;
    targetDate: Date;
    slot: CallbackSlot;
    withinOfficeHours: boolean;
    officeState: 'open' | 'before_hours' | 'after_hours' | 'closed_day';
  }

  export function isOfficeOpen(nowInput?: Date): boolean;
  export function isBusinessDay(dateStr: string): boolean;
  export function nextBusinessDay(dateInput?: Date): Date;
  export function getCallbackCommitment(slot: CallbackSlot, nowInput?: Date): CallbackCommitment;
  ```

- [x] **Step 1: Write tests for `src/lib/calendar/calendar.test.ts`**
Test:
1. `isOfficeOpen` returns true Monday-Friday 8:00–16:00 Warsaw time, false on weekends and holidays.
2. Statutory Polish holidays (1 Jan, Easter Sunday/Monday, Corpus Christi, 1/3 May, 15 Aug, 1/11 Nov, 24/25/26 Dec).
3. `NEXT_PUBLIC_EXTRA_CLOSED_DATES` support.
4. `getCallbackCommitment` calculates `isToday`, `isTomorrow`, `targetDate`, and `officeState` (`before_hours`, `after_hours`, `open`, `closed_day`) for `asap` and fixed slots.

- [x] **Step 2: Implement `src/lib/calendar/index.ts`**
Consolidate Easter algorithm, holiday rules, business day progression, and Warsaw time formatting with module-cached `Intl.DateTimeFormat` instances.

- [x] **Step 3: Point `src/lib/holidays/index.ts` to `@/lib/calendar`**
Ensure backward compatibility for any existing imports.

- [x] **Step 4: Run calendar tests**
Run: `pnpm vitest run src/lib/calendar/`
Expected: PASS.

- [x] **Step 5: Commit**
```bash
git add src/lib/calendar/ src/lib/holidays/
git commit -m "feat(calendar): consolidate holiday math and office hours into deep calendar module"
```

---

### Task 7: Decouple Calendar Sentence Formatting into i18n Dictionaries

**Files:**
- Modify: `src/i18n/types.ts`
- Modify: `src/i18n/pl.ts`
- Modify: `src/i18n/uk.ts`
- Create: `src/i18n/format-commitment.ts`
- Test: `src/i18n/format-commitment.test.ts`
- Modify: `src/lib/callback/business-hours.ts`
- Modify: `src/components/callback-widget/CallbackFormModal.tsx`
- Modify: `src/components/callback-widget/CallbackWidget.tsx`

**Interfaces:**
- Consumes: `CallbackCommitment` from `@/lib/calendar`, `Translations` from `@/i18n/types`.
- Produces: `formatCallbackCommitment(commitment: CallbackCommitment, t: Translations['callbackWidget'], locale: Locale): { message: string; isToday: boolean }`.

- [x] **Step 1: Add commitment declensions and templates to `pl.ts` and `uk.ts`**
Move Polish and Ukrainian days, months, and sentence templates from `business-hours.ts` into `src/i18n/pl.ts` and `src/i18n/uk.ts`. Ensure distinction between `after_hours` ("Biuro jest teraz zamknięte") and `closed_day` ("Biuro jest dziś nieczynne").

- [x] **Step 2: Implement `formatCallbackCommitment` in `src/i18n/format-commitment.ts`**
Format the user promise sentence using the active locale's dictionary, inspecting `commitment.officeState` to choose the appropriate template.

- [x] **Step 3: Update `CallbackFormModal.tsx` and `CallbackWidget.tsx`**
Compute `const commitment = getCallbackCommitment(slot);` and `formatCallbackCommitment(commitment, t.callbackWidget, locale);`.

- [x] **Step 4: Update `src/lib/callback/business-hours.ts`**
Forward calls to `calendar` and `format-commitment` so existing tests in `business-hours.test.ts` continue to pass.

- [x] **Step 5: Run tests**
Run: `pnpm vitest run src/i18n/ src/lib/callback/ src/components/callback-widget/`
Expected: PASS.

- [x] **Step 6: Commit**
```bash
git add src/i18n/ src/lib/callback/business-hours.ts src/components/callback-widget/
git commit -m "refactor(i18n): decouple calendar promise formatting into locale dictionaries"
```

---

### Task 8: Extract Frontend Form Controller Hook & Delete `reload.ts`

**Files:**
- Create: `src/components/callback-widget/useCallbackForm.ts`
- Test: `src/components/callback-widget/useCallbackForm.test.ts`
- Modify: `src/components/callback-widget/CallbackFormModal.tsx`
- Modify: `src/components/callback-widget/CallbackFormFallbacks.tsx`
- Modify: `src/components/callback-widget/CallbackWidget.tsx`
- Delete: `src/components/callback-widget/reload.ts`
- Modify: `src/components/callback-widget/CallbackWidget.load-failure.test.tsx`

**Interfaces:**
- Consumes: `ResolvedCallNumber`, `useLocale`, `useCallbackWidget`.
- Produces:
  ```ts
  export interface UseCallbackFormOptions {
    callInfo: ResolvedCallNumber;
    isOpen: boolean;
    source: CallbackSource;
    closeWidget: () => void;
    t: Translations['callbackWidget'];
    locale: Locale;
  }

  export function useCallbackForm(options: UseCallbackFormOptions): {
    phone: string;
    slot: CallbackSlot;
    topic: CallbackTopic | '';
    honeypot: string;
    phoneError: string | null;
    submitError: string | null;
    submitSuccess: boolean;
    isPending: boolean;
    promiseMessage: string;
    setPhone: (val: string) => void;
    setSlot: (slot: CallbackSlot) => void;
    setTopic: (topic: CallbackTopic | '') => void;
    setHoneypot: (val: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    handleClose: () => void;
  };
  ```

- [x] **Step 1: Write headless unit tests for `useCallbackForm` in `src/components/callback-widget/useCallbackForm.test.ts`**
Test:
1. Valid phone submission triggers fetch to `/api/callback` and sets `submitSuccess: true`.
2. Anti-bot fast submission waits out delay without dropping.
3. Form close cancels pending submission.
4. Error code from server maps to localized message.

- [x] **Step 2: Implement `useCallbackForm.ts`**
Extract state management, anti-bot timer, cancellation ref, client validation, fetch call, error code translation, and GTM analytics event push.

- [x] **Step 3: Update `CallbackFormModal.tsx` to consume `useCallbackForm`**
Component shrinks to purely declarative JSX rendering Mantine Modal, Inputs, and Alerts.

- [x] **Step 4: Delete `reload.ts` and add `onReload` forwarding**
Update `CallbackWidget`, `CallbackFormErrorBoundary`, and `CallbackFormLoadError` to accept `onReload?: () => void` defaulting to `() => window.location.reload()`. Update `CallbackWidget.load-failure.test.tsx` to pass the mock spy directly to `<CallbackWidget onReload={reloadSpy} />`. Remove `reload.ts`.

- [x] **Step 5: Run widget tests**
Run: `pnpm vitest run src/components/callback-widget/`
Expected: PASS without `act(...)` state update warnings.

- [x] **Step 6: Commit**
```bash
git add src/components/callback-widget/
git rm src/components/callback-widget/reload.ts
git commit -m "refactor(widget): extract useCallbackForm hook and delete single-use reload.ts"
```

---

### Task 9: Full System Verification & Regression Suite

**Files:**
- All touched files across the repository.

- [x] **Step 1: Run full test suite**
Run: `pnpm test`
Expected: PASS (all tests pass across all test suites).

- [x] **Step 2: Run TypeScript type checker**
Run: `pnpm check:types`
Expected: PASS (zero type errors).

- [x] **Step 3: Run ESLint**
Run: `pnpm lint`
Expected: PASS (zero lint warnings/errors).

- [x] **Step 4: Run production build**
Run: `pnpm build`
Expected: PASS (Next.js standalone build succeeds).

- [x] **Step 5: Final commit**
```bash
git commit --allow-empty -m "chore: complete codebase architecture deepening refactor"
```

---

## Changes after code review

A review of the finished work changed some of what this plan describes:

- `src/lib/callback/business-hours.ts` (Task 7, Step 4) is gone. It imported both dictionaries, and the widget imported `isOfficeOpen` from it, so every page loaded both. Callers use `@/lib/calendar`; `src/i18n/client-bundles.test.ts` now enforces the ADR 0002 rule.
- `src/lib/holidays/*` (Task 6) is gone too; its tests and LICENSE moved to `src/lib/calendar/`.
- `OutboxStore.getRecordStatus` and `StoredRecordResult` (Task 4) were removed: the processor reads records with `get()` and handles the crypto errors itself.
- `CallbackLead.locale` is required, and the outbox column is `NOT NULL`.
- Slot hours live only in `CALLBACK_SLOT_WINDOWS` (`@/lib/calendar`); `formatSlotRange` in the dictionaries takes the start and end times.
