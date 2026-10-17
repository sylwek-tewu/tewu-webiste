// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Badge, Title } from '@mantine/core';
import { renderWithMantine } from '@/test/render';
import { brandBlue } from './theme';

describe('theme', () => {
  it('gives Title size="display" 32–48 px and keeps its heading level', () => {
    renderWithMantine(<Title order={2} size="display">Dlaczego warto nam zaufać?</Title>);
    const heading = screen.getByRole('heading', { level: 2, name: 'Dlaczego warto nam zaufać?' });
    expect(heading.style.getPropertyValue('--title-fz')).toBe('clamp(2rem, 4vw, 3rem)');
    expect(heading.style.getPropertyValue('--title-lh')).toBe('var(--mantine-h2-line-height)');
  });

  it('leaves other Titles at their theme heading size', () => {
    renderWithMantine(<Title order={2}>Nasze usługi</Title>);
    const heading = screen.getByRole('heading', { level: 2, name: 'Nasze usługi' });
    expect(heading.style.getPropertyValue('--title-fz')).toBe('var(--mantine-h2-font-size)');
  });

  it('gives Badge variant="pale" a brandBlue.0 background and brandBlue.7 text', () => {
    renderWithMantine(<Badge variant="pale">Pytania i odpowiedzi</Badge>);
    const root = screen.getByText('Pytania i odpowiedzi').closest('.mantine-Badge-root') as HTMLElement;
    expect(root.style.getPropertyValue('--badge-bg')).toBe(brandBlue[0]);
    expect(root.style.getPropertyValue('--badge-color')).toBe(brandBlue[7]);
  });
});
