// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithMantine } from '@/test/render';
import { getDictionary, type Locale } from '@/i18n';
import ContactMap from './ContactMap';

describe.each(['pl', 'uk'] as Locale[])('ContactMap (%s)', (locale) => {
  it('embeds the TEWU profile location without an API key', () => {
    const { container } = renderWithMantine(<ContactMap />, { locale });
    const iframe = container.querySelector('iframe')!;
    expect(iframe.getAttribute('src')).toContain('ll=53.4136901,14.5328745');
    expect(iframe.getAttribute('src')).toContain('output=embed');
    expect(iframe.getAttribute('src')).not.toContain('key=');
    expect(iframe).toHaveAttribute('loading', 'lazy');
  });

  it('takes the iframe title from the dictionary', () => {
    const { container } = renderWithMantine(<ContactMap />, { locale });
    expect(container.querySelector('iframe')).toHaveAttribute('title', getDictionary(locale).contact.mapIframeTitle);
  });
});

describe('map iframe title text', () => {
  it('matches the agreed wording', () => {
    expect(getDictionary('pl').contact.mapIframeTitle).toBe('Mapa dojazdu do Biura Rachunkowego TEWU w Szczecinie');
    expect(getDictionary('uk').contact.mapIframeTitle).toBe('Карта проїзду до бюро TEWU у Щецині');
  });
});
