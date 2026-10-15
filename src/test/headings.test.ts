// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { headingLevels, headingOutlineProblems } from './headings';

function html(markup: string): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = markup;
  return root;
}

describe('heading outline helper', () => {
  it('lists heading levels in document order', () => {
    expect(headingLevels(html('<h1>a</h1><section><h2>b</h2><h3>c</h3></section><h2>d</h2>'))).toEqual([1, 2, 3, 2]);
  });

  it('accepts going deeper one level at a time and back up by any amount', () => {
    expect(headingOutlineProblems(html('<h1>a</h1><h2>b</h2><h3>c</h3><h4>d</h4><h2>e</h2>'))).toEqual([]);
  });

  it('reports a skipped level', () => {
    expect(headingOutlineProblems(html('<h1>a</h1><h3>b</h3>'))).toEqual(['h3 follows h1 (heading 2 of 2)']);
  });

  it('reports a page that does not start with h1, or has no headings', () => {
    expect(headingOutlineProblems(html('<h2>a</h2>'))).toEqual(['starts with h2, not h1']);
    expect(headingOutlineProblems(html('<p>none</p>'))).toEqual(['no headings']);
  });
});
