// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CallbackProvider, useCallbackWidget } from './CallbackContext';

const pathname = vi.hoisted(() => ({ value: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => pathname.value }));

function Probe() {
  const { landingPage } = useCallbackWidget();
  return <output>{landingPage ?? 'none'}</output>;
}

describe('CallbackProvider', () => {
  it.each([
    ['/uslugi/kpir', 'kpir'],
    ['/uk/uslugi/inkubator-spolek', 'inkubator-spolek'],
    ['/kontakt', 'none'],
    ['/uslugi', 'none'],
  ])('on %s gives the landing page %s', (path, expected) => {
    pathname.value = path;
    render(<CallbackProvider><Probe /></CallbackProvider>);
    expect(screen.getByRole('status')).toHaveTextContent(expected);
  });
});
