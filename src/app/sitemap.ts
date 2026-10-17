import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/constants';
import { localizePath } from '@/i18n/config';
import { PAGE_PATHS } from '@/lib/site-pages';

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGE_PATHS.flatMap((path) => {
    const pl = `${SITE_URL}${path}`;
    const uk = `${SITE_URL}${localizePath(path, 'uk')}`;
    const alternates = { languages: { pl, uk, 'x-default': pl } };
    return [
      { url: pl, alternates },
      { url: uk, alternates },
    ];
  });
}
