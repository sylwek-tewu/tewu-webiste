// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithMantine } from '@/test/render';
import { getDictionary, type Locale } from '@/i18n';
import { Hero } from '@/components/home/Hero';
import { WhyUs } from '@/components/home/WhyUs';
import AboutClient from './(pl)/o-nas/AboutClient';
import CertificatesClient from './(pl)/certyfikaty/CertificatesClient';

function altsOf(container: HTMLElement): Record<string, string | null> {
  return Object.fromEntries(
    Array.from(container.querySelectorAll('img')).map((img) => [new URL(img.src).pathname, img.getAttribute('alt')])
  );
}

// The expected texts are spelled out, so a dictionary edit that loses a description fails here.
const ALTS = {
  pl: {
    hero: 'Dokumenty podatkowe, telefon z kalkulatorem i długopis',
    team: 'Zespół przy pracy w biurze',
    meeting: 'Troje uśmiechniętych osób przy stole z laptopami',
  },
  uk: {
    hero: 'Податкові документи, телефон із калькулятором і ручка',
    team: 'Команда за роботою в офісі',
    meeting: 'Троє усміхнених людей за столом із ноутбуками',
  },
};

describe.each(['pl', 'uk'] as Locale[])('image alt texts (%s)', (locale) => {
  const expected = ALTS[locale];

  it('describes the hero photo', () => {
    const { container } = renderWithMantine(<Hero />, { locale });
    expect(altsOf(container)['/img/stock/hero-office.jpg']).toBe(expected.hero);
  });

  it('describes the stock photos next to "Why us"', () => {
    const { container } = renderWithMantine(<WhyUs />, { locale });
    expect(altsOf(container)).toEqual({
      '/img/stock/team-at-work.jpg': expected.team,
      '/img/stock/business-meeting.jpg': expected.meeting,
    });
  });

  it('describes the team photo on the about page', () => {
    const { container } = renderWithMantine(<AboutClient />, { locale });
    expect(altsOf(container)['/img/stock/team.jpg']).toBe(expected.team);
  });

  it('names each certificate by its title and holder', () => {
    const { container } = renderWithMantine(<CertificatesClient />, { locale });
    const { items } = getDictionary(locale).certificates;
    expect(altsOf(container)).toEqual({
      [items[0].url]: `${items[0].title} – ${items[0].desc}`,
      [items[1].url]: `${items[1].title} – ${items[1].desc}`,
    });
  });
});

describe('certificate alt texts in Polish', () => {
  it('read "Certyfikat Księgowy – <holder>"', () => {
    const { container } = renderWithMantine(<CertificatesClient />);
    expect(Object.values(altsOf(container))).toEqual([
      'Certyfikat Księgowy – Sylwester Wrzeszcz',
      'Certyfikat Księgowy – Tamara Ugha',
    ]);
  });
});
