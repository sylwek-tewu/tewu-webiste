// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithMantine } from '@/test/render';
import { getDictionary, type Locale } from '@/i18n';
import { SERVICE_PAGE_SLUGS, servicePagePath } from '@/lib/service-pages';
import { COMPANY } from '@/lib/company';
import Footer from './Footer';

describe.each(['pl', 'uk'] as Locale[])('Footer (%s)', (locale) => {
  const t = getDictionary(locale);

  it('links every service landing page and outsourcing in the services column', () => {
    renderWithMantine(<Footer />, { locale });
    for (const slug of SERVICE_PAGE_SLUGS) {
      expect(screen.getByRole('link', { name: t.servicePages.links[slug] })).toHaveAttribute('href', servicePagePath(locale, slug));
    }
    expect(screen.getByRole('link', { name: t.footer.bpoOutsourcing })).toHaveAttribute('href', locale === 'uk' ? '/uk/outsourcing' : '/outsourcing');
  });

  it('lists the incubator among the navigation links', () => {
    renderWithMantine(<Footer />, { locale });
    const incubator = t.nav.links.find((link) => link.path.endsWith('/uslugi/inkubator-spolek'))!;
    expect(screen.getByRole('link', { name: incubator.label })).toHaveAttribute('href', incubator.path);
  });

  it('lists the office phones before the mobile one, each as a tel: link', () => {
    const { container } = renderWithMantine(<Footer />, { locale });
    const links = [...container.querySelectorAll('a[href^="tel:"]')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['tel:+48602235736', 'tel:+48914824190', 'tel:+48501482555']);
    expect(links.map((a) => a.textContent)).toEqual(['602 235 736', '91 48 24 190', '501 482 555']);
  });

  it('has no social media links', () => {
    const { container } = renderWithMantine(<Footer />, { locale });
    expect(container.querySelector('[aria-label="Facebook"]')).toBeNull();
    expect(container.querySelector('[aria-label="LinkedIn"]')).toBeNull();
    expect(container.querySelector('a[href="#"]')).toBeNull();
  });

  it('keeps the mailto: link', () => {
    const { container } = renderWithMantine(<Footer />, { locale });
    expect(container.querySelector('a[href="mailto:biuro@tewu.szczecin.pl"]')).not.toBeNull();
  });

  it('points the address link at the Google Business Profile', () => {
    renderWithMantine(<Footer />, { locale });
    const link = screen.getByRole('link', { name: COMPANY.address.line });
    expect(link).toHaveAttribute('href', COMPANY.googleBusinessProfileUrl);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
