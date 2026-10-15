// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithMantine } from '@/test/render';
import { LanguageSwitcher } from './LanguageSwitcher';

const linkProps = vi.hoisted(() => [] as { href: string; prefetch?: boolean }[]);
vi.mock('next/link', () => ({
  default: ({ href, prefetch, children }: { href: string; prefetch?: boolean; children: React.ReactNode }) => {
    linkProps.push({ href, prefetch });
    return <a href={href}>{children}</a>;
  },
}));

// A prefetch of "/" goes out without the locale cookie, so for a visitor with Accept-Language: uk
// the proxy answers 307 -> /uk, Next caches /uk for "/", and the PL link would then open /uk.
describe('LanguageSwitcher prefetching', () => {
  it('does not prefetch either language link', () => {
    renderWithMantine(<LanguageSwitcher />);

    expect(linkProps.map((link) => link.href)).toEqual(['/', '/uk']);
    expect(linkProps.every((link) => link.prefetch === false)).toBe(true);
  });
});
