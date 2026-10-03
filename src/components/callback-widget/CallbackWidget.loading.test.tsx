// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithMantine } from '@/test/render';
import { CallbackProvider } from './CallbackContext';
import CallbackWidget from './CallbackWidget';

// Records when the form module is actually imported (i.e. its chunk downloaded).
const formModuleLoaded = vi.hoisted(() => vi.fn());
vi.mock('./CallbackFormModal', async (importOriginal) => {
  formModuleLoaded();
  return importOriginal();
});

// Own file: the lazy form module must not be cached by an earlier test.
describe('CallbackWidget first open', () => {
  it('downloads the form only when opened, showing a loading state meanwhile', async () => {
    const user = userEvent.setup();
    renderWithMantine(
      <CallbackProvider>
        <CallbackWidget callInfo={{ raw: '+48914824190', telUri: 'tel:+48914824190', display: '91 48 24 190' }} />
      </CallbackProvider>
    );
    expect(formModuleLoaded).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /Zamów bezpłatną wycenę/ }));

    expect(await screen.findByText(/Ładowanie formularza/)).toBeInTheDocument();
    await screen.findByLabelText(/Numer telefonu/);
    expect(formModuleLoaded).toHaveBeenCalledOnce();
  });
});
