import type { Locale } from '@/i18n/types';
import type { CallbackTopic } from '@/lib/callback/types';

/**
 * Service landing pages: the ad targets under /uslugi/<slug> and /uk/uslugi/<slug> (ADR 0004).
 * Client-safe: no page copy here, that lives in src/content/service-pages.
 */
export const SERVICE_PAGE_SLUGS = ['pelna-ksiegowosc', 'kpir', 'ryczalt', 'kadry-i-place', 'ksef', 'inkubator-spolek'] as const;

export type ServicePageSlug = (typeof SERVICE_PAGE_SLUGS)[number];

export interface ServicePageDefinition {
  slug: ServicePageSlug;
  /** Preselected in the callback form on this page; the visitor can change it. */
  topic: CallbackTopic;
  /** The matching card in the dictionary's servicesPage.items. */
  serviceItemId: string;
  /** Named in Polish for the office's notifications. */
  label: string;
}

export const SERVICE_PAGES: Record<ServicePageSlug, ServicePageDefinition> = {
  'pelna-ksiegowosc': { slug: 'pelna-ksiegowosc', topic: 'spolka', serviceItemId: 'pelna-ksiegowosc', label: 'Pełna księgowość spółek' },
  kpir: { slug: 'kpir', topic: 'dzialalnosc', serviceItemId: 'kpir', label: 'Księga przychodów i rozchodów (KPiR)' },
  ryczalt: { slug: 'ryczalt', topic: 'dzialalnosc', serviceItemId: 'ryczalt', label: 'Ryczałt ewidencjonowany' },
  'kadry-i-place': { slug: 'kadry-i-place', topic: 'kadry-place', serviceItemId: 'kadry-place', label: 'Kadry i płace' },
  ksef: { slug: 'ksef', topic: 'inne', serviceItemId: 'ksef', label: 'KSeF' },
  'inkubator-spolek': { slug: 'inkubator-spolek', topic: 'spolka', serviceItemId: 'inkubator-spolek', label: 'Inkubator spółek z o.o.' },
};

// A list lookup, not `in`, so prototype keys like "__proto__" are never a slug.
export function isServicePageSlug(value: unknown): value is ServicePageSlug {
  return (SERVICE_PAGE_SLUGS as readonly unknown[]).includes(value);
}

export function servicePagePath(locale: Locale, slug: ServicePageSlug): string {
  return `${locale === 'uk' ? '/uk' : ''}/uslugi/${slug}`;
}

const SERVICE_PAGE_PATH = /^(?:\/uk)?\/uslugi\/([^/]+)\/?$/;

export function servicePageSlugOfPath(pathname: string): ServicePageSlug | null {
  const slug = SERVICE_PAGE_PATH.exec(pathname)?.[1];
  return isServicePageSlug(slug) ? slug : null;
}

export function servicePageSlugForServiceItem(serviceItemId: string): ServicePageSlug | null {
  return SERVICE_PAGE_SLUGS.find((slug) => SERVICE_PAGES[slug].serviceItemId === serviceItemId) ?? null;
}

export function servicePageTopic(slug: ServicePageSlug | null): CallbackTopic | '' {
  return slug ? SERVICE_PAGES[slug].topic : '';
}
