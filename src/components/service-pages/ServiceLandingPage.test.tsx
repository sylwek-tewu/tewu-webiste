// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithMantine } from '@/test/render';
import { CallbackProvider, useCallbackWidget } from '@/components/callback-widget';
import { getServicePageContent } from '@/content/service-pages';
import type { ServicePageContent } from '@/content/service-pages/types';
import { plTranslations, ukTranslations } from '@/i18n';
import { CONTACT_DETAILS } from '@/constants';
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
    const phones = screen.getAllByRole('link', { name: CONTACT_DETAILS.mobilePhone });
    expect(phones.length).toBeGreaterThanOrEqual(2);
    for (const phone of phones) expect(phone).toHaveAttribute('href', `tel:${CONTACT_DETAILS.mobilePhoneE164}`);
    expect(screen.queryByRole('link', { name: CONTACT_DETAILS.phone })).toBeNull();
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
