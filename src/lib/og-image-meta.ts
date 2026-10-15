import { COMPANY } from '@/lib/company';
import { SITE_URL } from '@/constants';
import type { Locale } from '@/i18n/types';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

interface OgCopy {
  alt: string;
  name: string;
  tagline: string;
  services: string;
  domain: string;
}

/**
 * Where Next.js serves the opengraph-image route file of each language. Group segments such as
 * (pl) give metadata routes a hash suffix. Pages name the image themselves because a page-level
 * openGraph replaces the file-based one; og-image.test.ts checks the paths against Next.js.
 */
export const OG_IMAGE_PATH: Record<Locale, string> = {
  pl: '/opengraph-image-35ziip',
  uk: '/uk/opengraph-image-1xrru2',
};

const DOMAIN = new URL(SITE_URL).host;

/** Everything the image says, per language. Kept to what the site itself states. */
export const OG_COPY: Record<Locale, OgCopy> = {
  pl: {
    alt: 'Biuro Rachunkowe TEWU – biuro rachunkowe w Szczecinie',
    name: COMPANY.shortName,
    tagline: 'Biuro rachunkowe w Szczecinie',
    services: 'Księgowość · Kadry i płace · KSeF',
    domain: DOMAIN,
  },
  uk: {
    alt: 'Бухгалтерське бюро TEWU у Щецині',
    name: COMPANY.shortName,
    tagline: 'Бухгалтерське бюро в Щецині',
    services: 'Бухгалтерія · Кадри та зарплата · KSeF',
    domain: DOMAIN,
  },
};
