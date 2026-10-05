import { readdirSync } from 'node:fs';
import { join, sep } from 'node:path';
import { describe, it, expect } from 'vitest';
import sitemap from './sitemap';
import { SITE_URL } from '@/constants';
import { SERVICE_PAGE_SLUGS } from '@/lib/service-pages';

const PAGE_FILE = /^page\.(tsx|ts|jsx|js|mdx)$/;

/**
 * URL paths of every page under a route group directory.
 * - Route groups `(name)` add no URL segment and are dropped.
 * - Only `uslugi/[slug]` is expanded (to the service page slugs). Any other dynamic segment stays
 *   literal, so the comparison fails until the test learns how to expand it.
 * - Parallel (`@slot`) and intercepting (`(.)x`) routes are not separate pages and are skipped.
 * A page meant to stay out of the sitemap (e.g. noindex) would need an exclusion list here.
 */
function routePaths(groupDir: string): string[] {
  const root = join(__dirname, groupDir);
  return readdirSync(root, { recursive: true, encoding: 'utf8' })
    .map((file) => file.split(sep))
    .filter((parts) => PAGE_FILE.test(parts.at(-1)!))
    .map((parts) => parts.slice(0, -1))
    .filter((segments) => !segments.some((s) => s.startsWith('@') || /^\(\.+\)/.test(s)))
    .flatMap((segments) => {
      const path = '/' + segments.filter((s) => !/^\(.*\)$/.test(s)).join('/');
      return path.endsWith('/uslugi/[slug]')
        ? SERVICE_PAGE_SLUGS.map((slug) => path.replace('[slug]', slug))
        : [path];
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
