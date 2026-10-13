import type { Locale } from '@/i18n/types';
import type { ServicePageSlug } from '@/lib/service-pages';

export interface ServicePageStep {
  title: string;
  description: string;
}

export interface ServicePageFaqItem {
  question: string;
  answer: string;
}

export interface ServicePagePriceRange {
  amount: string;
  note: string;
}

/** The copy of one service landing page in one language; rendered by ServiceLandingPage. */
export interface ServicePageContent {
  slug: ServicePageSlug;
  locale: Locale;
  meta: { title: string; description: string };
  hero: { title: string; lead: string };
  audience: { title: string; items: string[] };
  scope: { title: string; items: string[] };
  pricing: {
    title: string;
    factors: string[];
    process: string[];
    /** Set only once TEWU decides to publish price ranges; the amounts show only when it is. */
    range?: ServicePagePriceRange;
  };
  steps: { title: string; items: [ServicePageStep, ServicePageStep, ServicePageStep] };
  faq: { title: string; items: ServicePageFaqItem[] };
}

export type ServicePageSlugMap = Record<ServicePageSlug, ServicePageContent>;
