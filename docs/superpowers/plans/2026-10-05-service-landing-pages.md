# Service Landing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add six service landing pages (ad targets) in Polish and Ukrainian, attribute callback leads to the page they came from, link the pages from the menu, footer, `/uslugi` and the home page, add a sitemap, and document open questions for TEWU.

**Architecture:** A small client-safe registry (`src/lib/service-pages.ts`) owns the slugs, paths, preset widget topics and Polish office labels. Page copy lives in typed content modules (`src/content/service-pages/{pl,uk}/<slug>.ts`), loaded by the server `page.tsx` of a `[slug]` route in each locale and passed to one shared client component, `ServiceLandingPage`. The callback widget derives the landing page from the current path, presets the form topic, and sends `landingPage` with the lead; the server validates it against the registry and carries it to e-mail, Telegram, analytics and the outbox.

**Tech Stack:** Next.js 16 (App Router, route groups `(pl)` / `(uk)` with separate root layouts), React 19, TypeScript, Mantine 8, lucide-react, Drizzle ORM + better-sqlite3, Vitest 5 + Testing Library, pnpm.

**Spec:** [`docs/superpowers/specs/2026-10-05-service-landing-pages-design.md`](../specs/2026-10-05-service-landing-pages-design.md). Read it before starting. It is the source of truth for decisions. Background: [`CONTEXT.md`](../../../CONTEXT.md), [ADR 0001](../../adr/0001-callback-widget.md), [ADR 0002](../../adr/0002-ukrainian-language-support.md).

## Global Constraints

- Work in the worktree `.worktrees/feat-service-landing-pages` on branch `feat/service-landing-pages`. Do not push and do not open a PR.
- Slugs, exactly: `pelna-ksiegowosc`, `kpir`, `ryczalt`, `kadry-i-place`, `ksef`, `inkubator-spolek`. Paths: `/uslugi/<slug>` (PL) and `/uk/uslugi/<slug>` (UK).
- Preset widget topics: `pelna-ksiegowosc → spolka`, `kpir → dzialalnosc`, `ryczalt → dzialalnosc`, `kadry-i-place → kadry-place`, `ksef → inne`, `inkubator-spolek → spolka`.
- CTA label PL: `Bezpłatna wycena – oddzwonimy` (en dash). Phone on landing pages: `CONTACT_DETAILS.phone` / `tel:${CONTACT_DETAILS.phoneE164}` (`91 48 24 190`).
- H1 of every page contains `Szczecin` (PL; inflected forms like „w Szczecinie” contain it) or `Щецин` (UK).
- FAQ: 4–6 questions per page. Steps: exactly 3. No price ranges are published yet (`pricing.range` stays unset everywhere).
- Draft copy must not invent facts: no amounts, client counts, deadlines or promises beyond what the site already states (25+ lat, 150+ firm, polisa OC, certyfikaty MF/SKwP, elektroniczny obieg dokumentów, reprezentacja przed US/ZUS, godziny 8–16 i dyżur 17–18) or what follows directly from Polish law.
- No `noindex`, no draft flag, no JSON-LD, no `tel:` click tracking, no sticky mobile CTA bar.
- ADR 0002: only `PlLocaleProvider`/`UkLocaleProvider` may import a dictionary (`src/i18n/client-bundles.test.ts` enforces it). Client components read `t` from `useLocale()`. Content modules are imported only by server files (`page.tsx`, `sitemap.ts`, tests).
- Dictionaries `pl.ts` and `uk.ts` must keep identical key shapes, including array lengths (`src/i18n/dictionaries.test.ts`).
- Telegram pings carry no PII: only labels from fixed lists.
- Code style: match surrounding code (4-space indent in `src/app/**` client pages, 2-space elsewhere; comments sparse and explaining *why*).
- Every task ends green: `pnpm test`, `pnpm check:types`, `pnpm lint`.
- Commit messages: conventional commits (`feat(...)`, `docs:`, `test:`), ending with the attribution trailer the session's system reminder specifies.

## Review Focus

1. **Unknown slug** (`/uslugi/nieistnieje`, `/uk/uslugi/nieistnieje`) must be a 404, not a crash or empty page → Task 6 tests `dynamicParams === false` and `notFound()` for unknown slugs.
2. **Language switch on a landing page** (`/uslugi/kpir` → `/uk/uslugi/kpir`) must land on an existing page → Task 5 tests every slug has content in both locales; Task 6 tests both routes list all slugs.
3. **Topic preset vs. the visitor's choice**: a preset must not overwrite a topic the visitor chose, and a preset from one service page must not leak onto `/kontakt` → Task 3 hook tests.
4. **Tampered `landingPage` in the API** (`'<script>'`, `42`, `'__proto__'`, `'toString'`) must be dropped while the lead is still delivered → Task 1 tests `isServicePageSlug` against prototype keys; Task 2 pipeline test.
5. **Outbox rows written before the migration** (`landing_page` NULL) must revive and resend without `landingPage` → Task 2 SQLite store test.

---

### Task 1: Service page registry

**Files:**
- Create: `src/lib/service-pages.ts`
- Test: `src/lib/service-pages.test.ts`

**Interfaces:**
- Consumes: `Locale` (`src/i18n/types.ts`), `CallbackTopic` (`src/lib/callback/types.ts`) – type-only imports.
- Produces:
  ```ts
  export const SERVICE_PAGE_SLUGS: readonly ['pelna-ksiegowosc', 'kpir', 'ryczalt', 'kadry-i-place', 'ksef', 'inkubator-spolek'];
  export type ServicePageSlug = (typeof SERVICE_PAGE_SLUGS)[number];
  export interface ServicePageDefinition { slug: ServicePageSlug; topic: CallbackTopic; serviceItemId: string; label: string }
  export const SERVICE_PAGES: Record<ServicePageSlug, ServicePageDefinition>;
  export function isServicePageSlug(value: unknown): value is ServicePageSlug;
  export function servicePagePath(locale: Locale, slug: ServicePageSlug): string;
  export function servicePageSlugOfPath(pathname: string): ServicePageSlug | null;
  export function servicePageSlugForServiceItem(serviceItemId: string): ServicePageSlug | null;
  export function servicePageTopic(slug: ServicePageSlug | null): CallbackTopic | '';
  ```

- [ ] **Step 1: Write the failing test**

`src/lib/service-pages.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import {
  SERVICE_PAGE_SLUGS,
  SERVICE_PAGES,
  isServicePageSlug,
  servicePagePath,
  servicePageSlugForServiceItem,
  servicePageSlugOfPath,
  servicePageTopic,
} from './service-pages';
import { CALLBACK_TOPICS } from './callback/types';

describe('service page registry', () => {
  it('lists the six landing pages in footer order', () => {
    expect(SERVICE_PAGE_SLUGS).toEqual(['pelna-ksiegowosc', 'kpir', 'ryczalt', 'kadry-i-place', 'ksef', 'inkubator-spolek']);
    for (const slug of SERVICE_PAGE_SLUGS) expect(SERVICE_PAGES[slug].slug).toBe(slug);
  });

  it('presets a known callback topic for every page', () => {
    expect(Object.fromEntries(SERVICE_PAGE_SLUGS.map((slug) => [slug, SERVICE_PAGES[slug].topic]))).toEqual({
      'pelna-ksiegowosc': 'spolka',
      kpir: 'dzialalnosc',
      ryczalt: 'dzialalnosc',
      'kadry-i-place': 'kadry-place',
      ksef: 'inne',
      'inkubator-spolek': 'spolka',
    });
    const topicIds = CALLBACK_TOPICS.map((topic) => topic.id);
    for (const slug of SERVICE_PAGE_SLUGS) expect(topicIds).toContain(SERVICE_PAGES[slug].topic);
  });

  it('accepts only known slugs, not prototype keys or other types', () => {
    expect(isServicePageSlug('kpir')).toBe(true);
    for (const value of ['__proto__', 'toString', 'constructor', 'KPIR', '', '<script>', 42, null, undefined, {}]) {
      expect(isServicePageSlug(value)).toBe(false);
    }
  });

  it('builds the page path in each language', () => {
    expect(servicePagePath('pl', 'kpir')).toBe('/uslugi/kpir');
    expect(servicePagePath('uk', 'kadry-i-place')).toBe('/uk/uslugi/kadry-i-place');
  });

  it('finds the landing page of a path in either language, with or without a trailing slash', () => {
    expect(servicePageSlugOfPath('/uslugi/kpir')).toBe('kpir');
    expect(servicePageSlugOfPath('/uk/uslugi/inkubator-spolek')).toBe('inkubator-spolek');
    expect(servicePageSlugOfPath('/uslugi/ksef/')).toBe('ksef');
  });

  it('finds no landing page on other paths', () => {
    for (const path of ['/', '/uslugi', '/uk/uslugi', '/kontakt', '/uslugi/nieistnieje', '/uslugi/kpir/extra', '/ukryte/uslugi/kpir', '/uslugi/__proto__']) {
      expect(servicePageSlugOfPath(path)).toBeNull();
    }
  });

  it('maps service cards to their landing pages', () => {
    expect(servicePageSlugForServiceItem('pelna-ksiegowosc')).toBe('pelna-ksiegowosc');
    expect(servicePageSlugForServiceItem('kadry-place')).toBe('kadry-i-place');
    expect(servicePageSlugForServiceItem('inkubator-spolek')).toBe('inkubator-spolek');
    expect(servicePageSlugForServiceItem('zus-us')).toBeNull();
  });

  it('gives the preset topic of a page, or none off the landing pages', () => {
    expect(servicePageTopic('kpir')).toBe('dzialalnosc');
    expect(servicePageTopic(null)).toBe('');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/lib/service-pages.test.ts`
Expected: FAIL – `Failed to resolve import "./service-pages"`.

- [ ] **Step 3: Write the implementation**

`src/lib/service-pages.ts`:
```ts
import type { Locale } from '@/i18n/types';
import type { CallbackTopic } from '@/lib/callback/types';

/**
 * Service landing pages: the ad targets under /uslugi/<slug> and /uk/uslugi/<slug> (ADR 0004).
 * Client-safe: no page copy here, that lives in src/content/service-pages.
 */
export const SERVICE_PAGE_SLUGS = ['pelna-ksiegowosc', 'kpir', 'ryczalt', 'kadry-i-place', 'ksef', 'inkubator-spolek'] as const;

export type ServicePageSlug = (typeof SERVICE_PAGE_SLUGS)[number];

export interface ServicePageDefinition {
  slug: ServicePageSlug;
  /** Preselected in the callback form on this page; the visitor can change it. */
  topic: CallbackTopic;
  /** The matching card in the dictionary's servicesPage.items. */
  serviceItemId: string;
  /** Named in Polish for the office's notifications. */
  label: string;
}

export const SERVICE_PAGES: Record<ServicePageSlug, ServicePageDefinition> = {
  'pelna-ksiegowosc': { slug: 'pelna-ksiegowosc', topic: 'spolka', serviceItemId: 'pelna-ksiegowosc', label: 'Pełna księgowość spółek' },
  kpir: { slug: 'kpir', topic: 'dzialalnosc', serviceItemId: 'kpir', label: 'Księga przychodów i rozchodów (KPiR)' },
  ryczalt: { slug: 'ryczalt', topic: 'dzialalnosc', serviceItemId: 'ryczalt', label: 'Ryczałt ewidencjonowany' },
  'kadry-i-place': { slug: 'kadry-i-place', topic: 'kadry-place', serviceItemId: 'kadry-place', label: 'Kadry i płace' },
  ksef: { slug: 'ksef', topic: 'inne', serviceItemId: 'ksef', label: 'KSeF' },
  'inkubator-spolek': { slug: 'inkubator-spolek', topic: 'spolka', serviceItemId: 'inkubator-spolek', label: 'Inkubator spółek z o.o.' },
};

// A list lookup, not `in`, so prototype keys like "__proto__" are never a slug.
export function isServicePageSlug(value: unknown): value is ServicePageSlug {
  return (SERVICE_PAGE_SLUGS as readonly unknown[]).includes(value);
}

export function servicePagePath(locale: Locale, slug: ServicePageSlug): string {
  return `${locale === 'uk' ? '/uk' : ''}/uslugi/${slug}`;
}

const SERVICE_PAGE_PATH = /^(?:\/uk)?\/uslugi\/([^/]+)\/?$/;

export function servicePageSlugOfPath(pathname: string): ServicePageSlug | null {
  const slug = SERVICE_PAGE_PATH.exec(pathname)?.[1];
  return isServicePageSlug(slug) ? slug : null;
}

export function servicePageSlugForServiceItem(serviceItemId: string): ServicePageSlug | null {
  return SERVICE_PAGE_SLUGS.find((slug) => SERVICE_PAGES[slug].serviceItemId === serviceItemId) ?? null;
}

export function servicePageTopic(slug: ServicePageSlug | null): CallbackTopic | '' {
  return slug ? SERVICE_PAGES[slug].topic : '';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/lib/service-pages.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/service-pages.ts src/lib/service-pages.test.ts
git commit -m "feat(service-pages): add the landing page registry"
```

---

### Task 2: Attribute callback leads to the landing page (server side)

**Files:**
- Modify: `src/lib/callback/types.ts` (`CallbackLead`)
- Modify: `src/lib/callback/delivery-pipeline.ts`
- Modify: `src/lib/notify/email.ts`
- Modify: `src/lib/notify/telegram.ts`
- Modify: `src/db/schema.ts`
- Modify: `src/lib/outbox/store.ts` (`SqliteOutboxStore.put`, `reviveRow`)
- Create: `drizzle/0001_add_landing_page.sql` and drizzle meta files (generated)
- Test: `src/lib/callback/delivery-pipeline.test.ts`, `src/lib/notify/email.test.ts`, `src/lib/notify/telegram.test.ts`, `src/lib/outbox/store.test.ts`

**Interfaces:**
- Consumes: `ServicePageSlug`, `SERVICE_PAGES`, `isServicePageSlug`, `servicePagePath` from Task 1.
- Produces: `CallbackLead.landingPage?: ServicePageSlug`. `submitCallbackLead` reads `payload.landingPage` (string slug). Outbox column `landing_page` (nullable text).

- [ ] **Step 1: Write the failing tests**

Add to `src/lib/callback/delivery-pipeline.test.ts`, inside `describe('Field sanitization: topics, source, locale', ...)`:
```ts
    it('passes a known landing page through', async () => {
      await submitCallbackLead({ ...validPayload, source: 'service', landingPage: 'kpir' }, mockDeps);
      expect(mockDeps.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ source: 'service', landingPage: 'kpir' }),
        expect.anything()
      );
    });

    it('drops an unknown landing page but still delivers the lead', async () => {
      for (const landingPage of ['<script>alert(1)</script>', '__proto__', 'toString', 42, { slug: 'kpir' }]) {
        vi.mocked(mockDeps.sendEmail).mockClear();
        const result = await submitCallbackLead({ ...validPayload, landingPage }, mockDeps);
        expect(result.status).toBe('delivered');
        expect(vi.mocked(mockDeps.sendEmail).mock.calls[0][0]).not.toHaveProperty('landingPage');
      }
    });
```
Add next to the existing buffering test that asserts `saved?.locale` (around line 326–343) a new test:
```ts
    it('keeps the landing page of a buffered lead', async () => {
      vi.mocked(mockDeps.sendEmail).mockResolvedValue(false);
      const result = await submitCallbackLead({ ...validPayload, landingPage: 'inkubator-spolek' }, mockDeps);
      if (result.status !== 'buffered') throw new Error('Expected buffered status');
      expect((await memoryStore.get(result.id))?.landingPage).toBe('inkubator-spolek');
    });
```
(Check how the existing buffering test makes e-mail fail and mirror it exactly if it differs from `mockResolvedValue(false)`.)

Add to `src/lib/notify/email.test.ts` inside `describe('buildCallbackEmail', ...)`:
```ts
  it('names the landing page the request came from', () => {
    const email = buildCallbackEmail({ ...base, source: 'service', landingPage: 'kpir' });
    expect(email.text).toContain('Podstrona usługowa: Księga przychodów i rozchodów (KPiR) (/uslugi/kpir)');
    expect(email.html).toContain('Księga przychodów i rozchodów (KPiR) (/uslugi/kpir)');
  });

  it('gives the Ukrainian path for a request from the Ukrainian page', () => {
    const email = buildCallbackEmail({ ...base, locale: 'uk', landingPage: 'ksef' });
    expect(email.text).toContain('Podstrona usługowa: KSeF (/uk/uslugi/ksef)');
  });

  it('says no landing page when the request came from elsewhere', () => {
    expect(buildCallbackEmail(base).text).toContain('Podstrona usługowa: Nie dotyczy');
  });
```

Add to `src/lib/notify/telegram.test.ts`:
```ts
  it('names the landing page by its fixed label', () => {
    const text = buildTelegramPingText({ ...sampleData, landingPage: 'kadry-i-place' });
    expect(text).toContain('podstrona: Kadry i płace');
  });

  it('leaves the landing page out when there is none or it is not a known page', () => {
    expect(buildTelegramPingText(sampleData)).not.toContain('podstrona:');
    const tampered = { ...sampleData, landingPage: '+48501482555' } as unknown as CallbackNotificationData;
    expect(buildTelegramPingText(tampered)).not.toContain('501482555');
  });
```

Add to `src/lib/outbox/store.test.ts`, in the `SqliteOutboxStore` describe that uses `initDb({ path: ':memory:' })` and the `valid` fixture:
```ts
  it('stores and returns the landing page', async () => {
    const store = new SqliteOutboxStore(testDb);
    await store.put({ ...valid, landingPage: 'ryczalt' });
    expect((await store.get(valid.id))?.landingPage).toBe('ryczalt');
  });

  it('revives a record stored without a landing page, as before the migration', async () => {
    const store = new SqliteOutboxStore(testDb);
    await store.put(valid);
    const record = await store.get(valid.id);
    expect(record).not.toBeNull();
    expect(record).not.toHaveProperty('landingPage');
  });

  it('ignores an unknown landing page in a stored row', async () => {
    const store = new SqliteOutboxStore(testDb);
    await store.put(valid);
    testDb.update(schema.outboxRecords).set({ landingPage: 'nieznana' }).where(eq(schema.outboxRecords.id, valid.id)).run();
    expect(await store.get(valid.id)).not.toHaveProperty('landingPage');
  });
```
(`initDb` returns the drizzle database used by the existing tests in this block; if the existing tests construct the store differently, construct it the same way.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/lib/callback src/lib/notify src/lib/outbox`
Expected: FAIL – `landingPage` missing from leads/e-mail/ping; TypeScript-level errors on `landingPage` in the store test (`schema.outboxRecords` has no `landingPage`).

- [ ] **Step 3: Implement**

`src/lib/callback/types.ts` – add the type import at the top and the field:
```ts
import type { ServicePageSlug } from '@/lib/service-pages';
```
```ts
export interface CallbackLead {
  id: string; // 6 uppercase hex characters, e.g. 'A1B2C3'
  phone: string; // E.164 normalized, e.g. '+48501482555'
  slot: CallbackSlot;
  topic?: CallbackTopic | '';
  source: CallbackSource | 'unknown';
  locale: Locale;
  /** The service page the widget was opened on, if any. */
  landingPage?: ServicePageSlug;
  createdAt: string; // ISO 8601
}
```

`src/lib/callback/delivery-pipeline.ts` – import `isServicePageSlug` from `@/lib/service-pages`; after `const locale: Locale = ...` add:
```ts
    const landingPage = isServicePageSlug(record.landingPage) ? record.landingPage : undefined;
```
Build the lead with the field only when present:
```ts
    const lead: CallbackLead = {
      id,
      phone: phoneResult.normalized,
      slot: record.slot as CallbackSlot,
      topic,
      source,
      locale,
      ...(landingPage ? { landingPage } : {}),
      createdAt: new Date().toISOString(),
    };
```
and in `store.put({...})` add after `locale: lead.locale,`:
```ts
            ...(lead.landingPage ? { landingPage: lead.landingPage } : {}),
```

`src/lib/notify/email.ts` – import `{ SERVICE_PAGES, isServicePageSlug, servicePagePath }` from `@/lib/service-pages`; add:
```ts
function getLandingPageLabel(data: CallbackNotificationData): string {
  if (!isServicePageSlug(data.landingPage)) return 'Nie dotyczy';
  return `${SERVICE_PAGES[data.landingPage].label} (${servicePagePath(data.locale, data.landingPage)})`;
}
```
In `buildCallbackEmail`: `const landingPageLabel = getLandingPageLabel(data);`, add `landingPage: escapeHtml(landingPageLabel)` to `h`, add the text line after `Źródło zgłoszenia: ${source}`:
```
Podstrona usługowa: ${landingPageLabel}
```
and the HTML row after the „Miejsce wywołania” row:
```html
    <tr>
      <td style="padding: 8px 0; color: #64748b;">Podstrona usługowa:</td>
      <td style="padding: 8px 0;">${h.landingPage}</td>
    </tr>
```

`src/lib/notify/telegram.ts` – import `{ SERVICE_PAGES, isServicePageSlug }` from `@/lib/service-pages`; in `buildTelegramPingText`:
```ts
  const landingPageTag = isServicePageSlug(data.landingPage) ? `podstrona: ${SERVICE_PAGES[data.landingPage].label} · ` : '';
```
and insert `landingPageTag` right before `źródło:` in the message (`... · temat: ${topicLabel} · ${landingPageTag}źródło: ...`).

`src/db/schema.ts` – add after `locale`:
```ts
  landingPage: text('landing_page'),
```

`src/lib/outbox/store.ts` – import `isServicePageSlug` from `@/lib/service-pages`. In `reviveRow`, after the `topic` block:
```ts
    if (isServicePageSlug(row.landingPage)) {
      raw.landingPage = row.landingPage;
    }
```
In `put`, after `locale: record.locale,`:
```ts
        landingPage: record.landingPage ?? null,
```

- [ ] **Step 4: Generate the migration**

Run: `pnpm db:generate --name add_landing_page`
Expected: creates `drizzle/0001_add_landing_page.sql` containing `ALTER TABLE \`outbox_records\` ADD \`landing_page\` text;` and updates `drizzle/meta/_journal.json` plus `drizzle/meta/0001_snapshot.json`. Open the SQL and confirm it adds only that column (no table rebuild).

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run src/lib/callback src/lib/notify src/lib/outbox src/app/api && pnpm check:types`
Expected: PASS, no type errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/callback src/lib/notify src/lib/outbox src/db/schema.ts drizzle
git commit -m "feat(callback): record the service page a lead came from"
```

---

### Task 3: Widget – landing page from the path and preset topic

**Files:**
- Modify: `src/components/callback-widget/types.ts` (`CallbackContextType`)
- Modify: `src/components/callback-widget/CallbackContext.tsx`
- Modify: `src/components/callback-widget/useCallbackForm.ts`
- Modify: `src/components/callback-widget/CallbackFormModal.tsx`
- Modify: `src/components/callback-widget/analytics.ts`
- Test: `src/components/callback-widget/useCallbackForm.test.ts`, `src/components/callback-widget/analytics.test.ts`, create `src/components/callback-widget/CallbackContext.test.tsx`

**Interfaces:**
- Consumes: `ServicePageSlug`, `servicePageSlugOfPath`, `servicePageTopic` (Task 1). Server accepts `landingPage` (Task 2).
- Produces: `CallbackContextType.landingPage: ServicePageSlug | null`; `UseCallbackFormOptions.landingPage?: ServicePageSlug | null`; `pushCallbackRequestSubmit` param `landing_page?: string` → `dataLayer` field `landing_page` (`'none'` when absent). `openWidget('service')` is what the landing page CTA calls (Task 6).

- [ ] **Step 1: Write the failing tests**

`src/components/callback-widget/CallbackContext.test.tsx`:
```tsx
// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CallbackProvider, useCallbackWidget } from './CallbackContext';

const pathname = vi.hoisted(() => ({ value: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => pathname.value }));

function Probe() {
  const { landingPage } = useCallbackWidget();
  return <output>{landingPage ?? 'none'}</output>;
}

describe('CallbackProvider', () => {
  it.each([
    ['/uslugi/kpir', 'kpir'],
    ['/uk/uslugi/inkubator-spolek', 'inkubator-spolek'],
    ['/kontakt', 'none'],
    ['/uslugi', 'none'],
  ])('on %s gives the landing page %s', (path, expected) => {
    pathname.value = path;
    render(<CallbackProvider><Probe /></CallbackProvider>);
    expect(screen.getByRole('status')).toHaveTextContent(expected);
  });
});
```

Add to `src/components/callback-widget/useCallbackForm.test.ts` (reuse `createOptions`, `mockFetchResponse`, fake timers and `now` from the file; mirror how existing tests submit – read one submit test first and copy its act/advance pattern):
```ts
  it('presets the topic of the landing page when the form opens there', () => {
    const { result } = renderHook(() => useCallbackForm(createOptions({ landingPage: 'kadry-i-place' })));
    expect(result.current.topic).toBe('kadry-place');
  });

  it('keeps the topic the visitor chose when the form opens again on another page', () => {
    const { result, rerender } = renderHook((props: UseCallbackFormOptions) => useCallbackForm(props), {
      initialProps: createOptions({ landingPage: 'kpir' }),
    });
    act(() => result.current.setTopic('fundacja'));
    rerender(createOptions({ isOpen: false, landingPage: 'kpir' }));
    rerender(createOptions({ isOpen: true, landingPage: 'pelna-ksiegowosc' }));
    expect(result.current.topic).toBe('fundacja');
  });

  it('drops an untouched preset when the form opens off the landing pages', () => {
    const { result, rerender } = renderHook((props: UseCallbackFormOptions) => useCallbackForm(props), {
      initialProps: createOptions({ landingPage: 'kpir' }),
    });
    rerender(createOptions({ isOpen: false, landingPage: null }));
    rerender(createOptions({ isOpen: true, landingPage: null }));
    expect(result.current.topic).toBe('');
  });

  it('sends the landing page with the request and to analytics', async () => {
    mockFetchResponse({ success: true, id: 'A1B2C3', delivery: 'direct' });
    const { result } = renderHook(() => useCallbackForm(createOptions({ source: 'service', landingPage: 'ksef' })));
    act(() => result.current.setPhone('501 482 555'));
    now += 5000;
    await act(async () => {
      result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
      await vi.runAllTimersAsync();
    });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body).toMatchObject({ source: 'service', landingPage: 'ksef', topic: 'inne' });
    expect(window.dataLayer).toContainEqual(expect.objectContaining({ event: 'callback_request_submit', landing_page: 'ksef' }));
  });

  it('sends no landing page off the landing pages', async () => {
    mockFetchResponse({ success: true, id: 'A1B2C3', delivery: 'direct' });
    const { result } = renderHook(() => useCallbackForm(createOptions()));
    act(() => result.current.setPhone('501 482 555'));
    now += 5000;
    await act(async () => {
      result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
      await vi.runAllTimersAsync();
    });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).not.toHaveProperty('landingPage');
    expect(window.dataLayer).toContainEqual(expect.objectContaining({ landing_page: 'none' }));
  });
```

Add to `src/components/callback-widget/analytics.test.ts`:
```ts
  it('records the landing page of a request, or none', () => {
    window.dataLayer = [];
    pushCallbackRequestSubmit({ source: 'service', time_slot: 'asap', delivery: 'direct', landing_page: 'kpir' });
    pushCallbackRequestSubmit({ source: 'header', time_slot: 'asap', delivery: 'direct' });
    expect(window.dataLayer).toEqual([
      expect.objectContaining({ landing_page: 'kpir' }),
      expect.objectContaining({ landing_page: 'none' }),
    ]);
  });
```
(`analytics.test.ts` may run in the node environment; if `window` is undefined there, add `// @vitest-environment jsdom` at the top of the file and import `pushCallbackRequestSubmit`.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/components/callback-widget`
Expected: FAIL – `landingPage` not on the context, topic not preset, no `landing_page` in `dataLayer`.

- [ ] **Step 3: Implement**

`src/components/callback-widget/types.ts`:
```ts
import type { ServicePageSlug } from '@/lib/service-pages';
```
```ts
export interface CallbackContextType {
  isOpen: boolean;
  source: WidgetTriggerSource;
  /** The service page being viewed, so every opening there is attributed to it. */
  landingPage: ServicePageSlug | null;
  openWidget: (source?: WidgetTriggerSource) => void;
  closeWidget: () => void;
}
```

`src/components/callback-widget/CallbackContext.tsx` – import `usePathname` from `next/navigation` and `servicePageSlugOfPath` from `@/lib/service-pages`; in the provider:
```tsx
  const landingPage = servicePageSlugOfPath(usePathname() || '/');
```
and add `landingPage` to the memoized value and its dependency list.

`src/components/callback-widget/useCallbackForm.ts`:
- Options: add `landingPage?: ServicePageSlug | null;` (type import from `@/lib/service-pages`), import `servicePageTopic`.
- Destructure `landingPage = null`.
- Replace the topic state:
```ts
  const [topic, setTopicState] = useState<CallbackTopic | ''>(() => servicePageTopic(landingPage));
  // Once the visitor picks a topic, a service page's preset no longer replaces it.
  const topicChosenRef = useRef(false);
```
- In the open/close effect's `else` branch add, and add `landingPage` to its dependencies:
```ts
      if (!topicChosenRef.current) setTopicState(servicePageTopic(landingPage));
```
- Add:
```ts
  const setTopic = (value: CallbackTopic | '') => {
    topicChosenRef.current = true;
    setTopicState(value);
  };
```
- In `resetForm`, replace `setTopic('')` with `topicChosenRef.current = false;` and `setTopicState('');`.
- In the request body add `landingPage: landingPage ?? undefined,` after `source,`.
- In `pushCallbackRequestSubmit({...})` add `landing_page: landingPage ?? undefined,`.

`src/components/callback-widget/CallbackFormModal.tsx` – take `landingPage` from `useCallbackWidget()` and pass it to `useCallbackForm({ ..., landingPage })`.

`src/components/callback-widget/analytics.ts` – add `landing_page?: string;` to the params type and `landing_page: params.landing_page || 'none',` to the pushed event.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/components/callback-widget && pnpm check:types && pnpm lint`
Expected: PASS. If `react-hooks` lint complains about the ref read in the effect, keep the logic and follow the rule's suggested form; do not disable the rule.

- [ ] **Step 5: Commit**

```bash
git add src/components/callback-widget
git commit -m "feat(widget): attribute requests to the service page and preset its topic"
```

---

### Task 4: Content model and Polish draft copy

**Files:**
- Create: `src/content/service-pages/types.ts`
- Create: `src/content/service-pages/pl/shared.ts`
- Create: `src/content/service-pages/pl/pelna-ksiegowosc.ts`, `pl/kpir.ts`, `pl/ryczalt.ts`, `pl/kadry-i-place.ts`, `pl/ksef.ts`, `pl/inkubator-spolek.ts`
- Create: `src/content/service-pages/pl/index.ts`
- Test: `src/content/service-pages/content.test.ts`

**Interfaces:**
- Consumes: `ServicePageSlug`, `SERVICE_PAGE_SLUGS` (Task 1), `Locale`.
- Produces:
  ```ts
  export interface ServicePageStep { title: string; description: string }
  export interface ServicePageFaqItem { question: string; answer: string }
  export interface ServicePagePriceRange { amount: string; note: string }
  export interface ServicePageContent {
    slug: ServicePageSlug;
    locale: Locale;
    meta: { title: string; description: string };
    hero: { title: string; lead: string };
    audience: { title: string; items: string[] };
    scope: { title: string; items: string[] };
    pricing: { title: string; factors: string[]; process: string[]; range?: ServicePagePriceRange };
    steps: { title: string; items: [ServicePageStep, ServicePageStep, ServicePageStep] };
    faq: { title: string; items: ServicePageFaqItem[] };
  }
  export const PL_SERVICE_PAGES: Record<ServicePageSlug, ServicePageContent>; // from pl/index.ts
  ```

- [ ] **Step 1: Write the failing test**

`src/content/service-pages/content.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { SERVICE_PAGE_SLUGS } from '@/lib/service-pages';
import type { Locale } from '@/i18n/types';
import type { ServicePageContent, ServicePageSlugMap } from './types';
import { PL_SERVICE_PAGES } from './pl';

// Task 5 adds the Ukrainian pages here.
const PAGES_BY_LOCALE: [Locale, ServicePageSlugMap][] = [['pl', PL_SERVICE_PAGES]];
const CITY: Record<Locale, string> = { pl: 'Szczecin', uk: 'Щецин' };

function allText(content: ServicePageContent): string[] {
  const texts: string[] = [];
  const walk = (value: unknown) => {
    if (typeof value === 'string') texts.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') Object.values(value).forEach(walk);
  };
  walk(content);
  return texts;
}

describe.each(PAGES_BY_LOCALE)('service page content (%s)', (locale, pages) => {
  it('has every landing page, keyed by its own slug and language', () => {
    expect(Object.keys(pages).sort()).toEqual([...SERVICE_PAGE_SLUGS].sort());
    for (const slug of SERVICE_PAGE_SLUGS) {
      expect(pages[slug].slug).toBe(slug);
      expect(pages[slug].locale).toBe(locale);
    }
  });

  it.each(SERVICE_PAGE_SLUGS)('%s: names Szczecin in the heading', (slug) => {
    expect(pages[slug].hero.title).toContain(CITY[locale]);
  });

  it.each(SERVICE_PAGE_SLUGS)('%s: has 4–6 FAQ questions and 3 steps', (slug) => {
    expect(pages[slug].faq.items.length).toBeGreaterThanOrEqual(4);
    expect(pages[slug].faq.items.length).toBeLessThanOrEqual(6);
    expect(pages[slug].steps.items).toHaveLength(3);
  });

  it.each(SERVICE_PAGE_SLUGS)('%s: keeps the title and description within search result limits', (slug) => {
    expect(pages[slug].meta.title.length).toBeLessThanOrEqual(70);
    expect(pages[slug].meta.description.length).toBeGreaterThanOrEqual(70);
    expect(pages[slug].meta.description.length).toBeLessThanOrEqual(160);
  });

  it.each(SERVICE_PAGE_SLUGS)('%s: publishes no price range until TEWU decides to', (slug) => {
    expect(pages[slug].pricing.range).toBeUndefined();
  });

  it.each(SERVICE_PAGE_SLUGS)('%s: has no empty text or leftover markers', (slug) => {
    for (const text of allText(pages[slug])) {
      expect(text.trim()).not.toBe('');
      expect(text).not.toMatch(/TODO|TBD|lorem|\?\?\?/i);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/content/service-pages`
Expected: FAIL – cannot resolve `./pl`.

- [ ] **Step 3: Write the types**

`src/content/service-pages/types.ts`:
```ts
import type { Locale } from '@/i18n/types';
import type { ServicePageSlug } from '@/lib/service-pages';

export interface ServicePageStep {
  title: string;
  description: string;
}

export interface ServicePageFaqItem {
  question: string;
  answer: string;
}

export interface ServicePagePriceRange {
  amount: string;
  note: string;
}

/** The copy of one service landing page in one language; rendered by ServiceLandingPage. */
export interface ServicePageContent {
  slug: ServicePageSlug;
  locale: Locale;
  meta: { title: string; description: string };
  hero: { title: string; lead: string };
  audience: { title: string; items: string[] };
  scope: { title: string; items: string[] };
  pricing: {
    title: string;
    factors: string[];
    process: string[];
    /** Set only once TEWU decides to publish price ranges; the amounts show only when it is. */
    range?: ServicePagePriceRange;
  };
  steps: { title: string; items: [ServicePageStep, ServicePageStep, ServicePageStep] };
  faq: { title: string; items: ServicePageFaqItem[] };
}

export type ServicePageSlugMap = Record<ServicePageSlug, ServicePageContent>;
```

- [ ] **Step 4: Write the Polish copy**

Use the text below verbatim (it was written against the Global Constraints; claims needing TEWU confirmation are listed in Task 9's questions document).

`src/content/service-pages/pl/shared.ts`:
```ts
import type { ServicePageContent } from '../types';

export const PRICING_PROCESS: ServicePageContent['pricing']['process'] = [
  'Zostawiasz numer telefonu – oddzwaniamy w wybranej przez Ciebie porze.',
  'Rozmawiamy o Twojej firmie: skali działalności, liczbie dokumentów i potrzebach.',
  'Przygotowujemy indywidualną wycenę – bezpłatnie i bez zobowiązań.',
];

export const SWITCH_FROM_ANOTHER_OFFICE: ServicePageContent['steps'] = {
  title: 'Przejście z innego biura w 3 krokach',
  items: [
    {
      title: 'Rozmowa i wycena',
      description: 'Poznajemy Twoją firmę, ustalamy zakres współpracy i przedstawiamy wycenę.',
    },
    {
      title: 'Umowa i wypowiedzenie',
      description: 'Podpisujemy umowę, a Ty wypowiadasz umowę dotychczasowemu biuru. Ustalamy razem miesiąc, od którego przejmujemy rozliczenia.',
    },
    {
      title: 'Przekazanie dokumentacji',
      description: 'Przejmujemy dokumenty i dane księgowe od poprzedniego biura i kontynuujemy rozliczenia bez przerwy w terminach.',
    },
  ],
};
```

`src/content/service-pages/pl/pelna-ksiegowosc.ts`:
```ts
import type { ServicePageContent } from '../types';
import { PRICING_PROCESS, SWITCH_FROM_ANOTHER_OFFICE } from './shared';

export const pelnaKsiegowosc: ServicePageContent = {
  slug: 'pelna-ksiegowosc',
  locale: 'pl',
  meta: {
    title: 'Pełna księgowość spółek Szczecin – Biuro Rachunkowe TEWU',
    description: 'Księgi rachunkowe spółek z o.o., komandytowych, fundacji i stowarzyszeń w Szczecinie. Bezpłatna wycena – oddzwonimy.',
  },
  hero: {
    title: 'Pełna księgowość spółek w Szczecinie',
    lead: 'Prowadzimy księgi rachunkowe spółek, fundacji i stowarzyszeń zgodnie z ustawą o rachunkowości – od bieżącej ewidencji po roczne sprawozdanie finansowe.',
  },
  audience: {
    title: 'Dla kogo jest pełna księgowość?',
    items: [
      'Spółki z o.o., spółki akcyjne i proste spółki akcyjne',
      'Spółki komandytowe i komandytowo-akcyjne',
      'Spółki jawne, partnerskie i przedsiębiorcy, którzy przekroczyli limit przychodów uprawniający do prowadzenia KPiR',
      'Fundacje i stowarzyszenia',
    ],
  },
  scope: {
    title: 'Zakres obsługi',
    items: [
      'Prowadzenie ksiąg rachunkowych i ewidencji VAT',
      'Deklaracje podatkowe i pliki JPK (m.in. JPK_V7, CIT-8)',
      'Roczne sprawozdanie finansowe',
      'Opracowanie polityki rachunkowości',
      'Rozliczenia z ZUS i urzędem skarbowym',
      'Bieżące doradztwo księgowe i reprezentacja przed urzędami',
    ],
  },
  pricing: {
    title: 'Ile kosztuje pełna księgowość?',
    factors: [
      'Liczba dokumentów księgowych w miesiącu',
      'Forma prawna i specyfika działalności, np. transakcje zagraniczne i walutowe',
      'Liczba pracowników i współpracowników, jeśli zlecasz też kadry i płace',
      'Stan dotychczasowej dokumentacji i ewentualne zaległości',
    ],
    process: PRICING_PROCESS,
  },
  steps: SWITCH_FROM_ANOTHER_OFFICE,
  faq: {
    title: 'Najczęstsze pytania',
    items: [
      {
        question: 'Czy moja firma musi prowadzić pełną księgowość?',
        answer: 'Spółki kapitałowe (z o.o., akcyjne, proste spółki akcyjne) oraz spółki komandytowe i komandytowo-akcyjne prowadzą księgi rachunkowe zawsze. Spółki jawne osób fizycznych, spółki partnerskie, spółki cywilne i przedsiębiorcy indywidualni – po przekroczeniu ustawowego limitu przychodów. Fundacje i stowarzyszenia również prowadzą księgi rachunkowe. W razie wątpliwości sprawdzimy to w Twoim przypadku.',
      },
      {
        question: 'Ile kosztuje pełna księgowość?',
        answer: 'Cena zależy głównie od liczby dokumentów, formy prawnej i zakresu usług. Wycenę przygotowujemy indywidualnie i bezpłatnie – zostaw numer telefonu, a oddzwonimy.',
      },
      {
        question: 'Czy mogę przekazywać dokumenty elektronicznie?',
        answer: 'Tak, korzystamy z elektronicznego obiegu dokumentów. Sposób przekazywania dokumentów ustalimy na początku współpracy.',
      },
      {
        question: 'Czy przejmiecie księgowość w trakcie roku obrotowego?',
        answer: 'Tak. Zaczynamy od przeglądu dotychczasowych ksiąg i dokumentów, żeby kontynuować ewidencję bez luk i dotrzymać terminów.',
      },
      {
        question: 'Czy reprezentujecie spółkę przed urzędem skarbowym i ZUS?',
        answer: 'Tak, na podstawie pełnomocnictwa reprezentujemy klientów w kontaktach z urzędami, także podczas kontroli.',
      },
    ],
  },
};
```

`src/content/service-pages/pl/kpir.ts`:
```ts
import type { ServicePageContent } from '../types';
import { PRICING_PROCESS, SWITCH_FROM_ANOTHER_OFFICE } from './shared';

export const kpir: ServicePageContent = {
  slug: 'kpir',
  locale: 'pl',
  meta: {
    title: 'Księgowość KPiR Szczecin – Biuro Rachunkowe TEWU',
    description: 'Podatkowa księga przychodów i rozchodów dla firm i spółek cywilnych w Szczecinie: VAT, ZUS, PIT. Bezpłatna wycena – oddzwonimy.',
  },
  hero: {
    title: 'Księga przychodów i rozchodów (KPiR) w Szczecinie',
    lead: 'Prowadzimy podatkową księgę przychodów i rozchodów dla jednoosobowych firm i spółek cywilnych – razem z rozliczeniami VAT, ZUS i podatku dochodowego.',
  },
  audience: {
    title: 'Dla kogo jest KPiR?',
    items: [
      'Jednoosobowe działalności gospodarcze na skali podatkowej lub podatku liniowym',
      'Spółki cywilne i ich wspólnicy',
      'Spółki jawne osób fizycznych i spółki partnerskie poniżej limitu przychodów dla ksiąg rachunkowych',
      'Osoby, które dopiero zakładają firmę i wybierają formę opodatkowania',
    ],
  },
  scope: {
    title: 'Zakres obsługi',
    items: [
      'Prowadzenie podatkowej księgi przychodów i rozchodów',
      'Rejestry VAT zakupu i sprzedaży oraz pliki JPK_V7',
      'Ewidencja środków trwałych i wyposażenia',
      'Obliczanie zaliczek na podatek dochodowy',
      'Rozliczenia ZUS przedsiębiorcy',
      'Zeznania roczne PIT-36 i PIT-36L',
    ],
  },
  pricing: {
    title: 'Ile kosztuje prowadzenie KPiR?',
    factors: [
      'Liczba dokumentów w miesiącu',
      'Czy firma jest czynnym podatnikiem VAT',
      'Forma opodatkowania',
      'Liczba pracowników, jeśli zlecasz też kadry i płace',
    ],
    process: PRICING_PROCESS,
  },
  steps: SWITCH_FROM_ANOTHER_OFFICE,
  faq: {
    title: 'Najczęstsze pytania',
    items: [
      {
        question: 'Skala podatkowa czy podatek liniowy – co wybrać?',
        answer: 'To zależy od wysokości dochodu, ulg, z których korzystasz, oraz składki zdrowotnej. Pomożemy porównać obie formy na Twoich liczbach.',
      },
      {
        question: 'Czy mogę zmienić formę opodatkowania w trakcie roku?',
        answer: 'Co do zasady formę opodatkowania wybiera się na cały rok podatkowy, a zmianę zgłasza do 20. dnia miesiąca po miesiącu, w którym osiągnięto pierwszy przychód w roku. Pomożemy sprawdzić, czy zmiana się opłaca.',
      },
      {
        question: 'Ile kosztuje prowadzenie KPiR?',
        answer: 'Cena zależy od liczby dokumentów, rozliczeń VAT i zakresu usług. Wycenę przygotowujemy indywidualnie i bezpłatnie – zostaw numer telefonu, a oddzwonimy.',
      },
      {
        question: 'Jakie dokumenty muszę przekazywać?',
        answer: 'Przede wszystkim faktury sprzedaży i zakupu oraz inne dowody przychodów i wydatków firmy. Dokładną listę i terminy przekazywania ustalimy na początku współpracy.',
      },
      {
        question: 'Czy rozliczacie też moje składki ZUS?',
        answer: 'Tak, przygotowujemy deklaracje rozliczeniowe ZUS przedsiębiorcy i pilnujemy terminów płatności składek.',
      },
    ],
  },
};
```

`src/content/service-pages/pl/ryczalt.ts`:
```ts
import type { ServicePageContent } from '../types';
import { PRICING_PROCESS, SWITCH_FROM_ANOTHER_OFFICE } from './shared';

export const ryczalt: ServicePageContent = {
  slug: 'ryczalt',
  locale: 'pl',
  meta: {
    title: 'Księgowość na ryczałcie Szczecin – Biuro Rachunkowe TEWU',
    description: 'Obsługa ryczałtu ewidencjonowanego w Szczecinie: ewidencja przychodów, stawki ryczałtu, PIT-28, ZUS. Bezpłatna wycena – oddzwonimy.',
  },
  hero: {
    title: 'Ryczałt ewidencjonowany – księgowość w Szczecinie',
    lead: 'Prowadzimy ewidencję przychodów i rozliczenia przedsiębiorców na ryczałcie – od właściwej stawki po zeznanie roczne.',
  },
  audience: {
    title: 'Dla kogo?',
    items: [
      'Jednoosobowe działalności gospodarcze na ryczałcie ewidencjonowanym',
      'Spółki cywilne rozliczające się ryczałtem',
      'Przedsiębiorcy, którzy rozważają przejście na ryczałt',
    ],
  },
  scope: {
    title: 'Zakres obsługi',
    items: [
      'Prowadzenie ewidencji przychodów',
      'Weryfikacja właściwej stawki ryczałtu',
      'Obliczanie miesięcznego lub kwartalnego ryczałtu',
      'Rejestry VAT i pliki JPK_V7 dla czynnych podatników VAT',
      'Rozliczenia ZUS przedsiębiorcy, w tym składki zdrowotnej',
      'Zeznanie roczne PIT-28',
    ],
  },
  pricing: {
    title: 'Ile kosztuje obsługa ryczałtu?',
    factors: [
      'Liczba dokumentów w miesiącu',
      'Czy firma jest czynnym podatnikiem VAT',
      'Liczba stawek ryczałtu, które stosujesz',
      'Liczba pracowników, jeśli zlecasz też kadry i płace',
    ],
    process: PRICING_PROCESS,
  },
  steps: SWITCH_FROM_ANOTHER_OFFICE,
  faq: {
    title: 'Najczęstsze pytania',
    items: [
      {
        question: 'Jaka stawka ryczałtu obowiązuje w mojej branży?',
        answer: 'Stawka zależy od rodzaju działalności i wynosi od 2% do 17% przychodu. Sprawdzimy, która stawka dotyczy Twoich usług lub towarów.',
      },
      {
        question: 'Czy na ryczałcie mogę odliczać koszty?',
        answer: 'Nie – ryczałt płaci się od przychodu, bez pomniejszania go o koszty. Przy wysokich kosztach korzystniejsza może być KPiR; pomożemy to porównać.',
      },
      {
        question: 'Jak liczona jest składka zdrowotna na ryczałcie?',
        answer: 'Jej wysokość zależy od rocznego przychodu – są trzy progi. Uwzględnimy ją przy porównaniu form opodatkowania.',
      },
      {
        question: 'Ile kosztuje obsługa ryczałtu?',
        answer: 'Cena zależy od liczby dokumentów, rozliczeń VAT i zakresu usług. Wycenę przygotowujemy indywidualnie i bezpłatnie – zostaw numer telefonu, a oddzwonimy.',
      },
    ],
  },
};
```

`src/content/service-pages/pl/kadry-i-place.ts`:
```ts
import type { ServicePageContent } from '../types';
import { PRICING_PROCESS, SWITCH_FROM_ANOTHER_OFFICE } from './shared';

export const kadryIPlace: ServicePageContent = {
  slug: 'kadry-i-place',
  locale: 'pl',
  meta: {
    title: 'Kadry i płace Szczecin – Biuro Rachunkowe TEWU',
    description: 'Obsługa kadrowo-płacowa w Szczecinie: listy płac, umowy, akta osobowe, deklaracje ZUS i PIT. Bezpłatna wycena – oddzwonimy.',
  },
  hero: {
    title: 'Kadry i płace w Szczecinie',
    lead: 'Naliczamy wynagrodzenia, prowadzimy dokumentację pracowniczą i rozliczamy składki oraz podatki od wynagrodzeń.',
  },
  audience: {
    title: 'Dla kogo?',
    items: [
      'Firmy zatrudniające pracowników na umowę o pracę',
      'Firmy współpracujące ze zleceniobiorcami i wykonawcami umów o dzieło',
      'Przedsiębiorcy, którzy zatrudniają pierwszego pracownika',
    ],
  },
  scope: {
    title: 'Zakres obsługi',
    items: [
      'Sporządzanie list płac',
      'Umowy o pracę i umowy cywilnoprawne',
      'Prowadzenie akt osobowych pracowników',
      'Zgłoszenia i wyrejestrowania w ZUS',
      'Deklaracje ZUS i PIT (m.in. PIT-11, PIT-4R)',
      'Zaświadczenia dla pracowników',
    ],
  },
  pricing: {
    title: 'Ile kosztuje obsługa kadr i płac?',
    factors: [
      'Liczba osób, które rozliczamy',
      'Rodzaje umów: o pracę, zlecenia, o dzieło',
      'Zmienność wynagrodzeń, np. nadgodziny, premie, praca zmianowa',
      'Dodatkowe obowiązki pracodawcy, np. PPK',
    ],
    process: PRICING_PROCESS,
  },
  steps: SWITCH_FROM_ANOTHER_OFFICE,
  faq: {
    title: 'Najczęstsze pytania',
    items: [
      {
        question: 'Ile kosztuje obsługa kadr i płac?',
        answer: 'Cena zależy przede wszystkim od liczby osób, które rozliczamy, i rodzajów umów. Wycenę przygotowujemy indywidualnie i bezpłatnie – zostaw numer telefonu, a oddzwonimy.',
      },
      {
        question: 'Czy przygotujecie umowę dla nowego pracownika?',
        answer: 'Tak, przygotowujemy umowy o pracę i umowy cywilnoprawne oraz zgłaszamy pracowników do ZUS.',
      },
      {
        question: 'Czy prowadzicie akta osobowe pracowników?',
        answer: 'Tak, prowadzimy akta osobowe zgodnie z przepisami prawa pracy.',
      },
      {
        question: 'Jakie zaświadczenia wystawiacie pracownikom?',
        answer: 'Wystawiamy zaświadczenia potrzebne pracownikom, np. o zatrudnieniu i wynagrodzeniu.',
      },
    ],
  },
};
```

`src/content/service-pages/pl/ksef.ts`:
```ts
import type { ServicePageContent } from '../types';
import { PRICING_PROCESS } from './shared';

export const ksef: ServicePageContent = {
  slug: 'ksef',
  locale: 'pl',
  meta: {
    title: 'KSeF – e-faktury i księgowość Szczecin – Biuro TEWU',
    description: 'Pomoc w przejściu na Krajowy System e-Faktur w Szczecinie: uprawnienia, wybór narzędzia, księgowanie faktur z KSeF. Bezpłatna wycena.',
  },
  hero: {
    title: 'KSeF – obsługa e-faktur w Szczecinie',
    lead: 'Krajowy System e-Faktur jest obowiązkowy dla większości firm od 2026 roku. Pomagamy przejść na KSeF i prowadzimy księgowość na podstawie faktur pobieranych bezpośrednio z systemu.',
  },
  audience: {
    title: 'Dla kogo?',
    items: [
      'Firmy, które wystawiają faktury VAT i muszą robić to w KSeF',
      'Firmy, które odbierają faktury od kontrahentów przez KSeF',
      'Przedsiębiorcy, którzy chcą przekazywać faktury biuru bez wysyłania ich mailem',
    ],
  },
  scope: {
    title: 'Zakres obsługi',
    items: [
      'Wyjaśnienie, od kiedy i w jakim zakresie KSeF dotyczy Twojej firmy',
      'Nadanie biuru uprawnień w KSeF',
      'Pomoc w wyborze sposobu wystawiania e-faktur',
      'Księgowanie faktur pobieranych bezpośrednio z KSeF',
      'Wyjaśnienie zasad: numer KSeF, tryb offline i awaryjny, korekty',
    ],
  },
  pricing: {
    title: 'Ile kosztuje obsługa KSeF?',
    factors: [
      'Czy KSeF jest częścią stałej obsługi księgowej w naszym biurze',
      'Liczba wystawianych i otrzymywanych faktur',
      'Zakres potrzebnego wsparcia przy wdrożeniu',
    ],
    process: PRICING_PROCESS,
  },
  steps: {
    title: 'Przejście z innego biura w 3 krokach',
    items: [
      {
        title: 'Rozmowa i wycena',
        description: 'Poznajemy Twoją firmę i sposób fakturowania, ustalamy zakres współpracy i przedstawiamy wycenę.',
      },
      {
        title: 'Umowa i wypowiedzenie',
        description: 'Podpisujemy umowę, a Ty wypowiadasz umowę dotychczasowemu biuru. Ustalamy razem miesiąc, od którego przejmujemy rozliczenia.',
      },
      {
        title: 'Uprawnienia w KSeF',
        description: 'Nadajesz nam uprawnienia w KSeF, a my pobieramy faktury bezpośrednio z systemu – bez przesyłania ich mailem.',
      },
    ],
  },
  faq: {
    title: 'Najczęstsze pytania',
    items: [
      {
        question: 'Od kiedy KSeF jest obowiązkowy?',
        answer: 'Od 1 lutego 2026 r. wystawianie faktur w KSeF objęło największe firmy, a od 1 kwietnia 2026 r. pozostałych podatników VAT. Najmniejsze firmy i faktury z kas fiskalnych mają okres przejściowy do końca 2026 r. Sprawdzimy, które terminy dotyczą Twojej firmy.',
      },
      {
        question: 'Czy muszę kupić nowy program do faktur?',
        answer: 'Niekoniecznie. Faktury w KSeF można wystawiać w bezpłatnych narzędziach Ministerstwa Finansów albo w programie do fakturowania zintegrowanym z KSeF. Pomożemy dobrać rozwiązanie.',
      },
      {
        question: 'Jak biuro otrzyma moje faktury z KSeF?',
        answer: 'Nadajesz biuru uprawnienia w KSeF. Wtedy pobieramy faktury sprzedaży i zakupu bezpośrednio z systemu.',
      },
      {
        question: 'Co, jeśli KSeF nie działa?',
        answer: 'Przepisy przewidują tryb offline i tryb awaryjny – fakturę wystawia się poza systemem i przesyła do KSeF w określonym terminie. Wyjaśnimy, jak postępować w takiej sytuacji.',
      },
      {
        question: 'Ile kosztuje obsługa KSeF?',
        answer: 'Cena zależy od liczby faktur i zakresu wsparcia. Wycenę przygotowujemy indywidualnie i bezpłatnie – zostaw numer telefonu, a oddzwonimy.',
      },
    ],
  },
};
```

`src/content/service-pages/pl/inkubator-spolek.ts`:
```ts
import type { ServicePageContent } from '../types';
import { PRICING_PROCESS } from './shared';

export const inkubatorSpolek: ServicePageContent = {
  slug: 'inkubator-spolek',
  locale: 'pl',
  meta: {
    title: 'Inkubator spółek z o.o. Szczecin – Biuro Rachunkowe TEWU',
    description: 'Zakładasz spółkę z o.o. w Szczecinie? Pomożemy z formalnościami po rejestracji i poprowadzimy księgowość od pierwszego dnia.',
  },
  hero: {
    title: 'Inkubator spółek z o.o. w Szczecinie',
    lead: 'Pomagamy założyć spółkę z o.o. i przeprowadzamy ją przez pierwsze miesiące działalności – od formalności po pierwsze rozliczenia.',
  },
  audience: {
    title: 'Dla kogo?',
    items: [
      'Osoby zakładające pierwszą spółkę z o.o.',
      'Przedsiębiorcy, którzy przenoszą działalność z JDG do spółki',
      'Cudzoziemcy, w tym obywatele Ukrainy, zakładający spółkę w Polsce',
    ],
  },
  scope: {
    title: 'Zakres obsługi',
    items: [
      'Rozmowa o planach i wyborze formy działalności',
      'Formalności po rejestracji spółki, m.in. zgłoszenie do CRBR i rejestracja VAT',
      'Wybór formy opodatkowania spółki',
      'Polityka rachunkowości i otwarcie ksiąg',
      'Pełna księgowość od pierwszego dnia działalności',
    ],
  },
  pricing: {
    title: 'Ile kosztuje inkubator?',
    factors: [
      'Zakres formalności, w których pomagamy',
      'Przewidywana liczba dokumentów w miesiącu',
      'Planowane zatrudnienie',
    ],
    process: PRICING_PROCESS,
  },
  steps: {
    title: 'Jak zacząć w 3 krokach',
    items: [
      {
        title: 'Rozmowa o planach',
        description: 'Poznajemy Twój pomysł na biznes i ustalamy, w czym możemy pomóc.',
      },
      {
        title: 'Formalności',
        description: 'Przeprowadzamy Cię przez formalności związane ze startem spółki.',
      },
      {
        title: 'Start księgowości',
        description: 'Otwieramy księgi i prowadzimy rozliczenia spółki od pierwszego dnia.',
      },
    ],
  },
  faq: {
    title: 'Najczęstsze pytania',
    items: [
      {
        question: 'Jaki kapitał zakładowy jest potrzebny?',
        answer: 'Minimalny kapitał zakładowy spółki z o.o. wynosi 5000 zł.',
      },
      {
        question: 'Czy spółka z o.o. musi prowadzić pełną księgowość?',
        answer: 'Tak, spółka z o.o. prowadzi księgi rachunkowe od pierwszego dnia, niezależnie od wysokości przychodów.',
      },
      {
        question: 'Co trzeba zrobić po rejestracji spółki w KRS?',
        answer: 'Między innymi zgłosić beneficjentów rzeczywistych do CRBR, w razie potrzeby zarejestrować spółkę jako podatnika VAT i uzupełnić dane w urzędzie skarbowym. Pomożemy przejść przez te kroki.',
      },
      {
        question: 'Czy cudzoziemiec może założyć spółkę z o.o. w Polsce?',
        answer: 'Tak, wspólnikami i członkami zarządu spółki z o.o. mogą być także cudzoziemcy, w tym obywatele Ukrainy.',
      },
      {
        question: 'Ile kosztuje inkubator?',
        answer: 'Cena zależy od zakresu wsparcia i skali działalności spółki. Wycenę przygotowujemy indywidualnie i bezpłatnie – zostaw numer telefonu, a oddzwonimy.',
      },
    ],
  },
};
```

`src/content/service-pages/pl/index.ts`:
```ts
import type { ServicePageSlugMap } from '../types';
import { pelnaKsiegowosc } from './pelna-ksiegowosc';
import { kpir } from './kpir';
import { ryczalt } from './ryczalt';
import { kadryIPlace } from './kadry-i-place';
import { ksef } from './ksef';
import { inkubatorSpolek } from './inkubator-spolek';

export const PL_SERVICE_PAGES: ServicePageSlugMap = {
  'pelna-ksiegowosc': pelnaKsiegowosc,
  kpir,
  ryczalt,
  'kadry-i-place': kadryIPlace,
  ksef,
  'inkubator-spolek': inkubatorSpolek,
};
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run src/content/service-pages && pnpm check:types`
Expected: PASS. If a `meta.title`/`meta.description` length check fails, shorten the wording minimally, keeping the service name and „Szczecin”.

- [ ] **Step 6: Commit**

```bash
git add src/content/service-pages
git commit -m "feat(service-pages): add the content model and Polish draft copy"
```

---

### Task 5: Ukrainian copy, content loader and page metadata

**Files:**
- Create: `src/content/service-pages/uk/shared.ts`, `uk/pelna-ksiegowosc.ts`, `uk/kpir.ts`, `uk/ryczalt.ts`, `uk/kadry-i-place.ts`, `uk/ksef.ts`, `uk/inkubator-spolek.ts`, `uk/index.ts`
- Create: `src/content/service-pages/index.ts`
- Modify: `src/content/service-pages/content.test.ts`
- Test: create `src/content/service-pages/index.test.ts`

**Interfaces:**
- Consumes: Task 4 types and `PL_SERVICE_PAGES`; `servicePagePath` (Task 1).
- Produces:
  ```ts
  export const UK_SERVICE_PAGES: ServicePageSlugMap; // uk/index.ts
  export function getServicePageContent(locale: Locale, slug: ServicePageSlug): ServicePageContent; // index.ts
  export function buildServicePageMetadata(locale: Locale, slug: ServicePageSlug): Metadata; // index.ts
  ```

- [ ] **Step 1: Write the failing tests**

In `content.test.ts`, import `UK_SERVICE_PAGES` from `./uk` and change the list to:
```ts
const PAGES_BY_LOCALE: [Locale, ServicePageSlugMap][] = [
  ['pl', PL_SERVICE_PAGES],
  ['uk', UK_SERVICE_PAGES],
];
```
and add, outside `describe.each`:
```ts
describe('Ukrainian service page content', () => {
  it.each(SERVICE_PAGE_SLUGS)('%s: mirrors the Polish structure, so the language switch lands on the same page', (slug) => {
    const pl = PL_SERVICE_PAGES[slug];
    const uk = UK_SERVICE_PAGES[slug];
    expect(uk.audience.items).toHaveLength(pl.audience.items.length);
    expect(uk.scope.items).toHaveLength(pl.scope.items.length);
    expect(uk.pricing.factors).toHaveLength(pl.pricing.factors.length);
    expect(uk.pricing.process).toHaveLength(pl.pricing.process.length);
    expect(uk.faq.items).toHaveLength(pl.faq.items.length);
  });
});
```

`src/content/service-pages/index.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { buildServicePageMetadata, getServicePageContent } from '.';
import { PL_SERVICE_PAGES } from './pl';
import { UK_SERVICE_PAGES } from './uk';

describe('getServicePageContent', () => {
  it('returns the page in the requested language', () => {
    expect(getServicePageContent('pl', 'kpir')).toBe(PL_SERVICE_PAGES.kpir);
    expect(getServicePageContent('uk', 'kpir')).toBe(UK_SERVICE_PAGES.kpir);
  });
});

describe('buildServicePageMetadata', () => {
  it('sets the title, description, canonical and hreflang links of the Polish page', () => {
    expect(buildServicePageMetadata('pl', 'ryczalt')).toEqual({
      title: PL_SERVICE_PAGES.ryczalt.meta.title,
      description: PL_SERVICE_PAGES.ryczalt.meta.description,
      alternates: {
        canonical: '/uslugi/ryczalt',
        languages: { pl: '/uslugi/ryczalt', 'x-default': '/uslugi/ryczalt', uk: '/uk/uslugi/ryczalt' },
      },
    });
  });

  it('points the Ukrainian page canonical at itself', () => {
    const metadata = buildServicePageMetadata('uk', 'ryczalt');
    expect(metadata.title).toBe(UK_SERVICE_PAGES.ryczalt.meta.title);
    expect(metadata.alternates?.canonical).toBe('/uk/uslugi/ryczalt');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/content/service-pages`
Expected: FAIL – cannot resolve `./uk` and `.`.

- [ ] **Step 3: Write the Ukrainian copy**

Translate every Polish file from Task 4 into Ukrainian, file for file (`uk/shared.ts` exports `PRICING_PROCESS` and `SWITCH_FROM_ANOTHER_OFFICE`, page files export the same constant names, `locale: 'uk'`). Rules:
- Same structure and the same number of items as the Polish page (the test enforces it); meaning unchanged, no new claims.
- Follow `src/i18n/uk.ts`: polite plural „ви”, Polish legal and tax terms kept in parentheses after the Ukrainian term the first time on a page, e.g. „Книга доходів і витрат (KPiR)”, „ТОВ (Sp. z o.o.)”, „паушальний податок (ryczałt ewidencjonowany)”, „PIT-36”, „JPK_V7”, „ZUS”, „CRBR”, „KSeF”.
- City: „у Щецині” in H1 and in `meta`; company name stays „TEWU”.
- `meta.title` ≤ 70 characters, `meta.description` 70–160 characters.
- Where a sentence mentions Polish-time office hours, add „(за польським часом)” (ADR 0002 §7). The drafts above do not mention hours, so this normally does not apply.

Reference translation for one page, use as the style guide – `src/content/service-pages/uk/pelna-ksiegowosc.ts`:
```ts
import type { ServicePageContent } from '../types';
import { PRICING_PROCESS, SWITCH_FROM_ANOTHER_OFFICE } from './shared';

export const pelnaKsiegowosc: ServicePageContent = {
  slug: 'pelna-ksiegowosc',
  locale: 'uk',
  meta: {
    title: 'Повна бухгалтерія компаній у Щецині – Бюро TEWU',
    description: 'Ведення бухгалтерських книг для Sp. z o.o., командитних товариств, фундацій та асоціацій у Щецині. Безкоштовна оцінка – передзвонимо.',
  },
  hero: {
    title: 'Повна бухгалтерія компаній у Щецині',
    lead: 'Ведемо бухгалтерські книги товариств, фундацій та асоціацій відповідно до польського Закону про бухгалтерський облік – від поточного обліку до річного фінансового звіту.',
  },
  audience: {
    title: 'Для кого повна бухгалтерія?',
    items: [
      'ТОВ (Sp. z o.o.), акціонерні товариства (S.A.) та прості акціонерні товариства (P.S.A.)',
      'Командитні (sp.k.) та командитно-акціонерні товариства (S.K.A.)',
      'Повні (sp.j.) та партнерські товариства, а також підприємці, які перевищили ліміт доходів для ведення KPiR',
      'Фундації (fundacja) та асоціації (stowarzyszenie)',
    ],
  },
  scope: {
    title: 'Обсяг обслуговування',
    items: [
      'Ведення бухгалтерських книг і реєстрів ПДВ (VAT)',
      'Податкові декларації та файли JPK (зокрема JPK_V7, CIT-8)',
      'Річний фінансовий звіт (sprawozdanie finansowe)',
      'Розробка облікової політики (polityka rachunkowości)',
      'Розрахунки із ZUS та податковою службою',
      'Поточні бухгалтерські консультації та представництво перед установами',
    ],
  },
  pricing: {
    title: 'Скільки коштує повна бухгалтерія?',
    factors: [
      'Кількість бухгалтерських документів на місяць',
      'Організаційно-правова форма та специфіка діяльності, наприклад закордонні та валютні операції',
      'Кількість працівників і співробітників, якщо ви також доручаєте нам кадри та зарплату',
      'Стан попередньої документації та можливі заборгованості',
    ],
    process: PRICING_PROCESS,
  },
  steps: SWITCH_FROM_ANOTHER_OFFICE,
  faq: {
    title: 'Найчастіші запитання',
    items: [
      {
        question: 'Чи мусить моя компанія вести повну бухгалтерію?',
        answer: 'Товариства з обмеженою відповідальністю, акціонерні та прості акціонерні товариства, а також командитні й командитно-акціонерні товариства ведуть бухгалтерські книги завжди. Повні товариства фізичних осіб, партнерські й цивільні товариства та індивідуальні підприємці – після перевищення встановленого законом ліміту доходів. Фундації та асоціації також ведуть бухгалтерські книги. Якщо є сумніви, ми перевіримо це у вашому випадку.',
      },
      {
        question: 'Скільки коштує повна бухгалтерія?',
        answer: 'Ціна залежить насамперед від кількості документів, організаційно-правової форми та обсягу послуг. Оцінку вартості готуємо індивідуально й безкоштовно – залиште номер телефону, і ми передзвонимо.',
      },
      {
        question: 'Чи можу я передавати документи в електронному вигляді?',
        answer: 'Так, ми працюємо з електронним документообігом. Спосіб передачі документів узгодимо на початку співпраці.',
      },
      {
        question: 'Чи візьмете ви бухгалтерію посеред фінансового року?',
        answer: 'Так. Ми починаємо з перевірки попередніх книг і документів, щоб продовжити облік без прогалин і дотримати строків.',
      },
      {
        question: 'Чи представляєте ви компанію перед податковою службою та ZUS?',
        answer: 'Так, на підставі довіреності ми представляємо клієнтів у контактах з установами, зокрема під час перевірок.',
      },
    ],
  },
};
```

`uk/index.ts` mirrors `pl/index.ts` and exports `UK_SERVICE_PAGES: ServicePageSlugMap`.

- [ ] **Step 4: Write the loader and metadata builder**

`src/content/service-pages/index.ts`:
```ts
import type { Metadata } from 'next';
import type { Locale } from '@/i18n/types';
import { servicePagePath, type ServicePageSlug } from '@/lib/service-pages';
import type { ServicePageContent, ServicePageSlugMap } from './types';
import { PL_SERVICE_PAGES } from './pl';
import { UK_SERVICE_PAGES } from './uk';

// Server-only: imported by the [slug] pages, which pass one page's copy to ServiceLandingPage.
const SERVICE_PAGE_CONTENT: Record<Locale, ServicePageSlugMap> = {
  pl: PL_SERVICE_PAGES,
  uk: UK_SERVICE_PAGES,
};

export function getServicePageContent(locale: Locale, slug: ServicePageSlug): ServicePageContent {
  return SERVICE_PAGE_CONTENT[locale][slug];
}

export function buildServicePageMetadata(locale: Locale, slug: ServicePageSlug): Metadata {
  const { meta } = getServicePageContent(locale, slug);
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: servicePagePath(locale, slug),
      languages: {
        pl: servicePagePath('pl', slug),
        'x-default': servicePagePath('pl', slug),
        uk: servicePagePath('uk', slug),
      },
    },
  };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run src/content/service-pages && pnpm check:types`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/content/service-pages
git commit -m "feat(service-pages): add the Ukrainian draft copy and page metadata"
```

---

### Task 6: Landing page component and routes

**Files:**
- Modify: `src/i18n/types.ts`, `src/i18n/pl.ts`, `src/i18n/uk.ts` (new `servicePages` namespace)
- Create: `src/components/service-pages/ServiceLandingPage.tsx`
- Create: `src/components/service-pages/ServiceLandingPage.module.css`
- Create: `src/app/(pl)/uslugi/[slug]/page.tsx`
- Create: `src/app/(uk)/uk/uslugi/[slug]/page.tsx`
- Test: `src/components/service-pages/ServiceLandingPage.test.tsx`, `src/app/service-page-routes.test.tsx`

**Interfaces:**
- Consumes: `getServicePageContent`, `buildServicePageMetadata` (Task 5), `ServicePageContent` type (Task 4), `SERVICE_PAGE_SLUGS`, `isServicePageSlug` (Task 1), `useCallbackWidget().openWidget('service')` (Task 3).
- Produces: `Translations['servicePages']`:
  ```ts
  servicePages: {
    links: Record<ServicePageSlug, string>;
    ctaButton: string;
    phonePrompt: string;
    trust: { insurance: string; certificates: string };
    pricing: { factorsTitle: string; processTitle: string; rangeTitle: string };
    finalCta: { title: string; description: string };
  };
  ```
  Default export `ServiceLandingPage({ content }: { content: ServicePageContent })`.

- [ ] **Step 1: Add the dictionary namespace**

`src/i18n/types.ts` – add `import type { ServicePageSlug } from '@/lib/service-pages';` and, after `servicesPage`, the `servicePages` block from Interfaces above.

`src/i18n/pl.ts` – after `servicesPage`:
```ts
  servicePages: {
    links: {
      'pelna-ksiegowosc': 'Pełna księgowość',
      kpir: 'Księga przychodów i rozchodów (KPiR)',
      ryczalt: 'Ryczałt',
      'kadry-i-place': 'Kadry i płace',
      ksef: 'KSeF',
      'inkubator-spolek': 'Inkubator spółek z o.o.',
    },
    ctaButton: 'Bezpłatna wycena – oddzwonimy',
    phonePrompt: 'Wolisz zadzwonić?',
    trust: {
      insurance: 'Polisa OC biura',
      certificates: 'Certyfikaty MF i SKwP',
    },
    pricing: {
      factorsTitle: 'Od czego zależy cena',
      processTitle: 'Jak wygląda wycena',
      rangeTitle: 'Orientacyjne ceny',
    },
    finalCta: {
      title: 'Porozmawiajmy o Twojej firmie',
      description: 'Zostaw numer telefonu – oddzwonimy w wybranej przez Ciebie porze i przygotujemy bezpłatną wycenę.',
    },
  },
```
`src/i18n/uk.ts` – same place:
```ts
  servicePages: {
    links: {
      'pelna-ksiegowosc': 'Повна бухгалтерія',
      kpir: 'Книга доходів і витрат (KPiR)',
      ryczalt: 'Паушальний податок (ryczałt)',
      'kadry-i-place': 'Кадри та заробітна плата',
      ksef: 'KSeF',
      'inkubator-spolek': 'Інкубатор компаній Sp. z o.o.',
    },
    ctaButton: 'Безкоштовна оцінка – передзвонимо',
    phonePrompt: 'Бажаєте зателефонувати?',
    trust: {
      insurance: 'Страхування відповідальності (OC)',
      certificates: 'Сертифікати MF і SKwP',
    },
    pricing: {
      factorsTitle: 'Від чого залежить ціна',
      processTitle: 'Як ми готуємо оцінку вартості',
      rangeTitle: 'Орієнтовні ціни',
    },
    finalCta: {
      title: 'Поговорімо про вашу компанію',
      description: 'Залиште номер телефону – ми передзвонимо у зручний для вас час і підготуємо безкоштовну оцінку вартості.',
    },
  },
```

- [ ] **Step 2: Write the failing tests**

`src/components/service-pages/ServiceLandingPage.test.tsx`:
```tsx
// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithMantine } from '@/test/render';
import { CallbackProvider, useCallbackWidget } from '@/components/callback-widget';
import { getServicePageContent } from '@/content/service-pages';
import type { ServicePageContent } from '@/content/service-pages/types';
import { plTranslations, ukTranslations } from '@/i18n';
import { CONTACT_DETAILS } from '@/constants';
import ServiceLandingPage from './ServiceLandingPage';

function WidgetProbe() {
  const { isOpen, source } = useCallbackWidget();
  return <output>{isOpen ? `open:${source}` : 'closed'}</output>;
}

function renderPage(content: ServicePageContent) {
  return renderWithMantine(
    <CallbackProvider>
      <ServiceLandingPage content={content} />
      <WidgetProbe />
    </CallbackProvider>,
    { locale: content.locale }
  );
}

describe('ServiceLandingPage', () => {
  it('has one h1: the service name with Szczecin', () => {
    const content = getServicePageContent('pl', 'pelna-ksiegowosc');
    renderPage(content);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(content.hero.title);
  });

  it('shows every section of the page', () => {
    const content = getServicePageContent('pl', 'kpir');
    renderPage(content);
    for (const title of [content.audience.title, content.scope.title, content.pricing.title, content.steps.title, content.faq.title]) {
      expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument();
    }
    for (const step of content.steps.items) expect(screen.getByText(step.title)).toBeInTheDocument();
  });

  it('opens the callback widget from the service CTA', async () => {
    renderPage(getServicePageContent('pl', 'kpir'));
    const ctas = screen.getAllByRole('link', { name: new RegExp(plTranslations.servicePages.ctaButton) });
    expect(ctas.length).toBeGreaterThanOrEqual(2);
    await userEvent.click(ctas[0]);
    expect(screen.getByRole('status')).toHaveTextContent('open:service');
  });

  it('links the office phone number', () => {
    renderPage(getServicePageContent('pl', 'kpir'));
    const phones = screen.getAllByRole('link', { name: CONTACT_DETAILS.phone });
    expect(phones.length).toBeGreaterThanOrEqual(2);
    for (const phone of phones) expect(phone).toHaveAttribute('href', `tel:${CONTACT_DETAILS.phoneE164}`);
  });

  it('keeps every FAQ answer in the page, also while collapsed', () => {
    const content = getServicePageContent('pl', 'ksef');
    const { container } = renderPage(content);
    for (const { question, answer } of content.faq.items) {
      expect(container.textContent).toContain(question);
      expect(container.textContent).toContain(answer);
    }
  });

  it('shows price amounts only when the page has a price range', () => {
    const content = getServicePageContent('pl', 'ryczalt');
    const { unmount } = renderPage(content);
    expect(screen.queryByText(plTranslations.servicePages.pricing.rangeTitle)).not.toBeInTheDocument();
    unmount();

    renderPage({ ...content, pricing: { ...content.pricing, range: { amount: 'od 100 zł netto', note: 'Przykładowa kwota' } } });
    expect(screen.getByText(plTranslations.servicePages.pricing.rangeTitle)).toBeInTheDocument();
    expect(screen.getByText('od 100 zł netto')).toBeInTheDocument();
  });

  it('renders the Ukrainian page with Ukrainian labels', () => {
    renderPage(getServicePageContent('uk', 'inkubator-spolek'));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Щецин');
    expect(screen.getAllByRole('link', { name: new RegExp(ukTranslations.servicePages.ctaButton) }).length).toBeGreaterThan(0);
  });
});
```

`src/app/service-page-routes.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { SERVICE_PAGE_SLUGS } from '@/lib/service-pages';
import { buildServicePageMetadata, getServicePageContent } from '@/content/service-pages';
import * as plRoute from './(pl)/uslugi/[slug]/page';
import * as ukRoute from './(uk)/uk/uslugi/[slug]/page';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
}));

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe.each([
  ['pl', plRoute],
  ['uk', ukRoute],
] as const)('service page route (%s)', (locale, route) => {
  it('pre-renders every landing page and nothing else', () => {
    expect(route.generateStaticParams()).toEqual(SERVICE_PAGE_SLUGS.map((slug) => ({ slug })));
    expect(route.dynamicParams).toBe(false);
  });

  it('passes the page copy in its language to the landing page', async () => {
    const element = await route.default(params('kpir'));
    expect(element.props.content).toBe(getServicePageContent(locale, 'kpir'));
  });

  it('answers an unknown slug with 404', async () => {
    await expect(route.default(params('nieistnieje'))).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('sets the page metadata', async () => {
    expect(await route.generateMetadata(params('ksef'))).toEqual(buildServicePageMetadata(locale, 'ksef'));
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm vitest run src/components/service-pages src/app/service-page-routes.test.tsx src/i18n`
Expected: FAIL – component and routes do not exist. (`src/i18n` tests should already pass with the new namespace; if the shape test fails, the PL/UK `servicePages` keys differ.)

- [ ] **Step 4: Write the component**

`src/components/service-pages/ServiceLandingPage.module.css`:
```css
.faqItem summary {
  cursor: pointer;
  list-style: none;
  display: flex;
  justify-content: space-between;
  gap: var(--mantine-spacing-md);
  font-weight: 700;
  color: var(--mantine-color-slate-9);
}

.faqItem summary::-webkit-details-marker {
  display: none;
}

.faqItem summary::after {
  content: '+';
  font-weight: 400;
  color: var(--mantine-color-brandBlue-6);
}

.faqItem[open] summary::after {
  content: '−';
}
```

`src/components/service-pages/ServiceLandingPage.tsx`:
```tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Award, Briefcase, Building2, CheckCircle2, Phone, ShieldCheck } from 'lucide-react';
import { Anchor, Box, Button, Container, Group, List, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { CONTACT_DETAILS } from '@/constants';
import { useLocale } from '@/i18n/LocaleContext';
import { useCallbackWidget } from '@/components/callback-widget';
import type { ServicePageContent } from '@/content/service-pages/types';
import layoutClasses from '@/components/layout/Layout.module.css';
import classes from './ServiceLandingPage.module.css';

/** The quote button (opens the callback widget) and the office phone, shown on dark backgrounds. */
function QuoteActions({ variant }: { variant: 'primary' | 'white' }) {
  const { t, locale } = useLocale();
  const { openWidget } = useCallbackWidget();
  const contactPath = locale === 'uk' ? '/uk/kontakt' : '/kontakt';

  return (
    <Group justify="center" gap="lg" wrap="wrap">
      <Button
        component={Link}
        href={contactPath}
        onClick={(e) => {
          e.preventDefault();
          openWidget('service');
        }}
        size="lg"
        radius="md"
        fw={800}
        variant={variant === 'white' ? 'white' : 'filled'}
        className={variant === 'primary' ? layoutClasses.primaryButton : undefined}
        rightSection={<ArrowRight size={18} />}
      >
        {t.servicePages.ctaButton}
      </Button>
      <Group gap={8} wrap="nowrap" c="white">
        <Phone size={20} aria-hidden="true" />
        <Text span c="slate.2">{t.servicePages.phonePrompt}</Text>
        <Anchor href={`tel:${CONTACT_DETAILS.phoneE164}`} c="white" fw={800} fz="lg" underline="hover">
          {CONTACT_DETAILS.phone}
        </Anchor>
      </Group>
    </Group>
  );
}

function CheckList({ title, items }: { title: string; items: string[] }) {
  return (
    <Box>
      <Title order={2} fw={900} c="slate.9" mb="lg" fz={{ base: 'xl', md: '1.75rem' }}>
        {title}
      </Title>
      <List
        spacing="sm"
        icon={
          <ThemeIcon size={22} variant="transparent" c="green.6">
            <CheckCircle2 size={20} />
          </ThemeIcon>
        }
      >
        {items.map((item) => (
          <List.Item key={item}>
            <Text c="slate.7">{item}</Text>
          </List.Item>
        ))}
      </List>
    </Box>
  );
}

function TrustItem({ icon, value, label }: { icon: React.ReactNode; value?: string; label: React.ReactNode }) {
  return (
    <Group gap="sm" wrap="nowrap" align="center">
      <ThemeIcon size={40} radius="xl" variant="light">
        {icon}
      </ThemeIcon>
      <Box>
        {value && (
          <Text fw={900} c="slate.9" lh={1.1}>
            {value}
          </Text>
        )}
        <Text size="sm" c="slate.6" lh={1.3}>
          {label}
        </Text>
      </Box>
    </Group>
  );
}

export default function ServiceLandingPage({ content }: { content: ServicePageContent }) {
  const { t, locale } = useLocale();
  const stats = t.home.hero.stats;
  const certificatesPath = locale === 'uk' ? '/uk/certyfikaty' : '/certyfikaty';

  return (
    <Stack gap={0} bg="white">
      <Box component="section" bg="slate.9" py={{ base: 64, md: 96 }} ta="center">
        <Container size="md" px="md">
          <Title order={1} c="white" fw={900} mb="md" style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', letterSpacing: '-0.025em' }}>
            {content.hero.title}
          </Title>
          <Text size="xl" c="slate.4" mb="xl">
            {content.hero.lead}
          </Text>
          <QuoteActions variant="primary" />
        </Container>
      </Box>

      <Box component="section" py="xl" bg="slate.0">
        <Container size="xl" px="md">
          <SimpleGrid cols={{ base: 2, md: 4 }} spacing="lg">
            <TrustItem icon={<Briefcase size={20} />} value={stats.yearsCount} label={stats.yearsLabel} />
            <TrustItem icon={<Building2 size={20} />} value={stats.companiesCount} label={stats.companiesLabel} />
            <TrustItem icon={<ShieldCheck size={20} />} label={t.servicePages.trust.insurance} />
            <TrustItem
              icon={<Award size={20} />}
              label={
                <Anchor component={Link} href={certificatesPath} c="brandBlue.7" underline="hover">
                  {t.servicePages.trust.certificates}
                </Anchor>
              }
            />
          </SimpleGrid>
        </Container>
      </Box>

      <Box component="section" py={{ base: 64, md: 96 }}>
        <Container size="xl" px="md">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={48}>
            <CheckList title={content.audience.title} items={content.audience.items} />
            <CheckList title={content.scope.title} items={content.scope.items} />
          </SimpleGrid>
        </Container>
      </Box>

      <Box component="section" py={{ base: 64, md: 96 }} bg="slate.0">
        <Container size="lg" px="md">
          <Title order={2} fw={900} c="slate.9" mb="xl" ta="center" fz={{ base: 'xl', md: '2rem' }}>
            {content.pricing.title}
          </Title>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Paper p="xl" radius="lg" withBorder>
              <Title order={3} fz="lg" c="slate.9" mb="md">
                {t.servicePages.pricing.factorsTitle}
              </Title>
              <List spacing="xs">
                {content.pricing.factors.map((factor) => (
                  <List.Item key={factor}>
                    <Text c="slate.7">{factor}</Text>
                  </List.Item>
                ))}
              </List>
            </Paper>
            <Paper p="xl" radius="lg" withBorder>
              <Title order={3} fz="lg" c="slate.9" mb="md">
                {t.servicePages.pricing.processTitle}
              </Title>
              <List type="ordered" spacing="xs">
                {content.pricing.process.map((step) => (
                  <List.Item key={step}>
                    <Text c="slate.7">{step}</Text>
                  </List.Item>
                ))}
              </List>
            </Paper>
          </SimpleGrid>
          {content.pricing.range && (
            <Paper p="xl" radius="lg" withBorder mt="xl" ta="center">
              <Title order={3} fz="lg" c="slate.9" mb="xs">
                {t.servicePages.pricing.rangeTitle}
              </Title>
              <Text fw={900} fz="xl" c="brandBlue.7">
                {content.pricing.range.amount}
              </Text>
              <Text size="sm" c="slate.6">
                {content.pricing.range.note}
              </Text>
            </Paper>
          )}
        </Container>
      </Box>

      <Box component="section" py={{ base: 64, md: 96 }}>
        <Container size="xl" px="md">
          <Title order={2} fw={900} c="slate.9" mb="xl" ta="center" fz={{ base: 'xl', md: '2rem' }}>
            {content.steps.title}
          </Title>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {content.steps.items.map((step, index) => (
              <Paper key={step.title} p="xl" radius="lg" withBorder>
                <ThemeIcon size={40} radius="xl" mb="md" fw={900}>
                  {index + 1}
                </ThemeIcon>
                <Title order={3} fz="lg" c="slate.9" mb="xs">
                  {step.title}
                </Title>
                <Text c="slate.6">{step.description}</Text>
              </Paper>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Box component="section" py={{ base: 64, md: 96 }} bg="slate.0">
        <Container size="md" px="md">
          <Title order={2} fw={900} c="slate.9" mb="xl" ta="center" fz={{ base: 'xl', md: '2rem' }}>
            {content.faq.title}
          </Title>
          <Stack gap="sm">
            {/* Native <details>: answers stay in the HTML for search engines and work without JavaScript */}
            {content.faq.items.map(({ question, answer }) => (
              <Paper key={question} component="details" p="lg" radius="md" withBorder className={classes.faqItem}>
                <summary>{question}</summary>
                <Text mt="sm" c="slate.7">
                  {answer}
                </Text>
              </Paper>
            ))}
          </Stack>
        </Container>
      </Box>

      <Box component="section" py={{ base: 64, md: 96 }} bg="brandBlue.6" ta="center">
        <Container size="md" px="md">
          <Title order={2} c="white" fw={900} mb="md" fz={{ base: 'xl', md: '2.25rem' }}>
            {t.servicePages.finalCta.title}
          </Title>
          <Text c="blue.1" size="lg" mb="xl">
            {t.servicePages.finalCta.description}
          </Text>
          <QuoteActions variant="white" />
        </Container>
      </Box>
    </Stack>
  );
}
```
If `layoutClasses.primaryButton` does not exist in `Layout.module.css`, use the class the Navbar CTA uses (`classes.primaryButton` there comes from the same file).

- [ ] **Step 5: Write the routes**

`src/app/(pl)/uslugi/[slug]/page.tsx`:
```tsx
import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ServiceLandingPage from '@/components/service-pages/ServiceLandingPage';
import { buildServicePageMetadata, getServicePageContent } from '@/content/service-pages';
import { SERVICE_PAGE_SLUGS, isServicePageSlug } from '@/lib/service-pages';

type Props = { params: Promise<{ slug: string }> };

// Only the listed landing pages exist; any other /uslugi/<slug> is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
    return SERVICE_PAGE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    return isServicePageSlug(slug) ? buildServicePageMetadata('pl', slug) : {};
}

export default async function ServicePage({ params }: Props) {
    const { slug } = await params;
    if (!isServicePageSlug(slug)) notFound();
    return <ServiceLandingPage content={getServicePageContent('pl', slug)} />;
}
```
`src/app/(uk)/uk/uslugi/[slug]/page.tsx`: identical, with `'uk'` in both calls and the component named `UkrainianServicePage`.

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm vitest run src/components/service-pages src/app src/i18n && pnpm check:types && pnpm lint`
Expected: PASS, including `src/i18n/client-bundles.test.ts` (the component must not import a dictionary or `@/content/service-pages` at runtime – only `import type`).

- [ ] **Step 7: Commit**

```bash
git add src/i18n src/components/service-pages src/app
git commit -m "feat(service-pages): render the landing pages in both languages"
```

---

### Task 7: Navigation – menu, footer, service cards

**Files:**
- Modify: `src/i18n/types.ts`, `src/i18n/pl.ts`, `src/i18n/uk.ts`
- Modify: `src/components/Footer.tsx`
- Modify: `src/app/(pl)/uslugi/ServicesClient.tsx`
- Modify: `src/components/home/Services.tsx`
- Test: `src/i18n/dictionaries.test.ts`; create `src/components/Footer.test.tsx`, `src/app/(pl)/uslugi/ServicesClient.test.tsx`, `src/components/home/Services.test.tsx`

**Interfaces:**
- Consumes: `SERVICE_PAGE_SLUGS`, `servicePagePath`, `servicePageSlugForServiceItem` (Task 1); `t.servicePages.links` (Task 6).
- Produces: menu item „Inkubator”/„Інкубатор”; two new `servicesPage.items` (`ksef`, `inkubator-spolek`); removes `footer.fullAccounting`, `footer.revenueBook`, `footer.hrAndPayroll`.

- [ ] **Step 1: Write the failing tests**

Add to `src/i18n/dictionaries.test.ts`:
```ts
  it.each([plTranslations, ukTranslations])('put the incubator right after services in the menu ($locale)', (t) => {
    const prefix = t.locale === 'uk' ? '/uk' : '';
    expect(t.nav.links.map((link) => link.path)).toEqual([
      prefix || '/',
      `${prefix}/o-nas`,
      `${prefix}/uslugi`,
      `${prefix}/uslugi/inkubator-spolek`,
      `${prefix}/outsourcing`,
      `${prefix}/certyfikaty`,
      `${prefix}/kontakt`,
    ]);
  });

  it.each([plTranslations, ukTranslations])('have a service card for every landing page ($locale)', (t) => {
    const ids = t.servicesPage.items.map((item) => item.id);
    for (const slug of SERVICE_PAGE_SLUGS) expect(ids).toContain(SERVICE_PAGES[slug].serviceItemId);
  });
```
(import `SERVICE_PAGE_SLUGS, SERVICE_PAGES` from `@/lib/service-pages`.)

`src/components/Footer.test.tsx`:
```tsx
// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithMantine } from '@/test/render';
import { getDictionary, type Locale } from '@/i18n';
import { SERVICE_PAGE_SLUGS, servicePagePath } from '@/lib/service-pages';
import Footer from './Footer';

describe.each(['pl', 'uk'] as Locale[])('Footer (%s)', (locale) => {
  const t = getDictionary(locale);

  it('links every service landing page and outsourcing in the services column', () => {
    renderWithMantine(<Footer />, { locale });
    for (const slug of SERVICE_PAGE_SLUGS) {
      expect(screen.getByRole('link', { name: t.servicePages.links[slug] })).toHaveAttribute('href', servicePagePath(locale, slug));
    }
    expect(screen.getByRole('link', { name: t.footer.bpoOutsourcing })).toHaveAttribute('href', locale === 'uk' ? '/uk/outsourcing' : '/outsourcing');
  });

  it('lists the incubator among the navigation links', () => {
    renderWithMantine(<Footer />, { locale });
    const incubator = t.nav.links.find((link) => link.path.endsWith('/uslugi/inkubator-spolek'))!;
    expect(screen.getByRole('link', { name: incubator.label })).toHaveAttribute('href', incubator.path);
  });
});
```

`src/app/(pl)/uslugi/ServicesClient.test.tsx`:
```tsx
// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithMantine } from '@/test/render';
import { plTranslations } from '@/i18n';
import ServicesClient from './ServicesClient';

const card = (id: string) => plTranslations.servicesPage.items.find((item) => item.id === id)!;

describe('ServicesClient', () => {
  it('shows ten service cards', () => {
    renderWithMantine(<ServicesClient />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(10);
  });

  it('links cards that have a landing page to it', () => {
    renderWithMantine(<ServicesClient />);
    expect(screen.getByRole('link', { name: new RegExp(card('kadry-place').title) })).toHaveAttribute('href', '/uslugi/kadry-i-place');
    expect(screen.getByRole('link', { name: new RegExp(card('ksef').title) })).toHaveAttribute('href', '/uslugi/ksef');
    expect(screen.getByRole('link', { name: new RegExp(card('inkubator-spolek').title) })).toHaveAttribute('href', '/uslugi/inkubator-spolek');
  });

  it('leaves cards without a landing page unlinked', () => {
    renderWithMantine(<ServicesClient />);
    expect(screen.queryByRole('link', { name: new RegExp(card('zus-us').title) })).not.toBeInTheDocument();
  });
});
```
(If a card title contains regex special characters such as parentheses, escape it: `title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`.)

`src/components/home/Services.test.tsx`:
```tsx
// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithMantine } from '@/test/render';
import { plTranslations } from '@/i18n';
import { Services } from './Services';

describe('home Services', () => {
  it('sends each "more" link to the card’s landing page', () => {
    renderWithMantine(<Services />);
    const more = screen.getAllByRole('link', { name: new RegExp(plTranslations.home.services.more) });
    expect(more.map((link) => link.getAttribute('href'))).toEqual([
      '/uslugi/pelna-ksiegowosc',
      '/uslugi/kpir',
      '/uslugi/ryczalt',
      '/uslugi/kadry-i-place',
    ]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/i18n src/components/Footer.test.tsx "src/app/(pl)/uslugi" src/components/home`
Expected: FAIL.

- [ ] **Step 3: Update the dictionaries**

`pl.ts` `nav.links` – insert after Usługi: `{ label: 'Inkubator', path: '/uslugi/inkubator-spolek' },`
`uk.ts` `nav.links` – insert after Послуги: `{ label: 'Інкубатор', path: '/uk/uslugi/inkubator-spolek' },`

Remove `fullAccounting`, `revenueBook`, `hrAndPayroll` from `footer` in `types.ts`, `pl.ts`, `uk.ts` (Footer will stop using them).

Append to `servicesPage.items` in `pl.ts` (after `doradztwo`):
```ts
      {
        id: 'ksef',
        title: 'KSeF – Krajowy System e-Faktur',
        description: 'Pomoc w przejściu na e-faktury i księgowanie faktur pobieranych bezpośrednio z KSeF.',
        features: [
          'Nadanie biuru uprawnień w KSeF',
          'Księgowanie faktur z KSeF',
          'Pomoc w wyborze narzędzia do e-faktur',
          'Wyjaśnienie zasad: numer KSeF, tryb offline, korekty',
        ],
      },
      {
        id: 'inkubator-spolek',
        title: 'Inkubator spółek z o.o.',
        description: 'Wsparcie przy starcie spółki z o.o. i w pierwszych miesiącach jej działalności – od formalności po pełną księgowość.',
        features: [
          'Formalności po rejestracji spółki',
          'Wybór formy opodatkowania',
          'Polityka rachunkowości i otwarcie ksiąg',
          'Pełna księgowość od pierwszego dnia',
        ],
      },
```
and in `uk.ts`:
```ts
      {
        id: 'ksef',
        title: 'KSeF – Національна система електронних рахунків-фактур',
        description: 'Допомога з переходом на е-фактури та облік рахунків-фактур, отриманих безпосередньо з KSeF.',
        features: [
          'Надання бюро повноважень у KSeF',
          'Облік рахунків-фактур із KSeF',
          'Допомога з вибором інструменту для е-фактур',
          'Пояснення правил: номер KSeF, режим офлайн, коригування',
        ],
      },
      {
        id: 'inkubator-spolek',
        title: 'Інкубатор компаній Sp. z o.o.',
        description: 'Підтримка під час старту Sp. z o.o. та в перші місяці її діяльності – від формальностей до повної бухгалтерії.',
        features: [
          'Формальності після реєстрації компанії',
          'Вибір форми оподаткування',
          'Облікова політика та відкриття бухгалтерських книг',
          'Повна бухгалтерія з першого дня',
        ],
      },
```

- [ ] **Step 4: Update the footer**

`src/components/Footer.tsx`:
- Import `SERVICE_PAGE_SLUGS, servicePagePath` from `@/lib/service-pages`; drop `servicesPath` (unused after this change).
- Navigation columns: change `slice(0, 3)` / `slice(3)` to `slice(0, 4)` / `slice(4)` (seven menu links plus the privacy policy split 4 + 4).
- Replace the four hard-coded anchors in the services column with:
```tsx
            <Stack gap="xs">
              {SERVICE_PAGE_SLUGS.map((slug) => (
                <Anchor key={slug} component={Link} href={servicePagePath(locale, slug)} c="slate.3" size="sm" underline="hover" className={classes.footerLink}>
                  {t.servicePages.links[slug]}
                </Anchor>
              ))}
              <Anchor component={Link} href={outsourcingPath} c="slate.3" size="sm" underline="hover" className={classes.footerLink}>
                {t.footer.bpoOutsourcing}
              </Anchor>
            </Stack>
```

- [ ] **Step 5: Link the service cards**

`src/app/(pl)/uslugi/ServicesClient.tsx`:
- Import `Receipt`, `Rocket` from `lucide-react` and add `'ksef': <Receipt size={24} />, 'inkubator-spolek': <Rocket size={24} />` to `SERVICE_ICONS`.
- Import `servicePagePath, servicePageSlugForServiceItem` from `@/lib/service-pages`.
- In the items map, build the card body once and wrap it in a link when the card has a landing page:
```tsx
                        {t.servicesPage.items.map((service) => {
                            const slug = servicePageSlugForServiceItem(service.id);
                            const body = (
                                <>
                                    <Box w={56} h={56} mb="lg" className={classes.iconContainer}>
                                        {SERVICE_ICONS[service.id] || <Building2 size={24} />}
                                    </Box>
                                    <Title order={3} fw={700} c="slate.9" mb="sm" lh={1.3} fz="xl">
                                        {service.title}
                                    </Title>
                                    <Text size="sm" c="slate.6" lh={1.6}>
                                        {service.description}
                                    </Text>
                                    {slug && (
                                        <Group gap={4} mt="md" c="brandBlue.6" fw={700} fz="sm">
                                            {t.home.services.more} <ArrowRight size={16} />
                                        </Group>
                                    )}
                                </>
                            );
                            return slug ? (
                                <Paper
                                    key={service.id}
                                    component={Link}
                                    href={servicePagePath(locale, slug)}
                                    p="xl"
                                    radius="xl"
                                    withBorder
                                    className={classes.serviceCard}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    {body}
                                </Paper>
                            ) : (
                                <Paper key={service.id} p="xl" radius="xl" withBorder className={classes.serviceCard}>
                                    {body}
                                </Paper>
                            );
                        })}
```

`src/components/home/Services.tsx`: import `servicePagePath, servicePageSlugForServiceItem` and change the per-card link to:
```tsx
                            <Link href={(() => { const slug = servicePageSlugForServiceItem(service.id); return slug ? servicePagePath(locale, slug) : servicesPath; })()} className={classes.moreLink}>
```
Prefer a small helper above the component for readability:
```tsx
function cardPath(serviceId: string, locale: Locale, fallback: string): string {
  const slug = servicePageSlugForServiceItem(serviceId);
  return slug ? servicePagePath(locale, slug) : fallback;
}
```
and `href={cardPath(service.id, locale, servicesPath)}` (import `type Locale` from `@/i18n/types`).

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm test && pnpm check:types && pnpm lint`
Expected: PASS (whole suite – the dictionary shape test covers both languages).

- [ ] **Step 7: Commit**

```bash
git add src/i18n src/components src/app
git commit -m "feat(nav): link the service landing pages from the menu, footer and service cards"
```

---

### Task 8: Sitemap

**Files:**
- Create: `src/app/sitemap.ts`
- Test: `src/app/sitemap.test.ts`

**Interfaces:**
- Consumes: `SITE_URL` (`src/constants.tsx`), `SERVICE_PAGE_SLUGS` (Task 1).
- Produces: `/sitemap.xml` (Next.js metadata route). Not matched by the proxy (dotted path).

- [ ] **Step 1: Write the failing test**

`src/app/sitemap.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import sitemap from './sitemap';
import { SITE_URL } from '@/constants';
import { SERVICE_PAGE_SLUGS } from '@/lib/service-pages';

describe('sitemap', () => {
  const entries = sitemap();
  const urls = entries.map((entry) => entry.url);

  it('lists every page in both languages', () => {
    const paths = ['/o-nas', '/uslugi', '/outsourcing', '/certyfikaty', '/kontakt', '/polityka-prywatnosci', ...SERVICE_PAGE_SLUGS.map((slug) => `/uslugi/${slug}`)];
    expect(urls).toContain(`${SITE_URL}/`);
    expect(urls).toContain(`${SITE_URL}/uk`);
    for (const path of paths) {
      expect(urls).toContain(`${SITE_URL}${path}`);
      expect(urls).toContain(`${SITE_URL}/uk${path}`);
    }
    expect(entries).toHaveLength((paths.length + 1) * 2);
  });

  it('gives each entry its hreflang alternates', () => {
    const kpir = entries.find((entry) => entry.url === `${SITE_URL}/uk/uslugi/kpir`);
    expect(kpir?.alternates?.languages).toEqual({
      pl: `${SITE_URL}/uslugi/kpir`,
      uk: `${SITE_URL}/uk/uslugi/kpir`,
      'x-default': `${SITE_URL}/uslugi/kpir`,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/app/sitemap.test.ts`
Expected: FAIL – cannot resolve `./sitemap`.

- [ ] **Step 3: Implement**

`src/app/sitemap.ts`:
```ts
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/constants';
import { SERVICE_PAGE_SLUGS } from '@/lib/service-pages';

// Polish paths; each page also exists under /uk with the same slug (ADR 0002).
const PAGE_PATHS = [
  '/',
  '/o-nas',
  '/uslugi',
  ...SERVICE_PAGE_SLUGS.map((slug) => `/uslugi/${slug}`),
  '/outsourcing',
  '/certyfikaty',
  '/kontakt',
  '/polityka-prywatnosci',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGE_PATHS.flatMap((path) => {
    const pl = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
    const uk = path === '/' ? `${SITE_URL}/uk` : `${SITE_URL}/uk${path}`;
    const alternates = { languages: { pl, uk, 'x-default': pl } };
    return [
      { url: pl, alternates },
      { url: uk, alternates },
    ];
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/app/sitemap.test.ts && pnpm check:types`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/sitemap.ts src/app/sitemap.test.ts
git commit -m "feat(seo): add a sitemap with hreflang alternates"
```

---

### Task 9: Documentation – questions for TEWU, glossary, ADR

**Files:**
- Create: `docs/pytania-do-tewu-podstrony-uslugowe.md`
- Create: `docs/adr/0004-service-landing-pages.md`
- Modify: `CONTEXT.md`

No tests; review is by reading. Write in Polish. Use the text below verbatim, then adjust only if earlier tasks changed a fact it states (e.g. a shortened `meta.title`).

- [ ] **Step 1: Write `docs/pytania-do-tewu-podstrony-uslugowe.md`**

```markdown
# Pytania do TEWU – podstrony usługowe

## Po co ten dokument

Przygotowujemy sześć nowych podstron, na które będą kierować reklamy w Google. Ktoś, kto wpisze np. „księgowość KPiR Szczecin”, trafi od razu na stronę o KPiR, a nie na stronę główną. Takie strony skuteczniej zamieniają kliknięcie w telefon albo prośbę o oddzwonienie, ale tylko wtedy, gdy ich treść jest konkretna i prawdziwa.

Podstrony to:

1. Pełna księgowość spółek – `tewu.szczecin.pl/uslugi/pelna-ksiegowosc`
2. Podatkowa księga przychodów i rozchodów (KPiR) – `/uslugi/kpir`
3. Ryczałt – `/uslugi/ryczalt`
4. Kadry i płace – `/uslugi/kadry-i-place`
5. KSeF – `/uslugi/ksef`
6. Inkubator spółek z o.o. – `/uslugi/inkubator-spolek`

Każda ma też wersję ukraińską (`/uk/uslugi/...`).

Na każdej podstronie jest: nagłówek z nazwą usługi i „Szczecin”, dla kogo jest usługa, zakres obsługi, od czego zależy cena i jak wygląda wycena, przejście z innego biura w 3 krokach, 4–6 najczęstszych pytań (FAQ), przycisk „Bezpłatna wycena – oddzwonimy” i numer telefonu.

Napisaliśmy już wersję roboczą wszystkich tekstów, ale tylko z informacji, które są już na stronie albo wynikają wprost z przepisów. Niczego nie dopisaliśmy „na wyrost”. Żeby strony były naprawdę dobre, potrzebujemy Państwa odpowiedzi poniżej. Wersję roboczą możemy pokazać na podglądzie strony.

**Jak odpowiadać:** wystarczy wpisać odpowiedź pod pytaniem (w miejscu „Odpowiedź:”). Jeśli coś jest nieaktualne albo nieprawdziwe, prosimy o poprawkę. Jeśli na jakieś pytanie nie chcą Państwo odpowiadać publicznie, prosimy o taką adnotację – wtedy po prostu nie umieścimy tej informacji na stronie.

---

## A. Pytania wspólne dla wszystkich podstron

### A1. Czy publikujemy orientacyjne ceny?

**Dlaczego pytamy:** w reklamach i na stronach docelowych widełki cenowe (np. „od X zł netto miesięcznie”) zwykle zwiększają liczbę zapytań i odsiewają klientów, dla których usługa jest za droga. Z drugiej strony utrudniają negocjacje i wymagają aktualizacji. Strona jest przygotowana tak, że ceny pokażą się tylko na tych podstronach, dla których je Państwo podadzą.

- Czy chcą Państwo publikować orientacyjne ceny? Jeśli tak – dla których usług?
- Jeśli tak: jakie kwoty i jakie zastrzeżenie (np. „cena netto”, „przy do 20 dokumentach miesięcznie”)?

Odpowiedź:

### A2. Od czego naprawdę zależy cena?

**Dlaczego pytamy:** na każdej podstronie jest lista „Od czego zależy cena”. Wpisaliśmy typowe czynniki (liczba dokumentów, forma prawna, VAT, liczba pracowników). Prosimy o potwierdzenie albo poprawkę – klient powinien przeczytać to samo, co usłyszy przez telefon.

Odpowiedź:

### A3. Jak wygląda wycena?

**Dlaczego pytamy:** opisaliśmy wycenę w trzech krokach: (1) klient zostawia numer, oddzwaniamy w wybranej porze; (2) rozmowa o firmie, skali i liczbie dokumentów; (3) indywidualna wycena, bezpłatna i bez zobowiązań. Czy tak to wygląda? Czy wycena trafia do klienta mailem, telefonicznie, czy na spotkaniu? Ile to zwykle trwa?

Odpowiedź:

### A4. Przejście z innego biura – czy te 3 kroki są prawdziwe?

**Dlaczego pytamy:** osoba niezadowolona z obecnego biura najbardziej boi się, że przejście będzie kłopotliwe. Napisaliśmy: (1) rozmowa i wycena, (2) umowa z TEWU i wypowiedzenie umowy dotychczasowemu biuru – razem ustalamy miesiąc, od którego TEWU przejmuje rozliczenia, (3) przejęcie dokumentów od poprzedniego biura i kontynuacja rozliczeń bez przerwy w terminach.

- Czy tak to wygląda? Czy TEWU pomaga w napisaniu wypowiedzenia albo kontaktuje się z poprzednim biurem?
- Czy przejęcie jest możliwe w dowolnym miesiącu, także w trakcie roku obrotowego?
- Czy jest coś, co klient musi przygotować (np. pełnomocnictwa, dostęp do systemów)?

Odpowiedź:

### A5. Czy liczby ze strony głównej są aktualne?

**Dlaczego pytamy:** na podstronach pokazujemy pasek zaufania z danymi, które są już na stronie głównej: „25+ lat doświadczenia”, „150+ zadowolonych firm”, polisa OC biura i certyfikaty Ministerstwa Finansów oraz SKwP. Reklamy przyciągną nowych odbiorców, więc te liczby muszą być prawdziwe.

- Czy „25+ lat” i „150+ firm” są aktualne? Czy chcą Państwo podać inne liczby?

Odpowiedź:

### A6. Który numer telefonu podajemy na podstronach?

**Dlaczego pytamy:** na podstronach jest jeden, duży, klikalny numer – jeden numer to jedna prosta decyzja dla osoby z reklamy. Na razie to numer stacjonarny biura **91 48 24 190**. W stopce jest też numer komórkowy **501 482 555**. Większość ruchu z reklam przychodzi z telefonów komórkowych.

- Który numer ma być na podstronach? Kto odbiera telefony z tego numeru i w jakich godzinach?

Odpowiedź:

### A7. Etykieta „Inkubator” w menu głównym

**Dlaczego pytamy:** podstrona „Inkubator spółek z o.o.” jako jedyna ma link w menu głównym na górze strony. W menu jest już sześć pozycji, przełącznik języka i przycisk „Bezpłatna wycena”, więc na laptopach o mniejszym ekranie brakuje miejsca. Pełna nazwa „Inkubator spółek z o.o.” nie zmieściłaby się w jednym wierszu albo zepchnęłaby inne elementy. Dlatego w menu jest krótka etykieta **„Inkubator”** (po ukraińsku „Інкубатор”), umieszczona zaraz po „Usługi”. Pełna nazwa jest w nagłówku samej podstrony i w stopce.

- Czy etykieta „Inkubator” Państwu odpowiada? Jeśli nie – jaką krótką nazwę (najlepiej jedno słowo) proponują Państwo?

Odpowiedź:

### A8. Elektroniczny obieg dokumentów

**Dlaczego pytamy:** w FAQ piszemy, że dokumenty można przekazywać elektronicznie (strona główna wspomina o elektronicznym obiegu dokumentów). Klienci często pytają, jak to działa w praktyce.

- Jak klienci przekazują dokumenty (mail, aplikacja, portal klienta, KSeF)? Czy mamy podać nazwę narzędzia?

Odpowiedź:

### A9. Czy coś wyróżnia TEWU na tle innych biur?

**Dlaczego pytamy:** na stronie z reklamy klient porównuje kilka biur w kilka minut. Konkretny wyróżnik (np. stały opiekun, odpowiedź w ciągu jednego dnia roboczego, specjalizacja w jakiejś branży, obsługa po ukraińsku) działa lepiej niż ogólne „profesjonalizm i rzetelność”.

- Co Państwa zdaniem najbardziej przekonuje klientów do TEWU?
- Czy mają Państwo branże, w których macie szczególne doświadczenie?

Odpowiedź:

---

## B. Pełna księgowość spółek

### B1. Dla kogo i jaki zakres?

**Dlaczego pytamy:** wpisaliśmy: spółki z o.o., akcyjne i proste spółki akcyjne, spółki komandytowe i komandytowo-akcyjne, spółki jawne i partnerskie oraz przedsiębiorców po przekroczeniu limitu dla KPiR, fundacje i stowarzyszenia. Zakres: księgi rachunkowe i ewidencja VAT, deklaracje i JPK, roczne sprawozdanie finansowe, polityka rachunkowości, rozliczenia z ZUS i US, doradztwo i reprezentacja przed urzędami.

- Czy któreś z tych grup lub elementów zakresu należy usunąć albo dopisać?
- Czy TEWU obsługuje spółki rozliczające się estońskim CIT?
- Czy TEWU wysyła sprawozdanie finansowe do KRS i Szefa KAS w imieniu klienta?

Odpowiedź:

### B2. FAQ

**Dlaczego pytamy:** w wersji roboczej są pytania: czy firma musi prowadzić pełną księgowość; ile kosztuje; czy dokumenty można przekazywać elektronicznie; czy przejmiecie księgowość w trakcie roku; czy reprezentujecie spółkę przed US i ZUS. Prosimy o potwierdzenie odpowiedzi i o pytania, które klienci zadają Państwu najczęściej.

Odpowiedź:

---

## C. KPiR (podatkowa księga przychodów i rozchodów)

### C1. Dla kogo i jaki zakres?

**Dlaczego pytamy:** wpisaliśmy: jednoosobowe działalności na skali lub podatku liniowym, spółki cywilne, spółki jawne osób fizycznych i partnerskie poniżej limitu, osoby zakładające firmę. Zakres: KPiR, rejestry VAT i JPK_V7, środki trwałe i wyposażenie, zaliczki na PIT, ZUS przedsiębiorcy, PIT-36 i PIT-36L.

- Czy coś usunąć albo dopisać (np. ulgi, rozliczenie z małżonkiem, IP Box)?

Odpowiedź:

### C2. FAQ

**Dlaczego pytamy:** w wersji roboczej: skala czy liniowy; czy można zmienić formę opodatkowania w trakcie roku; ile kosztuje; jakie dokumenty przekazywać; czy rozliczacie ZUS. Prosimy o potwierdzenie i o najczęstsze pytania klientów.

Odpowiedź:

---

## D. Ryczałt

### D1. Dla kogo i jaki zakres?

**Dlaczego pytamy:** wpisaliśmy: JDG i spółki cywilne na ryczałcie oraz osoby rozważające przejście na ryczałt. Zakres: ewidencja przychodów, weryfikacja stawki, obliczanie ryczałtu, VAT i JPK_V7, ZUS ze składką zdrowotną, PIT-28.

- Czy TEWU rozlicza też ryczałt od najmu prywatnego?
- Czy coś usunąć albo dopisać?

Odpowiedź:

### D2. FAQ

**Dlaczego pytamy:** w wersji roboczej: jaka stawka w mojej branży; czy na ryczałcie odlicza się koszty; jak liczona jest składka zdrowotna; ile kosztuje. Prosimy o potwierdzenie i o najczęstsze pytania klientów.

Odpowiedź:

---

## E. Kadry i płace

### E1. Dla kogo i jaki zakres?

**Dlaczego pytamy:** wpisaliśmy: firmy zatrudniające na umowę o pracę, firmy współpracujące ze zleceniobiorcami i wykonawcami umów o dzieło, firmy zatrudniające pierwszego pracownika. Zakres: listy płac, umowy, akta osobowe, zgłoszenia ZUS, deklaracje ZUS i PIT, zaświadczenia.

- Czy można zlecić same kadry i płace, bez księgowości w TEWU?
- Czy TEWU obsługuje PPK, świadectwa pracy, ewidencję czasu pracy, badania lekarskie i szkolenia BHP (terminy)?
- Czy TEWU pomaga przy zatrudnianiu cudzoziemców, w tym obywateli Ukrainy (powiadomienia do urzędu pracy, zezwolenia)?

Odpowiedź:

### E2. FAQ

**Dlaczego pytamy:** w wersji roboczej: ile kosztuje; czy przygotujecie umowę dla nowego pracownika; czy prowadzicie akta osobowe; jakie zaświadczenia wystawiacie. Prosimy o potwierdzenie i o najczęstsze pytania klientów.

Odpowiedź:

---

## F. KSeF

### F1. Co dokładnie TEWU oferuje w zakresie KSeF?

**Dlaczego pytamy:** to najmniej oczywista z podstron. Ludzie szukają „KSeF” z różnych powodów: nie wiedzą, czy ich to dotyczy, nie umieją wystawić faktury w systemie albo szukają biura, które „obsługuje KSeF”. Wpisaliśmy: wyjaśnienie, od kiedy KSeF dotyczy firmy; nadanie biuru uprawnień; pomoc w wyborze sposobu wystawiania e-faktur; księgowanie faktur pobieranych z KSeF; wyjaśnienie zasad (numer KSeF, tryb offline i awaryjny, korekty).

- Czy KSeF to osobna usługa (np. jednorazowe wdrożenie lub szkolenie), czy część stałej obsługi księgowej?
- Czy TEWU obsługuje w zakresie KSeF także firmy, które nie są klientami księgowymi biura?
- Czy TEWU wystawia faktury w KSeF w imieniu klienta?
- Z jakimi programami do fakturowania TEWU pracuje i czy któryś poleca?

Odpowiedź:

### F2. Terminy KSeF w FAQ

**Dlaczego pytamy:** w FAQ piszemy: od 1 lutego 2026 r. – największe firmy, od 1 kwietnia 2026 r. – pozostali podatnicy VAT, najmniejsze firmy i faktury z kas fiskalnych – okres przejściowy do końca 2026 r. Prosimy o sprawdzenie, czy to zgodne z aktualnymi przepisami i tym, co mówią Państwo klientom.

Odpowiedź:

### F3. Krok 3 przejścia z innego biura

**Dlaczego pytamy:** na tej podstronie trzeci krok to „Nadajesz nam uprawnienia w KSeF, a my pobieramy faktury bezpośrednio z systemu”. Czy tak to wygląda w praktyce?

Odpowiedź:

---

## G. Inkubator spółek z o.o.

### G1. Czym jest Inkubator spółek z o.o.? (najważniejsze pytanie)

**Dlaczego pytamy:** w obecnej stronie nie ma żadnej informacji o inkubatorze, więc tekst roboczy jest najbardziej ogólny ze wszystkich. Założyliśmy, że chodzi o pomoc w założeniu spółki z o.o. i poprowadzenie jej przez pierwsze miesiące. Bez Państwa opisu nie da się napisać tej strony dobrze – a to jedyna podstrona z linkiem w menu głównym.

- Na czym polega usługa? Co klient dostaje?
- Dla kogo jest przeznaczona (nowe spółki, przekształcenia JDG, cudzoziemcy, start-upy)?
- Czy obejmuje założenie spółki (umowa spółki, rejestracja w KRS lub przez S24)? Czy TEWU współpracuje z notariuszem lub kancelarią prawną?
- Czy obejmuje adres siedziby lub wirtualne biuro?
- Jak długo trwa „inkubacja” i co dzieje się po jej zakończeniu?
- Czy jest stała cena lub pakiet?

Odpowiedź:

### G2. „Jak zacząć w 3 krokach” czy „przejście z innego biura”?

**Dlaczego pytamy:** na pozostałych podstronach sekcja 3 kroków opisuje przejście z innego biura. Inkubator jest prawdopodobnie dla nowych spółek, więc na razie wpisaliśmy „Jak zacząć w 3 krokach”: (1) rozmowa o planach, (2) formalności, (3) start księgowości. Która wersja jest właściwa i jak wyglądają te kroki?

Odpowiedź:

### G3. FAQ

**Dlaczego pytamy:** w wersji roboczej: jaki kapitał zakładowy jest potrzebny; czy spółka z o.o. musi prowadzić pełną księgowość; co zrobić po rejestracji w KRS; czy cudzoziemiec może założyć spółkę; ile kosztuje. Prosimy o potwierdzenie i o pytania, które zadają osoby zakładające spółkę.

Odpowiedź:

---

## H. Co dalej

Po otrzymaniu odpowiedzi uzupełnimy teksty obu wersji językowych i pokażemy je Państwu na podglądzie do akceptacji. Podstrony trafią na stronę i do reklam dopiero po tej akceptacji.
```

- [ ] **Step 2: Write `docs/adr/0004-service-landing-pages.md`**

```markdown
# ADR 0004: Podstrony usługowe (strony docelowe reklam)

## Status
Zaakceptowany (Accepted)

## Kontekst
Reklamy Google Ads mają kierować na podstronę odpowiadającą wyszukiwanej frazie, a nie na stronę główną. Powstaje sześć podstron usługowych w wersji polskiej i ukraińskiej. Adresy tych stron trafiają do kampanii, więc ich późniejsza zmiana oznacza przekierowania 301 i edycję reklam. Treść powstaje etapami: najpierw szkic, potem wersja oparta na odpowiedziach TEWU (`docs/pytania-do-tewu-podstrony-uslugowe.md`).

## Decyzje

### 1. Adresy
- Podstrony leżą pod `/uslugi/<slug>`, a wersje ukraińskie pod `/uk/uslugi/<slug>` z tym samym slugiem (ADR 0002 §1).
- Slugi: `pelna-ksiegowosc`, `kpir`, `ryczalt`, `kadry-i-place`, `ksef`, `inkubator-spolek`. Bez „Szczecin” w adresie – miasto niosą H1, `title` i treść.
- Jedna trasa dynamiczna na język (`src/app/(pl)/uslugi/[slug]`, `src/app/(uk)/uk/uslugi/[slug]`) z `generateStaticParams` i `dynamicParams = false`: strony są statyczne, a nieznany slug daje 404.
- Lista slugów, ścieżki, tematy widżetu i polskie nazwy dla powiadomień biura są w jednym rejestrze `src/lib/service-pages.ts`, bez treści stron, żeby mógł go używać kod kliencki.

### 2. Model treści
- Treść podstron jest w typowanych modułach `src/content/service-pages/{pl,uk}/<slug>.ts`, a nie w słownikach i18n. Słownik trafia do bundla każdej strony, a sześć podstron z FAQ to dużo tekstu.
- Serwerowy `page.tsx` przekazuje treść jednej podstrony do wspólnego komponentu `ServiceLandingPage`. Dodanie podstrony to wpis w rejestrze i plik treści w każdym języku.
- Etykiety wspólne (CTA, nagłówki sekcji ceny, pasek zaufania) i krótkie nazwy podstron są w słowniku (`servicePages`).
- Widełki cenowe są polem opcjonalnym. Sekcja z kwotami pokazuje się tylko wtedy, gdy pole jest wypełnione.
- FAQ jest w natywnych elementach `<details>`, żeby odpowiedzi były w HTML także po zwinięciu. Bez danych strukturalnych `FAQPage` – Google pokazuje dziś FAQ rich results prawie wyłącznie stronom rządowym i medycznym.

### 3. Atrybucja leadów
- Każde otwarcie widżetu call-back na podstronie usługowej (dowolnym przyciskiem) dostaje `landingPage` wyliczone ze ścieżki w `CallbackProvider`. `source` dalej mówi, który przycisk kliknięto (CTA podstrony to `service`).
- Formularz ma z góry ustawiony temat podstrony, ale można go zmienić. Wybór odwiedzającego ma pierwszeństwo przed podpowiedzią do czasu wysłania formularza.
- `POST /api/callback` sprawdza `landingPage` według rejestru. Nieznana wartość jest pomijana i nie odrzuca zgłoszenia.
- `landingPage` trafia do e-maila, do pingu w Telegramie (nazwa podstrony z rejestru to nie są dane osobowe), do `callback_request_submit` w `dataLayer` (`landing_page`) i do bufora awaryjnego (kolumna `landing_page`, migracja `0001_add_landing_page`).

### 4. Nawigacja i SEO
- Menu główne: „Inkubator” po „Usługi” – krótka etykieta, bo w menu brakuje miejsca. Pozostałe podstrony linkuje stopka, karty na `/uslugi` i karty na stronie głównej.
- `src/app/sitemap.ts` obejmuje wszystkie strony w obu językach z alternatywami hreflang.

## Konsekwencje
- Zmiana slugu po starcie kampanii wymaga przekierowania 301 ze starego adresu i aktualizacji reklam.
- Raporty Google Ads/GTM mogą rozbijać konwersje z widżetu według `landing_page`.
- Kliknięcia w numer telefonu nie są na razie mierzone (osobne zadanie).

## Przed wydaniem
- Gałąź z podstronami nie trafia na produkcję przed odpowiedziami TEWU i akceptacją treści.
- **Treść ukraińską musi przed wydaniem sprawdzić osoba z TEWU.** Wersje ukraińskie są tłumaczeniem szkicu i mogą zawierać błędy terminologiczne.
```

- [ ] **Step 3: Update `CONTEXT.md`**

Add a new section before `## Callback & Lead Intake`:
```markdown
## Service Pages

**Service Page**:
Podstrona usługowa pod `/uslugi/<slug>` (i `/uk/uslugi/<slug>`), będąca stroną docelową reklam dla jednej usługi: pełna księgowość, KPiR, ryczałt, kadry i płace, KSeF, Inkubator spółek z o.o.
_Avoid_: Landing, lejek, mikrostrona

**Inkubator spółek**:
Usługa TEWU dla zakładanych spółek z o.o., jedyna podstrona usługowa z linkiem w menu głównym (etykieta „Inkubator”). Dokładny zakres do potwierdzenia przez TEWU.
_Avoid_: Akcelerator, start-up

**Landing Page Attribution**:
Przypisanie zgłoszenia call-back do podstrony usługowej, na której otwarto widżet (`landingPage`), niezależnie od przycisku, którym go otwarto (`source`).
_Avoid_: Źródło zgłoszenia, UTM
```
In the **Callback Lead** definition, add „opcjonalną podstronę usługową” to the list of attributes.

- [ ] **Step 4: Commit**

```bash
git add docs CONTEXT.md
git commit -m "docs: add questions for TEWU, ADR 0004 and service page terms"
```

---

### Task 10: Final verification

**Files:** none (fixes only if something fails).

- [ ] **Step 1: Full checks**

Run: `pnpm lint && pnpm check:types && pnpm test && pnpm build`
Expected: all pass. `pnpm build` lists `/uslugi/[slug]` and `/uk/uslugi/[slug]` as SSG with 6 paths each and `/sitemap.xml`.

- [ ] **Step 2: Smoke test the built app**

Run `pnpm start` in the background (port 3000), then:
```bash
for p in /uslugi/pelna-ksiegowosc /uslugi/kpir /uslugi/ryczalt /uslugi/kadry-i-place /uslugi/ksef /uslugi/inkubator-spolek /uk/uslugi/kpir /sitemap.xml; do
  printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' -H 'Accept-Language: pl' "http://localhost:3000$p")" "$p"
done
curl -s -o /dev/null -w '%{http_code}\n' -H 'Accept-Language: pl' http://localhost:3000/uslugi/nieistnieje
curl -s -H 'Accept-Language: pl' http://localhost:3000/uslugi/kpir | grep -o '<link rel="canonical"[^>]*>'
```
Expected: `200` for every listed path, `404` for `/uslugi/nieistnieje`, canonical `https://tewu.szczecin.pl/uslugi/kpir`. Stop the server afterwards.

- [ ] **Step 3: Report**

Summarise for the human: tasks done, commits, test counts, anything skipped or deviating from this plan, and the open visual check of the 10-card grid on `/uslugi` (spec: „ocenimy na podglądzie”).
