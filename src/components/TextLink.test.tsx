// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithMantine } from '@/test/render';
import { TextLink } from './TextLink';

describe('TextLink', () => {
  it('opens an official source in a new tab', () => {
    renderWithMantine(<TextLink href="https://www.zus.pl/">ZUS</TextLink>);
    const link = screen.getByRole('link', { name: 'ZUS' });
    expect(link).toHaveAttribute('href', 'https://www.zus.pl/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('keeps a page of our site in the same tab', () => {
    renderWithMantine(<TextLink href="/uslugi/kpir">KPiR</TextLink>);
    const link = screen.getByRole('link', { name: 'KPiR' });
    expect(link).toHaveAttribute('href', '/uslugi/kpir');
    expect(link).not.toHaveAttribute('target');
  });
});
