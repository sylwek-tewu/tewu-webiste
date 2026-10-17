// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithMantine } from '@/test/render';
import { headingOutlineProblems } from '@/test/headings';
import { CallbackProvider } from '@/components/callback-widget';
import ServiceLandingPage from '@/components/service-pages/ServiceLandingPage';
import FaqPage from '@/components/faq/FaqPage';
import { FAQ_UPDATED_AT, getFaqContent } from '@/content/faq';
import { getServicePageContent } from '@/content/service-pages';
import { SERVICE_PAGE_SLUGS } from '@/lib/service-pages';
import type { Locale } from '@/i18n';
import Home from './(pl)/page';
import AboutClient from './(pl)/o-nas/AboutClient';
import ServicesClient from './(pl)/uslugi/ServicesClient';
import OutsourcingClient from './(pl)/outsourcing/OutsourcingClient';
import CertificatesClient from './(pl)/certyfikaty/CertificatesClient';
import ContactClient from './(pl)/kontakt/ContactClient';
import PrivacyPolicyClient from './(pl)/polityka-prywatnosci/PrivacyPolicyClient';

// The Polish and Ukrainian routes render the same components, only the dictionary differs.
const PAGES: [string, () => React.ReactElement][] = [
  ['home', () => <Home />],
  ['/o-nas', () => <AboutClient />],
  ['/uslugi', () => <ServicesClient />],
  ['/outsourcing', () => <OutsourcingClient />],
  ['/certyfikaty', () => <CertificatesClient />],
  ['/kontakt', () => <ContactClient />],
  ['/polityka-prywatnosci', () => <PrivacyPolicyClient retentionHours={24} />],
];

describe.each(['pl', 'uk'] as Locale[])('heading outline (%s)', (locale) => {
  it.each(PAGES)('%s has no skipped heading level', (_name, page) => {
    const { container } = renderWithMantine(<CallbackProvider>{page()}</CallbackProvider>, { locale });
    expect(headingOutlineProblems(container)).toEqual([]);
  });

  it('the FAQ page has no skipped heading level', () => {
    const { container } = renderWithMantine(
      <CallbackProvider>
        <FaqPage content={getFaqContent(locale)} updatedAt={FAQ_UPDATED_AT} />
      </CallbackProvider>,
      { locale }
    );
    expect(headingOutlineProblems(container)).toEqual([]);
  });

  it.each(SERVICE_PAGE_SLUGS)('service page %s has no skipped heading level', (slug) => {
    const { container } = renderWithMantine(
      <CallbackProvider>
        <ServiceLandingPage content={getServicePageContent(locale, slug)} />
      </CallbackProvider>,
      { locale }
    );
    expect(headingOutlineProblems(container)).toEqual([]);
  });
});
