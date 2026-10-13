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
