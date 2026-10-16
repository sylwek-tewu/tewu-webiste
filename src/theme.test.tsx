// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Badge } from '@mantine/core';
import { renderWithMantine } from '@/test/render';
import { brandBlue } from './theme';

describe('theme', () => {
  it('gives Badge variant="pale" a brandBlue.0 background and brandBlue.7 text', () => {
    renderWithMantine(<Badge variant="pale">Pytania i odpowiedzi</Badge>);
    const root = screen.getByText('Pytania i odpowiedzi').closest('.mantine-Badge-root') as HTMLElement;
    expect(root.style.getPropertyValue('--badge-bg')).toBe(brandBlue[0]);
    expect(root.style.getPropertyValue('--badge-color')).toBe(brandBlue[7]);
  });
});
