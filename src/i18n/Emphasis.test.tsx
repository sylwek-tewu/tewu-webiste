// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Emphasis } from './Emphasis';

describe('Emphasis', () => {
  it('turns **phrases** into <strong> and keeps the rest as text', () => {
    const { container } = render(<Emphasis text="Okres wynosi **72 godziny**, kontakt: **biuro@tewu.szczecin.pl**." />);
    expect(container.innerHTML).toBe(
      'Okres wynosi <strong>72 godziny</strong>, kontakt: <strong>biuro@tewu.szczecin.pl</strong>.'
    );
  });

  it('leaves text without markers unchanged', () => {
    const { container } = render(<Emphasis text="Zwykły tekst" />);
    expect(container.innerHTML).toBe('Zwykły tekst');
  });
});
