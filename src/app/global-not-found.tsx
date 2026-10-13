import type { Metadata } from 'next';
import { headers } from 'next/headers';
import SiteLayout from '@/components/layout/SiteLayout';
import NotFoundContent from '@/components/layout/NotFoundContent';
import { PlLocaleProvider } from '@/i18n/PlLocaleProvider';
import { UkLocaleProvider } from '@/i18n/UkLocaleProvider';
import { SITE_LOCALE_HEADER } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import type { Locale } from '@/i18n/types';

/** The language of the path the visitor asked for, as set by the proxy. */
async function requestedLocale(): Promise<Locale> {
  return (await headers()).get(SITE_LOCALE_HEADER) === 'uk' ? 'uk' : 'pl';
}

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await requestedLocale());
  return {
    title: `404 – ${t.notFound.title} | ${t.common.companyName}`,
    robots: { index: false },
  };
}

/** Unmatched URLs, in the language of the requested path. */
export default async function GlobalNotFound() {
  const isUk = (await requestedLocale()) === 'uk';
  return (
    <SiteLayout lang={isUk ? 'uk' : 'pl'} LocaleProvider={isUk ? UkLocaleProvider : PlLocaleProvider}>
      <NotFoundContent />
    </SiteLayout>
  );
}
