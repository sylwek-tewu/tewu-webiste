// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithMantine } from '@/test/render';
import { plTranslations } from '@/i18n';
import ServicesClient from './ServicesClient';

const card = (id: string) => plTranslations.servicesPage.items.find((item) => item.id === id)!;

describe('ServicesClient', () => {
  it('shows ten service cards', () => {
    renderWithMantine(<ServicesClient />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(10);
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
