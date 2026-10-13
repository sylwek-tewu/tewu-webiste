import { describe, it, expect } from 'vitest';
// The matcher Next.js itself runs for `has` / `missing` on headers() and redirects().
import { matchHas } from 'next/dist/shared/lib/router/utils/prepare-destination';
import nextConfig from './next.config.mjs';

type Condition = { type: 'host'; value: string };
type Rule = { source: string; has?: Condition[]; missing?: Condition[] };

const PRODUCTION_HOST = 'tewu.szczecin.pl';
const NOT_PRODUCTION_HOSTS = [
  'www.tewu.szczecin.pl',
  'test-tewu-website.projekty-tewu.it',
  '2.test-tewu-website.projekty-tewu.it',
  'localhost:3000',
  'tewu.szczecin.pl.evil.com',
  'xtewu.szczecin.pl',
];

/** Whether Next.js would apply the rule to a request carrying this Host header. */
function applies(rule: Rule, host: string | undefined): boolean {
  const headers = host === undefined ? {} : { host };
  return matchHas({ headers } as never, {}, rule.has, rule.missing) !== false;
}

async function noindexRule(): Promise<Rule & { headers: { key: string; value: string }[] }> {
  const rules = await nextConfig.headers!();
  const rule = rules.find((r) => r.headers.some((h) => h.key === 'X-Robots-Tag'));
  expect(rule).toBeDefined();
  return rule as never;
}

describe('X-Robots-Tag outside production', () => {
  it('is a noindex header on every path', async () => {
    const rule = await noindexRule();
    expect(rule.source).toBe('/:path*');
    expect(rule.headers).toEqual([{ key: 'X-Robots-Tag', value: 'noindex' }]);
  });

  it('is skipped on the production host, including the port Host headers may carry', async () => {
    const rule = await noindexRule();
    expect(applies(rule, PRODUCTION_HOST)).toBe(false);
    expect(applies(rule, `${PRODUCTION_HOST}:443`)).toBe(false);
    expect(applies(rule, PRODUCTION_HOST.toUpperCase())).toBe(false);
  });

  it.each(NOT_PRODUCTION_HOSTS)('is sent on %s', async (host) => {
    expect(applies(await noindexRule(), host)).toBe(true);
  });

  it('is sent when there is no Host header', async () => {
    expect(applies(await noindexRule(), undefined)).toBe(true);
  });
});

describe('www fallback redirect', () => {
  async function wwwRule() {
    const rules = await nextConfig.redirects!();
    expect(rules).toHaveLength(1);
    return rules[0] as Rule & { destination: string; permanent: boolean };
  }

  it('sends every path to the apex domain permanently', async () => {
    const rule = await wwwRule();
    expect(rule.source).toBe('/:path*');
    expect(rule.destination).toBe('https://tewu.szczecin.pl/:path*');
    expect(rule.permanent).toBe(true);
  });

  it('applies to www only', async () => {
    const rule = await wwwRule();
    expect(applies(rule, 'www.tewu.szczecin.pl')).toBe(true);
    expect(applies(rule, 'www.tewu.szczecin.pl:443')).toBe(true);
    for (const host of [PRODUCTION_HOST, 'test-tewu-website.projekty-tewu.it', 'localhost:3000', 'www.tewu.szczecin.pl.evil.com', 'xwww.tewu.szczecin.pl']) {
      expect(applies(rule, host)).toBe(false);
    }
  });
});
