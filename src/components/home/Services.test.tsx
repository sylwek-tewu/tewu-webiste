// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithMantine } from '@/test/render';
import { plTranslations } from '@/i18n';
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
