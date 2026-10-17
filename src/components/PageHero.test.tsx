// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithMantine } from '@/test/render';
import { PageHero } from './PageHero';

describe('PageHero', () => {
  it('shows the page H1 and its lead', () => {
    renderWithMantine(<PageHero title="O nas" lead="Biuro rachunkowe w Szczecinie" />);
    expect(screen.getByRole('heading', { level: 1, name: 'O nas' })).toBeInTheDocument();
    expect(screen.getByText('Biuro rachunkowe w Szczecinie')).toBeInTheDocument();
  });

  it('puts extra content after the lead', () => {
    renderWithMantine(
      <PageHero title="KPiR" lead="Księga przychodów i rozchodów">
        <button type="button">Bezpłatna wycena</button>
      </PageHero>
    );
    const lead = screen.getByText('Księga przychodów i rozchodów');
    const button = screen.getByRole('button', { name: 'Bezpłatna wycena' });
    expect(lead.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
