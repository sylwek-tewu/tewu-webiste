// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithMantine } from '@/test/render';
import type { Locale } from '@/i18n';
import ContactClient from './ContactClient';

describe.each(['pl', 'uk'] as Locale[])('ContactClient (%s)', (locale) => {
  it('renders all four tel: links, office numbers first', () => {
    const { container } = renderWithMantine(<ContactClient />, { locale });
    const links = [...container.querySelectorAll('a[href^="tel:"]')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      'tel:+48602235736',
      'tel:+48914824190',
      'tel:+48501482555',
      'tel:+48886543973',
    ]);
    expect(links.map((a) => a.textContent)).toEqual(['602 235 736', '91 48 24 190', '501 482 555', '886 543 973']);
  });

  it('renders both mailto: links', () => {
    const { container } = renderWithMantine(<ContactClient />, { locale });
    const mails = [...container.querySelectorAll('a[href^="mailto:"]')].map((a) => a.getAttribute('href'));
    expect(mails).toEqual(['mailto:biuro@tewu.szczecin.pl', 'mailto:sw@tewu.szczecin.pl']);
  });

  it('shows registry numbers and the bank account', () => {
    const { container } = renderWithMantine(<ContactClient />, { locale });
    for (const value of ['9552249417', '320601499', '0000320281', '10 1020 4795 0000 9002 0180 2966']) {
      expect(container.textContent).toContain(value);
    }
  });
});
