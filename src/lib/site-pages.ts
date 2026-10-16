import { SERVICE_PAGE_SLUGS } from '@/lib/service-pages';

/** Polish path of the FAQ page; the Ukrainian one is /uk/faq (ADR 0002). */
export const FAQ_PATH = '/faq';

// Polish paths; each page also exists under /uk with the same slug (ADR 0002).
// sitemap.test.ts compares this list with the page routes in src/app.
export const PAGE_PATHS = [
  '/',
  '/o-nas',
  '/uslugi',
  ...SERVICE_PAGE_SLUGS.map((slug) => `/uslugi/${slug}`),
  '/outsourcing',
  '/certyfikaty',
  '/kontakt',
  FAQ_PATH,
  '/polityka-prywatnosci',
];
