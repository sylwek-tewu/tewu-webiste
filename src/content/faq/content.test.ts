import { describe, it, expect } from 'vitest';
import { PAGE_PATHS } from '@/app/sitemap';
import { localizePath } from '@/i18n/config';
import type { Locale } from '@/i18n/types';
import { isExternalHref, parseRichText } from '@/lib/rich-text';
import { FAQ_CATEGORY_IDS, type FaqPageContent, type FaqQuestion } from './types';
import { PL_FAQ } from './pl';
import { UK_FAQ } from './uk';

const CONTENT: [Locale, FaqPageContent][] = [
  ['pl', PL_FAQ],
  ['uk', UK_FAQ],
];

// Global Constraints: no "tax advice" wording, in any inflection and word order.
const FORBIDDEN_PHRASES = [/doradztw\p{L}*\s+podatkow/iu, /podatkow\p{L}*\s+doradztw/iu, /податков\p{L}*\s+консульт/iu, /консульт\p{L}*\s+податков/iu];
const OFFICIAL_SOURCE = /^https:\/\/(www\.)?(biznes\.gov\.pl|podatki\.gov\.pl|zus\.pl|gov\.pl)\//;
// An amount or a deadline: "240 000 zł", "2 mln euro", "12%", "7 dni" / "7 днів"
const AMOUNT_OR_DEADLINE = /\d[\d\s]*(?:mln\s|млн\s)?(?:zł|euro|злот|євро)|\d+\s?%|\d+\s(?:dni|днів)(?![\p{L}])/iu;

const questionsOf = (content: FaqPageContent) => content.categories.flatMap((category) => category.questions);

function allText(content: FaqPageContent): string[] {
  const texts: string[] = [];
  const walk = (value: unknown) => {
    if (typeof value === 'string') texts.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') Object.values(value).forEach(walk);
  };
  walk(content);
  return texts;
}

describe.each(CONTENT)('FAQ content (%s)', (locale, content) => {
  const questions = questionsOf(content);

  it('is in its own language and has the five categories in order', () => {
    expect(content.locale).toBe(locale);
    expect(content.categories.map((category) => category.id)).toEqual([...FAQ_CATEGORY_IDS]);
  });

  it('has 22 questions with unique, kebab-case ids', () => {
    expect(questions).toHaveLength(22);
    const ids = questions.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    for (const categoryId of FAQ_CATEGORY_IDS) expect(ids).not.toContain(categoryId);
  });

  it('keeps the title and description within search result limits', () => {
    expect(content.meta.title.length).toBeLessThanOrEqual(60);
    expect(content.meta.description.length).toBeGreaterThanOrEqual(120);
    expect(content.meta.description.length).toBeLessThanOrEqual(160);
  });

  it('links only to pages of its own language', () => {
    const pages = new Set(PAGE_PATHS.map((path) => localizePath(path, locale)));
    // The one cross-language link: the Polish answer about talking in Ukrainian points to /uk.
    if (locale === 'pl') pages.add('/uk');
    for (const question of questions) {
      for (const paragraph of question.answer) {
        for (const segment of parseRichText(paragraph)) {
          if (segment.kind !== 'link') continue;
          if (isExternalHref(segment.href)) expect(segment.href, question.id).toMatch(OFFICIAL_SOURCE);
          else expect(pages.has(segment.href), `${question.id}: ${segment.href}`).toBe(true);
        }
      }
    }
  });

  it('leaves no raw markup', () => {
    for (const question of questions) {
      for (const paragraph of question.answer) {
        for (const segment of parseRichText(paragraph)) {
          if (segment.kind === 'text') expect(segment.text, question.id).not.toMatch(/\]\(|\*\*|\[[^\]]*\]$/);
        }
      }
    }
  });

  it('cites a source wherever it gives an amount or a deadline, and only official ones', () => {
    for (const question of questions) {
      const text = question.answer.join(' ');
      if (AMOUNT_OR_DEADLINE.test(text)) expect(question.sources?.length ?? 0, question.id).toBeGreaterThan(0);
      for (const source of question.sources ?? []) expect(source.href, question.id).toMatch(OFFICIAL_SOURCE);
    }
  });

  it('has no forbidden phrase, empty text or leftover marker', () => {
    for (const text of allText(content)) {
      expect(text.trim()).not.toBe('');
      expect(text).not.toMatch(/TODO|TBD|lorem|\?\?\?/i);
      for (const phrase of FORBIDDEN_PHRASES) expect(text).not.toMatch(phrase);
    }
  });
});

describe('Polish and Ukrainian FAQ', () => {
  const ids = (content: FaqPageContent, categoryIndex: number) =>
    content.categories[categoryIndex].questions.map((question: FaqQuestion) => question.id);

  it('ask the same questions in each category, so a shared /faq#id link works in both', () => {
    PL_FAQ.categories.forEach((_, i) => {
      expect([...ids(UK_FAQ, i)].sort()).toEqual([...ids(PL_FAQ, i)].sort());
    });
  });

  it('cite the same number of sources for each question', () => {
    const sourceCounts = (content: FaqPageContent) =>
      Object.fromEntries(questionsOf(content).map((question) => [question.id, question.sources?.length ?? 0]));
    expect(sourceCounts(UK_FAQ)).toEqual(sourceCounts(PL_FAQ));
  });

  it('put the question about talking in Ukrainian first for Ukrainian readers and last for Polish ones', () => {
    expect(ids(UK_FAQ, 0)[0]).toBe('rozmowa-po-ukrainsku');
    expect(ids(PL_FAQ, 0).at(-1)).toBe('rozmowa-po-ukrainsku');
  });
});
