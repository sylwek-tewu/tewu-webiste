// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithMantine } from '@/test/render';
import { getDictionary, type Locale } from '@/i18n';
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

  it('shows the entrance photo with its caption in the map section', () => {
    const { container } = renderWithMantine(<ContactClient />, { locale });
    const { contact } = getDictionary(locale);
    const figure = container.querySelector('figure');
    expect(figure?.querySelector('img')).toHaveAttribute('src', '/img/biuro/budynek.jpg');
    expect(figure?.querySelector('figcaption')).toHaveTextContent(contact.entranceCaption);
    const mapSection = screen.getByRole('heading', { level: 2, name: contact.mapTitle }).closest('section');
    expect(mapSection).toContainElement(figure as HTMLElement);
    expect(mapSection?.querySelector('iframe')).toBeTruthy();
  });

  it('shows registry numbers and the bank account', () => {
    const { container } = renderWithMantine(<ContactClient />, { locale });
    for (const value of ['9552249417', '320601499', '0000320281', '10 1020 4795 0000 9002 0180 2966']) {
      expect(container.textContent).toContain(value);
    }
  });
});
