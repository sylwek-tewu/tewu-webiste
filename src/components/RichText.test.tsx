// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithMantine } from '@/test/render';
import { RichText } from './RichText';

describe('RichText', () => {
  it('renders site links, external links and bold text', () => {
    const { container } = renderWithMantine(
      <p>
        <RichText text="Zobacz [KPiR](/uslugi/kpir), [ZUS](https://www.zus.pl/) i **ważne**." />
      </p>
    );
    expect(screen.getByRole('link', { name: 'KPiR' })).toHaveAttribute('href', '/uslugi/kpir');
    expect(screen.getByRole('link', { name: 'KPiR' })).not.toHaveAttribute('target');
    const external = screen.getByRole('link', { name: 'ZUS' });
    expect(external).toHaveAttribute('href', 'https://www.zus.pl/');
    expect(external).toHaveAttribute('target', '_blank');
    expect(external).toHaveAttribute('rel', 'noopener noreferrer');
    expect(container.querySelector('strong')).toHaveTextContent('ważne');
    expect(container).toHaveTextContent('Zobacz KPiR, ZUS i ważne.');
  });
});
