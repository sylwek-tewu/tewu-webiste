import { describe, it, expect } from 'vitest';
import { PAGE_PATHS } from '@/lib/site-pages';
import { SITE_URL } from '@/constants';
import { COMPANY } from '@/lib/company';
import { FAQ_UPDATED_AT } from '@/content/faq';
import { formatLongDate } from '@/lib/format-date';
import { buildLlmsTxt } from './llms-txt';

describe('buildLlmsTxt', () => {
  const text = buildLlmsTxt();

  it('follows the llms.txt shape: H1 name, then a one-paragraph summary in a blockquote', () => {
    const lines = text.split('\n');
    expect(lines[0]).toBe(`# ${COMPANY.shortName}`);
    expect(lines[1]).toBe('');
    expect(lines[2]).toMatch(/^> .+Szczecin/);
  });

  it('links every Polish page of the sitemap and the Ukrainian home and FAQ', () => {
    for (const path of PAGE_PATHS) {
      const url = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
      expect(text, path).toContain(`](${url})`);
    }
    expect(text).toContain(`](${SITE_URL}/uk)`);
    expect(text).toContain(`](${SITE_URL}/uk/faq)`);
  });

  it('gives the contact facts from COMPANY', () => {
    expect(text).toContain(COMPANY.address.line);
    expect(text).toContain(COMPANY.emails.main);
    expect(text).toContain(COMPANY.phones.office[0].display);
  });

  it('dates the FAQ amounts with the day they were checked, so the line cannot go stale silently', () => {
    expect(text).toContain(`stan na ${formatLongDate('pl', FAQ_UPDATED_AT)}`);
    expect(text).not.toContain('bieżący rok');
  });

  it('has no "tax advice" wording', () => {
    expect(text).not.toMatch(/doradztw\p{L}*\s+podatkow/iu);
  });
});
