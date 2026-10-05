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
