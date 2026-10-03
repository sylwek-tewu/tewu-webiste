// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithMantine } from '@/test/render';
import { CallbackProvider } from './CallbackContext';
import CallbackWidget from './CallbackWidget';

const reloadPage = vi.hoisted(() => vi.fn());
vi.mock('./reload', () => ({ reloadPage }));

// Simulates the lazy form chunk failing to load (offline, or a stale tab after a deploy).
vi.mock('./CallbackFormModal', () => {
  throw new Error('Failed to fetch dynamically imported module');
});

describe('CallbackWidget when the form cannot be loaded', () => {
  it('offers the office phone number instead of an empty screen', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    renderWithMantine(
      <CallbackProvider>
        <CallbackWidget callInfo={{ raw: '+48914824190', telUri: 'tel:+48914824190', display: '91 48 24 190' }} />
      </CallbackProvider>
    );

    await user.click(screen.getByRole('button', { name: /Zamów bezpłatną wycenę/ }));

    const link = await screen.findByRole('link', { name: /91 48 24 190/ });
    expect(link).toHaveAttribute('href', 'tel:+48914824190');
  });

  it('offers a page reload, which fixes a stale tab after a new deploy', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    renderWithMantine(
      <CallbackProvider>
        <CallbackWidget callInfo={{ raw: '+48914824190', telUri: 'tel:+48914824190', display: '91 48 24 190' }} />
      </CallbackProvider>
    );

    await user.click(screen.getByRole('button', { name: /Zamów bezpłatną wycenę/ }));
    await user.click(await screen.findByRole('button', { name: /Odśwież stronę/ }));

    expect(reloadPage).toHaveBeenCalledOnce();
  });
});
