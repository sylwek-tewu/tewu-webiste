import { PATHS } from '@/lib/paths';
import { SERVICE_PAGE_SLUGS, servicePagePath } from '@/lib/service-pages';

// Polish paths; each page also exists under /uk with the same slug (ADR 0002).
// sitemap.test.ts compares this list with the page routes in src/app.
export const PAGE_PATHS = [
  PATHS.home,
  PATHS.about,
  PATHS.services,
  ...SERVICE_PAGE_SLUGS.map((slug) => servicePagePath('pl', slug)),
  PATHS.outsourcing,
  PATHS.certificates,
  PATHS.contact,
  PATHS.faq,
  PATHS.privacy,
];
