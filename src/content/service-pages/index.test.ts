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
