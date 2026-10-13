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
