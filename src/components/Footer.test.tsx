// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithMantine } from '@/test/render';
import { getDictionary, type Locale } from '@/i18n';
import { SERVICE_PAGE_SLUGS, servicePagePath } from '@/lib/service-pages';
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
});
