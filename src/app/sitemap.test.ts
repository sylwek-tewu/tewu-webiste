import { describe, it, expect } from 'vitest';
import sitemap from './sitemap';
import { SITE_URL } from '@/constants';
import { SERVICE_PAGE_SLUGS } from '@/lib/service-pages';

describe('sitemap', () => {
  const entries = sitemap();
  const urls = entries.map((entry) => entry.url);

  it('lists every page in both languages', () => {
    const paths = ['/o-nas', '/uslugi', '/outsourcing', '/certyfikaty', '/kontakt', '/polityka-prywatnosci', ...SERVICE_PAGE_SLUGS.map((slug) => `/uslugi/${slug}`)];
    expect(urls).toContain(`${SITE_URL}/`);
    expect(urls).toContain(`${SITE_URL}/uk`);
    for (const path of paths) {
      expect(urls).toContain(`${SITE_URL}${path}`);
      expect(urls).toContain(`${SITE_URL}/uk${path}`);
    }
    expect(entries).toHaveLength((paths.length + 1) * 2);
  });

  it('gives each entry its hreflang alternates', () => {
    const kpir = entries.find((entry) => entry.url === `${SITE_URL}/uk/uslugi/kpir`);
    expect(kpir?.alternates?.languages).toEqual({
      pl: `${SITE_URL}/uslugi/kpir`,
      uk: `${SITE_URL}/uk/uslugi/kpir`,
      'x-default': `${SITE_URL}/uslugi/kpir`,
    });
  });
});
