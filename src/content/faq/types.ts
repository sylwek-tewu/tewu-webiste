import type { Locale } from '@/i18n/types';
import type { PluralForms } from '@/lib/plural';

/** Category order on the page; each id is also the section's anchor (/faq#zus). */
export const FAQ_CATEGORY_IDS = ['o-biurze', 'zakladanie-firmy', 'podatki-vat-ksef', 'zus', 'rachunek-firmowy'] as const;
export type FaqCategoryId = (typeof FAQ_CATEGORY_IDS)[number];

export interface FaqSource {
  label: string;
  href: string;
}

export interface FaqQuestion {
  /** Anchor (/faq#id), the same in both languages: the office may send such links to clients. */
  id: string;
  question: string;
  /** Paragraphs in rich text (src/lib/rich-text.ts): `[label](/path)` links, `**bold**`. */
  answer: string[];
  /** Official pages behind the amounts and deadlines in the answer (README: „Aktualizacja FAQ”). */
  sources?: FaqSource[];
}

export interface FaqCategory {
  id: FaqCategoryId;
  title: string;
  questions: FaqQuestion[];
}

/** The copy of the FAQ page in one language; rendered by FaqPage. */
export interface FaqPageContent {
  locale: Locale;
  meta: { title: string; description: string };
  hero: { badge: string; title: string; lead: string; updatedPrefix: string; disclaimer: string; imageAlt: string };
  /** Name of the page in the JSON-LD breadcrumbs. */
  breadcrumb: string;
  /** Accessible name of the category tiles. */
  categoriesLabel: string;
  questionCount: PluralForms;
  sourcesLabel: { one: string; many: string };
  categories: FaqCategory[];
  cta: { title: string; description: string; imageAlt: string };
}
