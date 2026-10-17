// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithMantine } from '@/test/render';
import { StatNumber } from './StatNumber';

describe('StatNumber', () => {
  it('shows the figure and passes the caller\'s props on', () => {
    renderWithMantine(<StatNumber data-testid="stat" mb={4}>25+</StatNumber>);
    const stat = screen.getByTestId('stat');
    expect(stat).toHaveTextContent('25+');
    expect(stat.style.marginBottom).not.toBe('');
  });
});
