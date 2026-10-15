// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithMantine } from '@/test/render';
import { plTranslations, type Locale } from '@/i18n';
import ServicesClient from './ServicesClient';

const card = (id: string) => plTranslations.servicesPage.items.find((item) => item.id === id)!;

describe('ServicesClient', () => {
  it('shows nine service cards', () => {
    renderWithMantine(<ServicesClient />);
    // directly under the page's h1: the card titles are h2, the three values at the bottom h3
    const titles = plTranslations.servicesPage.items.map((item) => item.title);
    expect(titles).toHaveLength(9);
    const cardHeadings = screen.getAllByRole('heading', { level: 2 }).filter((h) => titles.includes(h.textContent ?? ''));
    expect(cardHeadings).toHaveLength(9);
  });

  it('links cards that have a landing page to it', () => {
    renderWithMantine(<ServicesClient />);
    expect(screen.getByRole('link', { name: new RegExp(card('kadry-place').title) })).toHaveAttribute('href', '/uslugi/kadry-i-place');
    expect(screen.getByRole('link', { name: new RegExp(card('ksef').title) })).toHaveAttribute('href', '/uslugi/ksef');
    expect(screen.getByRole('link', { name: new RegExp(card('inkubator-spolek').title) })).toHaveAttribute('href', '/uslugi/inkubator-spolek');
  });

  it('leaves cards without a landing page unlinked', () => {
    renderWithMantine(<ServicesClient />);
    expect(screen.queryByRole('link', { name: new RegExp(card('zus-us').title) })).not.toBeInTheDocument();
  });
});

describe.each([
  ['pl', 'Dostarczamy kompleksowe rozwiązania dla biznesu, od prostych ewidencji po pełną księgowość spółek.', 'Doradztwo podatkowe', 'Kompleksowa obsługa spółek prawa handlowego zgodnie z ustawą o rachunkowości.'],
  ['uk', 'Надаємо повний спектр рішень для бізнесу в Польщі — від простого обліку до повної бухгалтерії компаній.', 'Податкове консультування', 'Комплексне обслуговування господарських (комерційних) товариств (Sp. z o.o., S.A.) відповідно до Закону про бухгалтерський облік Польщі.'],
] as [Locale, string, string, string][])('ServicesClient approved copy (%s)', (locale, subtitle, removedTitle, firstDescription) => {
  it('shows the approved subtitle', () => {
    renderWithMantine(<ServicesClient />, { locale });
    expect(screen.getByText(subtitle)).toBeInTheDocument();
  });

  it('has no tax advisory card and no mention of foundations in the first card', () => {
    renderWithMantine(<ServicesClient />, { locale });
    expect(screen.queryByText(removedTitle)).not.toBeInTheDocument();
    expect(screen.getByText(firstDescription)).toBeInTheDocument();
    expect(document.body.textContent ?? '').not.toMatch(/fundacj|фундац/i);
  });
});
