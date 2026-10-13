// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithMantine } from '@/test/render';
import { plTranslations, getDictionary, type Locale } from '@/i18n';
import { Services } from './Services';

describe('home Services', () => {
  it('sends each "more" link to the card’s landing page', () => {
    renderWithMantine(<Services />);
    const more = screen.getAllByRole('link', { name: new RegExp(plTranslations.home.services.more) });
    expect(more.map((link) => link.getAttribute('href'))).toEqual([
      '/uslugi/pelna-ksiegowosc',
      '/uslugi/kpir',
      '/uslugi/ryczalt',
      '/uslugi/kadry-i-place',
    ]);
  });
});

describe.each(['pl', 'uk'] as Locale[])('home Services "more" links (%s)', (locale) => {
  const t = getDictionary(locale);

  it('keep the visible word and add the service name to the accessible name', () => {
    renderWithMantine(<Services />, { locale });
    for (const card of t.servicesPage.items.slice(0, 4)) {
      const link = screen.getByRole('link', { name: `${t.home.services.more}: ${card.title}` });
      expect(link).toHaveTextContent(`${t.home.services.more}: ${card.title}`);
    }
  });
});
