import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/constants';
import { PAGE_PATHS } from '@/lib/site-pages';

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
