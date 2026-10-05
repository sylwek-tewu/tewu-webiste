import { readdirSync } from 'node:fs';
import { join, sep } from 'node:path';
import { describe, it, expect } from 'vitest';
import sitemap from './sitemap';
import { SITE_URL } from '@/constants';
import { SERVICE_PAGE_SLUGS } from '@/lib/service-pages';

/** Paths of every `page.tsx` under a route group, with `[slug]` expanded to the service page slugs. */
function routePaths(groupDir: string): string[] {
  const root = join(__dirname, groupDir);
  return readdirSync(root, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.split(sep).at(-1) === 'page.tsx')
    .flatMap((file) => {
      const segments = file.split(sep).slice(0, -1);
      const path = '/' + segments.join('/');
      return path.includes('[slug]') ? SERVICE_PAGE_SLUGS.map((slug) => path.replace('[slug]', slug)) : [path];
    });
}

describe('sitemap', () => {
  const entries = sitemap();
  const urls = entries.map((entry) => entry.url);
  const toUrl = (path: string) => (path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`);

  it('lists every Polish and Ukrainian page route and nothing else', () => {
    const plPaths = routePaths('(pl)');
    const ukPaths = routePaths('(uk)');
    const expected = [...plPaths.map(toUrl), ...ukPaths.map((path) => `${SITE_URL}${path}`)];

    expect(plPaths).toContain('/uslugi/kpir');
    expect(ukPaths).toContain('/uk/uslugi/kpir');
    expect([...urls].sort()).toEqual([...expected].sort());
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
