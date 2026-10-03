// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';

describe('ThemeProvider', () => {
  afterEach(() => localStorage.clear());

  // The site has no dark design; a scheme left in localStorage (e.g. by another app on
  // localhost) must not turn the Paper cards dark.
  it('stays light when localStorage holds a dark color scheme', () => {
    localStorage.setItem('mantine-color-scheme-value', 'dark');

    render(<ThemeProvider><div /></ThemeProvider>);

    expect(document.documentElement).toHaveAttribute('data-mantine-color-scheme', 'light');
  });
});
