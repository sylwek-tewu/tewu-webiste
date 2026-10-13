import type { Metadata } from 'next';
import { localizePath } from '@/i18n/config';
import type { Locale } from '@/i18n/types';
import { COMPANY } from '@/lib/company';

const OPEN_GRAPH_LOCALE: Record<Locale, string> = { pl: 'pl_PL', uk: 'uk_UA' };

interface PageMetadataInput {
  locale: Locale;
  /** The page's Polish path, e.g. "/" or "/uslugi/kpir"; the Ukrainian one is derived from it. */
  path: string;
  title: string;
  description: string;
}

/**
 * Title, description, canonical, hreflang, Open Graph and Twitter tags for one page.
 * Open Graph images come from the opengraph-image files of the route segments, not from here.
 */
export function buildPageMetadata({ locale, path, title, description }: PageMetadataInput): Metadata {
  const polishPath = localizePath(path, 'pl');
  const canonical = localizePath(path, locale);
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        pl: polishPath,
        uk: localizePath(path, 'uk'),
        'x-default': polishPath,
      },
    },
    openGraph: {
      type: 'website',
      url: canonical,
      siteName: COMPANY.shortName,
      locale: OPEN_GRAPH_LOCALE[locale],
      alternateLocale: OPEN_GRAPH_LOCALE[locale === 'pl' ? 'uk' : 'pl'],
      title,
      description,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}
