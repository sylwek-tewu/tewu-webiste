// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithMantine } from '@/test/render';
import { FaqList } from './FaqList';

describe('FaqList', () => {
  const items = [
    { id: 'pierwsze', question: 'Pierwsze pytanie?', answer: 'Pierwsza odpowiedź.' },
    { question: 'Drugie pytanie?', answer: <p>Druga odpowiedź.</p> },
  ];

  it('renders each question as a closed <details> with its answer in the HTML', () => {
    const { container } = renderWithMantine(<FaqList items={items} />);
    const details = [...container.querySelectorAll('details')];
    expect(details).toHaveLength(2);
    expect(details.every((d) => !d.open)).toBe(true);
    expect(details[0].querySelector('summary')).toHaveTextContent('Pierwsze pytanie?');
    expect(details[0]).toHaveTextContent('Pierwsza odpowiedź.');
    expect(details[1]).toHaveTextContent('Druga odpowiedź.');
  });

  it('puts the id on the <details>, so /faq#id can open it', () => {
    const { container } = renderWithMantine(<FaqList items={items} />);
    expect(container.querySelector('details#pierwsze')).not.toBeNull();
    expect(container.querySelectorAll('details[id]')).toHaveLength(1);
  });
});
