import type { Metadata } from 'next';
import { headers } from 'next/headers';
import SiteLayout from '@/components/layout/SiteLayout';
import NotFoundContent from '@/components/layout/NotFoundContent';
import { PlLocaleProvider } from '@/i18n/PlLocaleProvider';
import { UkLocaleProvider } from '@/i18n/UkLocaleProvider';
import { SITE_LOCALE_HEADER } from '@/i18n/config';

export const metadata: Metadata = {
  title: '404 | Biuro Rachunkowe TEWU',
  robots: { index: false },
};

/** Unmatched URLs, in the language of the path the visitor asked for (set by the proxy). */
export default async function GlobalNotFound() {
  const isUk = (await headers()).get(SITE_LOCALE_HEADER) === 'uk';
  return (
    <SiteLayout lang={isUk ? 'uk' : 'pl'} LocaleProvider={isUk ? UkLocaleProvider : PlLocaleProvider}>
      <NotFoundContent />
    </SiteLayout>
  );
}
