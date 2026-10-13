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

describe.each([
  ['pl', 'Kompleksowa obsługa spółek prawa handlowego zgodnie z ustawą o rachunkowości.', 'Doradztwo podatkowe'],
  ['uk', 'Комплексне обслуговування господарських (комерційних) товариств (Sp. z o.o., S.A.) відповідно до Закону про бухгалтерський облік Польщі.', 'Податкове консультування'],
] as [Locale, string, string][])('home Services content (%s)', (locale, firstDescription, removedTitle) => {
  it('shows the approved description of the first card, without foundations', () => {
    renderWithMantine(<Services />, { locale });
    expect(screen.getByText(firstDescription)).toBeInTheDocument();
    expect(document.body.textContent ?? '').not.toMatch(/fundacj|фундац/i);
  });

  it('counts nine offers in the link to the full list and has no tax advisory card', () => {
    renderWithMantine(<Services />, { locale });
    expect(screen.getByRole('link', { name: getDictionary(locale).home.services.viewAll(9) })).toBeInTheDocument();
    expect(screen.queryByText(removedTitle)).not.toBeInTheDocument();
  });
});

it('links to the full offer as "Zobacz pełną ofertę (9 pozycji)" in Polish', () => {
  renderWithMantine(<Services />);
  expect(screen.getByRole('link', { name: 'Zobacz pełną ofertę (9 pozycji)' })).toBeInTheDocument();
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
