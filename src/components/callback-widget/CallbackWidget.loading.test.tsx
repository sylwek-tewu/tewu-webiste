// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithMantine } from '@/test/render';
import { CallbackProvider } from './CallbackContext';
import CallbackWidget from './CallbackWidget';

// Own file: the lazy form module must not be cached by an earlier test.
describe('CallbackWidget first open', () => {
  it('shows a loading state while the form is being downloaded', async () => {
    const user = userEvent.setup();
    renderWithMantine(
      <CallbackProvider>
        <CallbackWidget callInfo={{ raw: '+48914824190', telUri: 'tel:+48914824190', display: '91 48 24 190' }} />
      </CallbackProvider>
    );

    await user.click(screen.getByRole('button', { name: /Zamów bezpłatną wycenę/ }));

    expect(await screen.findByText(/Ładowanie formularza/)).toBeInTheDocument();
    await screen.findByLabelText(/Numer telefonu/);
  });
});
