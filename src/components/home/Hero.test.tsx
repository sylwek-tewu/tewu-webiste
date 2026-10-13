// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithMantine } from '@/test/render';
import type { Locale } from '@/i18n';
import { Hero } from './Hero';

// The client approved these exact lines, so they are spelled out here instead of read from the dictionary
const KICKER: Record<Locale, string> = {
  pl: 'Biuro rachunkowe w Szczecinie',
  uk: 'Бухгалтерське бюро в Щецині',
};
const SLOGAN: Record<Locale, string> = {
  pl: 'Księgowość bez stresu.',
  uk: 'Бухгалтерія без стресу.',
};

describe.each(['pl', 'uk'] as Locale[])('home Hero H1 (%s)', (locale) => {
  it('starts with the small line and then carries the unchanged slogan', () => {
    renderWithMantine(<Hero />, { locale });
    const h1 = screen.getByRole('heading', { level: 1 });
    const text = (h1.textContent ?? '').replace(/\s+/g, ' ').trim();
    expect(text.startsWith(KICKER[locale])).toBe(true);
    // text content is what crawlers and screen readers get: the two lines must not run together
    expect(text).toBe(`${KICKER[locale]} ${SLOGAN[locale]}`);
  });

  it('keeps the small line in a block element of its own', () => {
    renderWithMantine(<Hero />, { locale });
    const h1 = screen.getByRole('heading', { level: 1 });
    const kicker = [...h1.querySelectorAll('span')].find((el) => el.textContent === KICKER[locale]);
    expect(kicker).toBeDefined();
    expect(getComputedStyle(kicker!).display).toBe('block');
  });
});
