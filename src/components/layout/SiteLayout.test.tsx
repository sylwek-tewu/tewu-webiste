// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ColorSchemeScript } from '@mantine/core';
import SiteLayout from './SiteLayout';

// next/font needs the Next.js compiler; the document head does not depend on it.
vi.mock('next/font/google', () => ({ Inter: () => ({ className: 'inter' }) }));

const Passthrough = ({ children }: { children: React.ReactNode }) => <>{children}</>;

function findElement(node: React.ReactNode, type: unknown): React.ReactElement | undefined {
  if (!React.isValidElement(node)) return undefined;
  if (node.type === type) return node;
  const { children } = node.props as { children?: React.ReactNode };
  for (const child of React.Children.toArray(children)) {
    const found = findElement(child, type);
    if (found) return found;
  }
  return undefined;
}

describe('SiteLayout', () => {
  // Before hydration the script would otherwise apply a dark scheme left in localStorage
  // (e.g. by another app on localhost) and flash dark Paper cards.
  it('sets the light color scheme before hydration without reading localStorage', () => {
    const layout = SiteLayout({ lang: 'pl', LocaleProvider: Passthrough, children: null });
    const script = findElement(layout, ColorSchemeScript);
    expect(script).toBeDefined();

    const { container } = render(script!);
    const code = container.querySelector('script')?.innerHTML ?? '';

    expect(code).toContain(`setAttribute("data-mantine-color-scheme", 'light')`);
    expect(code).not.toContain('localStorage');
  });
});
