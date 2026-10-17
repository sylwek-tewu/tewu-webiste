import type { Metadata } from 'next';
import type { Locale } from '@/i18n/types';
import { buildPageMetadata } from '@/lib/metadata';
import { PATHS } from '@/lib/paths';
import type { FaqPageContent } from './types';
import { PL_FAQ } from './pl';
import { UK_FAQ } from './uk';

// Server-only: imported by the /faq pages, which pass the copy to FaqPage.

/**
 * The day the answers were last checked against the law: shown under the H1 and sent as
 * dateModified. Change it together with the amounts (README: „Aktualizacja FAQ”).
 */
export const FAQ_UPDATED_AT = '2026-10-15';

const FAQ_CONTENT: Record<Locale, FaqPageContent> = { pl: PL_FAQ, uk: UK_FAQ };

export function getFaqContent(locale: Locale): FaqPageContent {
  return FAQ_CONTENT[locale];
}

export function buildFaqMetadata(locale: Locale): Metadata {
  const { meta } = getFaqContent(locale);
  return buildPageMetadata({ locale, path: PATHS.faq, title: meta.title, description: meta.description });
}
