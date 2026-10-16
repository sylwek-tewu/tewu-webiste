// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithMantine } from '@/test/render';
import { Eyebrow } from './Eyebrow';

describe('Eyebrow', () => {
  it('is a text label, not a heading, so the outline stays H2 → H3', () => {
    renderWithMantine(<Eyebrow>Nasze usługi</Eyebrow>);
    const label = screen.getByText('Nasze usługi');
    expect(label.tagName).toBe('P');
    expect(screen.queryByRole('heading')).toBeNull();
  });
});
