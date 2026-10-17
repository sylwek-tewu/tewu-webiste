/**
 * Polish paths of the site's pages; each page also exists under /uk with the same slug (ADR 0002),
 * so a link takes localizePath(PATHS.x, locale). Service pages: servicePagePath.
 * No imports, so client components, service-pages.ts and the dictionaries can all use it.
 */
export const PATHS = {
  home: '/',
  about: '/o-nas',
  services: '/uslugi',
  outsourcing: '/outsourcing',
  certificates: '/certyfikaty',
  contact: '/kontakt',
  faq: '/faq',
  privacy: '/polityka-prywatnosci',
} as const;
