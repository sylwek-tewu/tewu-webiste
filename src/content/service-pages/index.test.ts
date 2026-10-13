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
    const { title, description } = PL_SERVICE_PAGES.ryczalt.meta;
    expect(buildServicePageMetadata('pl', 'ryczalt')).toMatchObject({
      title,
      description,
      alternates: {
        canonical: '/uslugi/ryczalt',
        languages: { pl: '/uslugi/ryczalt', 'x-default': '/uslugi/ryczalt', uk: '/uk/uslugi/ryczalt' },
      },
      openGraph: { type: 'website', url: '/uslugi/ryczalt', locale: 'pl_PL', title, description },
      twitter: { card: 'summary_large_image', title, description },
    });
  });

  it('points the Ukrainian page canonical and Open Graph url at itself', () => {
    const metadata = buildServicePageMetadata('uk', 'ryczalt');
    expect(metadata.title).toBe(UK_SERVICE_PAGES.ryczalt.meta.title);
    expect(metadata.alternates?.canonical).toBe('/uk/uslugi/ryczalt');
    expect(metadata.openGraph).toMatchObject({ url: '/uk/uslugi/ryczalt', locale: 'uk_UA' });
  });
});
