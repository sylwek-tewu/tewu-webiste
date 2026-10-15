import type { Metadata } from 'next';
import { localizePath } from '@/i18n/config';
import type { Locale } from '@/i18n/types';
import { COMPANY } from '@/lib/company';
import { OG_COPY, OG_IMAGE_PATH, OG_SIZE } from '@/lib/og-image-meta';

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
 * The share image is named here because a page-level openGraph replaces the file-based one.
 */
export function buildPageMetadata({ locale, path, title, description }: PageMetadataInput): Metadata {
  const polishPath = localizePath(path, 'pl');
  const canonical = localizePath(path, locale);
  const images = [{ url: OG_IMAGE_PATH[locale], ...OG_SIZE, alt: OG_COPY[locale].alt }];
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
      images,
    },
    twitter: { card: 'summary_large_image', title, description, images },
  };
}
