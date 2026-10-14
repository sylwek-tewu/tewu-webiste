// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as analytics from './analytics';
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

describe('CallbackProvider Callback Link', () => {
  function OpenProbe() {
    const { isOpen, source } = useCallbackWidget();
    return <output>{isOpen ? `open:${source}` : 'closed'}</output>;
  }

  beforeEach(() => {
    pathname.value = '/';
    window.history.replaceState(null, '', '/');
    vi.restoreAllMocks();
  });

  it('opens the widget with source "link" and reports it to analytics', () => {
    const push = vi.spyOn(analytics, 'pushCallbackWidgetOpen').mockImplementation(() => {});
    window.history.replaceState(null, '', '/?callback');
    render(<CallbackProvider><OpenProbe /></CallbackProvider>);
    expect(screen.getByRole('status')).toHaveTextContent('open:link');
    expect(push).toHaveBeenCalledWith('link');
  });

  it('stays closed without the parameter', () => {
    render(<CallbackProvider><OpenProbe /></CallbackProvider>);
    expect(screen.getByRole('status')).toHaveTextContent('closed');
  });

  it('opens whatever value the parameter has', () => {
    window.history.replaceState(null, '', '/?callback=kadry-place');
    render(<CallbackProvider><OpenProbe /></CallbackProvider>);
    expect(screen.getByRole('status')).toHaveTextContent('open:link');
  });

  it('removes only the callback parameter from the address, keeping UTM, gclid and hash', () => {
    window.history.replaceState(null, '', '/uk?utm_source=ads&callback&gclid=abc#cta');
    render(<CallbackProvider><OpenProbe /></CallbackProvider>);
    expect(window.location.pathname + window.location.search + window.location.hash).toBe(
      '/uk?utm_source=ads&gclid=abc#cta'
    );
  });
});
