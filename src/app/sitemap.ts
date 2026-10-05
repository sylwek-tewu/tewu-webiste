import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/constants';
import { SERVICE_PAGE_SLUGS } from '@/lib/service-pages';

// Polish paths; each page also exists under /uk with the same slug (ADR 0002).
const PAGE_PATHS = [
  '/',
  '/o-nas',
  '/uslugi',
  ...SERVICE_PAGE_SLUGS.map((slug) => `/uslugi/${slug}`),
  '/outsourcing',
  '/certyfikaty',
  '/kontakt',
  '/polityka-prywatnosci',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGE_PATHS.flatMap((path) => {
    const pl = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
    const uk = path === '/' ? `${SITE_URL}/uk` : `${SITE_URL}/uk${path}`;
    const alternates = { languages: { pl, uk, 'x-default': pl } };
    return [
      { url: pl, alternates },
      { url: uk, alternates },
    ];
  });
}
