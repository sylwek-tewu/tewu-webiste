import { describe, it, expect } from 'vitest';
import { SITE_URL } from '@/constants';
import type { Locale } from '@/i18n/types';
import { COMPANY } from '@/lib/company';
import { OG_IMAGE_PATH } from '@/lib/og-image-meta';
import { SERVICE_PAGE_SLUGS, SERVICE_PAGES, servicePagePath } from '@/lib/service-pages';
import { getServicePageContent } from '@/content/service-pages';
import { buildServicePageJsonLd, buildSiteJsonLd } from './structured-data';

const LOCALES: Locale[] = ['pl', 'uk'];
const FIRMA_ID = 'https://tewu.szczecin.pl/#firma';
const FORBIDDEN_KEYS = ['aggregateRating', 'review', 'sameAs', 'priceRange', 'offers', 'foundingDate'];
// Global Constraints: "doradztwo podatkowe" / "податкове консультування" / "податкові консультації", any inflection
const FORBIDDEN_PHRASES = [/doradztw\p{L}*\s+podatkow/iu, /podatkow\p{L}*\s+doradztw/iu, /податков\p{L}*\s+консульт/iu, /консульт\p{L}*\s+податков/iu];

type Node = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const byType = (nodes: Node[], type: string) => nodes.find((n) => n['@type'] === type);

function keysDeep(value: unknown, keys: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((v) => keysDeep(v, keys));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      keys.push(k);
      keysDeep(v, keys);
    }
  }
  return keys;
}

describe.each(LOCALES)('buildSiteJsonLd (%s)', (locale) => {
  const doc = buildSiteJsonLd(locale);
  const nodes = doc['@graph'] as Node[];
  const firma = byType(nodes, 'AccountingService')!;
  const site = byType(nodes, 'WebSite')!;

  it('is a schema.org graph of the company and the website', () => {
    expect(doc['@context']).toBe('https://schema.org');
    expect(nodes.map((n) => n['@type'])).toEqual(['AccountingService', 'WebSite']);
  });

  it('describes the company from COMPANY', () => {
    expect(firma).toMatchObject({
      '@id': FIRMA_ID,
      name: 'Biuro Rachunkowe TEWU',
      legalName: 'Biuro Rachunkowe TEWU Sp. z o.o.',
      url: 'https://tewu.szczecin.pl/',
      logo: `${SITE_URL}/apple-icon.png`,
      image: `${SITE_URL}${OG_IMAGE_PATH.pl}`,
      telephone: '+48602235736',
      email: 'biuro@tewu.szczecin.pl',
      taxID: '9552249417',
      hasMap: COMPANY.googleBusinessProfileUrl,
      areaServed: { '@type': 'City', name: 'Szczecin' },
      knowsLanguage: ['pl', 'uk'],
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Al. Powstańców Wielkopolskich 78A LU2',
        postalCode: '70-110',
        addressLocality: 'Szczecin',
        addressCountry: 'PL',
      },
      geo: { '@type': 'GeoCoordinates', latitude: 53.4136901, longitude: 14.5328745 },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '16:00',
      },
    });
  });

  it('lists both office phones as customer service contact points', () => {
    expect(firma.contactPoint).toEqual([
      { '@type': 'ContactPoint', telephone: '+48602235736', contactType: 'customer service', availableLanguage: ['pl', 'uk'] },
      { '@type': 'ContactPoint', telephone: '+48914824190', contactType: 'customer service', availableLanguage: ['pl', 'uk'] },
    ]);
  });

  it('identifies the company by REGON and KRS', () => {
    expect(firma.identifier).toEqual([
      { '@type': 'PropertyValue', propertyID: 'REGON', value: '320601499' },
      { '@type': 'PropertyValue', propertyID: 'KRS', value: '0000320281' },
    ]);
  });

  it('describes the website in the page language, published by the company', () => {
    expect(site).toMatchObject({
      '@id': 'https://tewu.szczecin.pl/#strona',
      name: 'Biuro Rachunkowe TEWU',
      inLanguage: locale === 'pl' ? 'pl-PL' : 'uk-UA',
      publisher: { '@id': FIRMA_ID },
    });
    expect(site.url).toBe(locale === 'pl' ? 'https://tewu.szczecin.pl/' : 'https://tewu.szczecin.pl/uk');
  });

  it('publishes no rating, review, social, price or other unlisted facts', () => {
    expect(keysDeep(doc).filter((k) => FORBIDDEN_KEYS.includes(k))).toEqual([]);
  });
});

describe.each(LOCALES)('buildServicePageJsonLd (%s)', (locale) => {
  describe.each(SERVICE_PAGE_SLUGS)('%s', (slug) => {
    const content = getServicePageContent(locale, slug);
    const doc = buildServicePageJsonLd(content);
    const nodes = doc['@graph'] as Node[];
    const url = `${SITE_URL}${servicePagePath(locale, slug)}`;

    it('has a Service, a BreadcrumbList and a FAQPage', () => {
      expect(doc['@context']).toBe('https://schema.org');
      expect(nodes.map((n) => n['@type'])).toEqual(['Service', 'BreadcrumbList', 'FAQPage']);
    });

    it('describes the service on the page, provided by the company', () => {
      expect(byType(nodes, 'Service')).toMatchObject({
        name: content.hero.title,
        description: content.meta.description,
        url,
        provider: { '@id': FIRMA_ID },
        areaServed: { '@type': 'City', name: 'Szczecin' },
        inLanguage: locale === 'pl' ? 'pl-PL' : 'uk-UA',
      });
    });

    it('names the service type in the page language', () => {
      const { serviceType } = byType(nodes, 'Service')!;
      if (locale === 'pl') expect(serviceType).toBe(SERVICE_PAGES[slug].label);
      // KSeF is the system's name in either language
      else if (slug !== 'ksef') expect(serviceType).toMatch(/\p{Script=Cyrillic}/u);
    });

    it('has breadcrumbs home > services > this page with absolute URLs', () => {
      const names = locale === 'pl' ? ['Strona główna', 'Usługi'] : ['Головна', 'Послуги'];
      const base = locale === 'pl' ? '' : '/uk';
      expect(byType(nodes, 'BreadcrumbList')!.itemListElement).toEqual([
        { '@type': 'ListItem', position: 1, name: names[0], item: `${SITE_URL}${base || '/'}` },
        { '@type': 'ListItem', position: 2, name: names[1], item: `${SITE_URL}${base}/uslugi` },
        { '@type': 'ListItem', position: 3, name: content.hero.title, item: url },
      ]);
    });

    it('lists exactly the FAQ shown on the page', () => {
      const { mainEntity } = byType(nodes, 'FAQPage')!;
      expect(mainEntity).toHaveLength(content.faq.items.length);
      expect(mainEntity).toEqual(
        content.faq.items.map(({ question, answer }) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      );
    });

    it('publishes no rating, review, offer or other forbidden keys', () => {
      expect(keysDeep(doc).filter((k) => FORBIDDEN_KEYS.includes(k))).toEqual([]);
    });
  });
});

describe('all structured data', () => {
  it('never contains the forbidden tax-advice phrases', () => {
    const serialized = [
      ...LOCALES.map((locale) => JSON.stringify(buildSiteJsonLd(locale))),
      ...LOCALES.flatMap((locale) => SERVICE_PAGE_SLUGS.map((slug) => JSON.stringify(buildServicePageJsonLd(getServicePageContent(locale, slug))))),
    ].join('\n');
    for (const phrase of FORBIDDEN_PHRASES) expect(serialized).not.toMatch(phrase);
  });
});
