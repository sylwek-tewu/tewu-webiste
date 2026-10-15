// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithMantine } from '@/test/render';
import { CallbackProvider, useCallbackWidget } from '@/components/callback-widget';
import { getServicePageContent } from '@/content/service-pages';
import type { ServicePageContent } from '@/content/service-pages/types';
import { plTranslations, ukTranslations } from '@/i18n';
import { COMPANY, telHref } from '@/lib/company';
import ServiceLandingPage from './ServiceLandingPage';

function WidgetProbe() {
  const { isOpen, source } = useCallbackWidget();
  return <output>{isOpen ? `open:${source}` : 'closed'}</output>;
}

function renderPage(content: ServicePageContent) {
  return renderWithMantine(
    <CallbackProvider>
      <ServiceLandingPage content={content} />
      <WidgetProbe />
    </CallbackProvider>,
    { locale: content.locale }
  );
}

describe('ServiceLandingPage', () => {
  it('has one h1: the service name with Szczecin', () => {
    const content = getServicePageContent('pl', 'pelna-ksiegowosc');
    renderPage(content);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(content.hero.title);
  });

  it('shows every section of the page', () => {
    const content = getServicePageContent('pl', 'kpir');
    renderPage(content);
    for (const title of [content.audience.title, content.scope.title, content.pricing.title, content.steps.title, content.faq.title]) {
      expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument();
    }
    for (const step of content.steps.items) expect(screen.getByText(step.title)).toBeInTheDocument();
  });

  it('opens the callback widget from the service CTA', async () => {
    renderPage(getServicePageContent('pl', 'kpir'));
    const ctas = screen.getAllByRole('link', { name: new RegExp(plTranslations.servicePages.ctaButton) });
    expect(ctas.length).toBeGreaterThanOrEqual(2);
    await userEvent.click(ctas[0]);
    expect(screen.getByRole('status')).toHaveTextContent('open:service');
  });

  it('links the mobile number TEWU chose for the service pages', () => {
    renderPage(getServicePageContent('pl', 'kpir'));
    const phones = screen.getAllByRole('link', { name: COMPANY.phones.mobile[0].display });
    expect(phones.length).toBeGreaterThanOrEqual(2);
    for (const phone of phones) expect(phone).toHaveAttribute('href', telHref(COMPANY.phones.mobile[0]));
    expect(screen.queryByRole('link', { name: COMPANY.phones.landline.display })).toBeNull();
    expect(screen.getAllByText(/Sylwester Wrzeszcz/).length).toBeGreaterThanOrEqual(2);
  });

  it('keeps every FAQ answer in the page, also while collapsed', () => {
    const content = getServicePageContent('pl', 'ksef');
    const { container } = renderPage(content);
    for (const { question, answer } of content.faq.items) {
      expect(container.textContent).toContain(question);
      expect(container.textContent).toContain(answer);
    }
  });

  it('shows price amounts only when the page has a price range', () => {
    const content = getServicePageContent('pl', 'ryczalt');
    const { unmount } = renderPage(content);
    expect(screen.queryByText(plTranslations.servicePages.pricing.rangeTitle)).not.toBeInTheDocument();
    unmount();

    renderPage({ ...content, pricing: { ...content.pricing, range: { amount: 'od 100 zł netto', note: 'Przykładowa kwota' } } });
    expect(screen.getByText(plTranslations.servicePages.pricing.rangeTitle)).toBeInTheDocument();
    expect(screen.getByText('od 100 zł netto')).toBeInTheDocument();
  });

  it('renders the Ukrainian page with Ukrainian labels', () => {
    renderPage(getServicePageContent('uk', 'inkubator-spolek'));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Щецин');
    expect(screen.getAllByRole('link', { name: new RegExp(ukTranslations.servicePages.ctaButton) }).length).toBeGreaterThan(0);
  });
});

describe.each([
  ['pl', 'Certyfikaty MF'],
  ['uk', 'Сертифікати MF'],
] as const)('ServiceLandingPage trust badge (%s)', (locale, label) => {
  it('links the certificates page under the approved label', () => {
    renderPage(getServicePageContent(locale, 'kpir'));
    expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', locale === 'uk' ? '/uk/certyfikaty' : '/certyfikaty');
  });
});

describe.each([
  ['pl', '', 'Zobacz też', ['Ryczałt ewidencjonowany', 'Inkubator spółek z o.o.', 'KSeF'], plTranslations],
  ['uk', '/uk', 'Дивіться також', ['Податок з продажу (ryczałt)', 'Реєстрація Sp. z o.o.', 'KSeF'], ukTranslations],
] as const)('ServiceLandingPage related services (%s)', (locale, prefix, heading, names, dictionary) => {
  function seeAlso() {
    const title = screen.getByRole('heading', { level: 2, name: heading });
    const section = title.closest('section');
    if (!section) throw new Error('The related services heading is not inside a section');
    return { title, section };
  }

  it('lists the approved related services in order, each linking to its page in the same language', () => {
    renderPage(getServicePageContent(locale, 'kpir'));
    const links = within(seeAlso().section).getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['ryczalt', 'inkubator-spolek', 'ksef'].map((slug) => `${prefix}/uslugi/${slug}`));
    names.forEach((name, index) => expect(links[index]).toHaveTextContent(new RegExp(`^${name.replace(/[()]/g, '\\$&')}`)));
  });

  it('shows the matching /uslugi card description with each link', () => {
    renderPage(getServicePageContent(locale, 'kpir'));
    const { section } = seeAlso();
    for (const id of ['ryczalt', 'inkubator-spolek', 'ksef']) {
      const item = dictionary.servicesPage.items.find((candidate) => candidate.id === id);
      expect(item).toBeDefined();
      expect(section).toHaveTextContent(item!.description);
    }
  });

  it('sits directly before the final call to action', () => {
    renderPage(getServicePageContent(locale, 'kpir'));
    const { section } = seeAlso();
    const cta = screen.getByRole('heading', { level: 2, name: dictionary.servicePages.finalCta.title }).closest('section');
    // Mantine puts a <style> for responsive props between sections; only sections count here.
    let next = section.nextElementSibling;
    while (next && next.tagName === 'STYLE') next = next.nextElementSibling;
    expect(next).toBe(cta);
  });
});
