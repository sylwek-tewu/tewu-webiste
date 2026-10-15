import { SITE_URL } from '@/constants';
import { localizePath } from '@/i18n/config';
import type { Locale } from '@/i18n/types';
import { COMPANY } from '@/lib/company';
import { OG_IMAGE_PATH } from '@/lib/og-image-meta';
import { SERVICE_PAGES, servicePagePath, type ServicePageSlug } from '@/lib/service-pages';
import type { ServicePageContent } from '@/content/service-pages/types';
import type { FaqPageContent, FaqQuestion } from '@/content/faq/types';
import { OFFICE_PHOTOS } from '@/lib/office-photos';
import { linkToHtml, richTextToHtml } from '@/lib/rich-text';

/**
 * schema.org JSON-LD (Google structured data). Facts come from COMPANY only; no ratings,
 * reviews, prices or social profiles, because the site publishes none.
 * Takes the page copy as an argument so this module stays free of the content modules.
 */

const COMPANY_ID = `${SITE_URL}/#firma`;
const WEBSITE_ID = `${SITE_URL}/#strona`;

const IN_LANGUAGE: Record<Locale, string> = { pl: 'pl-PL', uk: 'uk-UA' };
const WEEKDAYS = { Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday' } as const;
const AREA_SERVED = { '@type': 'City', name: COMPANY.address.city } as const;

const BREADCRUMB_LABELS: Record<Locale, { home: string; services: string }> = {
  pl: { home: 'Strona główna', services: 'Usługi' },
  uk: { home: 'Головна', services: 'Послуги' },
};

// UK counterparts of SERVICE_PAGES[slug].label, based on the footer links (t.servicePages.links in
// uk.ts); the dictionary itself is off limits to server code (ADR 0002). Reviewed by TEWU 15.10.2026.
const UK_SERVICE_TYPE: Record<ServicePageSlug, string> = {
  'pelna-ksiegowosc': 'Повна бухгалтерія',
  kpir: 'Книга доходів і витрат (KPiR)',
  ryczalt: 'Податок з продажу (ryczałt)',
  'kadry-i-place': 'Кадри та заробітна плата',
  ksef: 'KSeF',
  'inkubator-spolek': 'Реєстрація Sp. z o.o.',
};

const absolute = (path: string) => `${SITE_URL}${path}`;
const homeUrl = (locale: Locale) => (locale === 'pl' ? `${SITE_URL}/` : absolute(localizePath('/', locale)));

function companyNode() {
  const { address, phones, registry } = COMPANY;
  const languages = [...COMPANY.languages];
  return {
    '@type': 'AccountingService',
    '@id': COMPANY_ID,
    name: COMPANY.shortName,
    legalName: COMPANY.legalName,
    url: `${SITE_URL}/`,
    // Raster logo of 180 x 180 px (Google asks for at least 112 x 112)
    logo: absolute('/apple-icon.png'),
    // A real photo of the office first (Google's advice for local businesses), then the share image
    image: [absolute(OFFICE_PHOTOS.exterior.jpg), absolute(OG_IMAGE_PATH.pl)],
    telephone: phones.office[0].e164,
    email: COMPANY.emails.main,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.street,
      postalCode: address.postalCode,
      addressLocality: address.city,
      addressCountry: address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: COMPANY.geo.latitude, longitude: COMPANY.geo.longitude },
    hasMap: COMPANY.googleBusinessProfileUrl,
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: COMPANY.openingHours.days.map((day) => WEEKDAYS[day]),
      opens: COMPANY.openingHours.opens,
      closes: COMPANY.openingHours.closes,
    },
    areaServed: AREA_SERVED,
    knowsLanguage: languages,
    contactPoint: phones.office.map((phone) => ({
      '@type': 'ContactPoint',
      telephone: phone.e164,
      contactType: 'customer service',
      availableLanguage: languages,
    })),
    taxID: registry.nip,
    identifier: [
      { '@type': 'PropertyValue', propertyID: 'REGON', value: registry.regon },
      { '@type': 'PropertyValue', propertyID: 'KRS', value: registry.krs },
    ],
  };
}

/** The company and the website; on every page of the language. */
export function buildSiteJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      companyNode(),
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        // One website for both languages (one @id), so one url; inLanguage tells the page's language
        url: `${SITE_URL}/`,
        name: COMPANY.shortName,
        inLanguage: IN_LANGUAGE[locale],
        publisher: { '@id': COMPANY_ID },
      },
    ],
  };
}

/** The service, its breadcrumbs and its FAQ; on one service landing page. */
export function buildServicePageJsonLd({ locale, slug, meta, hero, faq }: ServicePageContent) {
  const url = absolute(servicePagePath(locale, slug));
  const labels = BREADCRUMB_LABELS[locale];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: hero.title,
        description: meta.description,
        url,
        serviceType: locale === 'pl' ? SERVICE_PAGES[slug].label : UK_SERVICE_TYPE[slug],
        provider: { '@id': COMPANY_ID },
        areaServed: AREA_SERVED,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: labels.home, item: homeUrl(locale) },
          { '@type': 'ListItem', position: 2, name: labels.services, item: absolute(localizePath('/uslugi', locale)) },
          { '@type': 'ListItem', position: 3, name: hero.title, item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faq.items.map(({ question, answer }) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
    ],
  };
}

function faqAnswerHtml({ answer, sources }: FaqQuestion, sourcesLabel: FaqPageContent['sourcesLabel']): string {
  const paragraphs = answer.map((paragraph) => `<p>${richTextToHtml(paragraph, SITE_URL)}</p>`);
  if (sources?.length) {
    const label = sources.length === 1 ? sourcesLabel.one : sourcesLabel.many;
    const links = sources.map(({ label: text, href }) => linkToHtml(text, href, SITE_URL)).join(', ');
    paragraphs.push(`<p>${label}: ${links}</p>`);
  }
  return paragraphs.join('');
}

/**
 * The FAQ page and its breadcrumbs. FAQPage is itself a WebPage, so one node carries the page's
 * address, language and date as well as the questions.
 */
export function buildFaqPageJsonLd(content: FaqPageContent, updatedAt: string) {
  const { locale } = content;
  const url = absolute(localizePath('/faq', locale));
  const questions = content.categories.flatMap((category) => category.questions);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        url,
        name: content.hero.title,
        description: content.meta.description,
        inLanguage: IN_LANGUAGE[locale],
        dateModified: updatedAt,
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': COMPANY_ID },
        mainEntity: questions.map((question) => ({
          '@type': 'Question',
          name: question.question,
          url: `${url}#${question.id}`,
          acceptedAnswer: { '@type': 'Answer', text: faqAnswerHtml(question, content.sourcesLabel) },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: BREADCRUMB_LABELS[locale].home, item: homeUrl(locale) },
          { '@type': 'ListItem', position: 2, name: content.breadcrumb, item: url },
        ],
      },
    ],
  };
}
