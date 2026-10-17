// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithMantine } from '@/test/render';
import { CallbackProvider, useCallbackWidget } from '@/components/callback-widget';
import { plTranslations } from '@/i18n';
import { QuoteActions } from './QuoteActions';

function WidgetProbe() {
  const { isOpen, source } = useCallbackWidget();
  return <output>{isOpen ? `open:${source}` : 'closed'}</output>;
}

describe('QuoteActions', () => {
  it('opens the callback widget with the given source', async () => {
    renderWithMantine(
      <CallbackProvider>
        <QuoteActions variant="white" source="faq" />
        <WidgetProbe />
      </CallbackProvider>
    );
    await userEvent.click(screen.getByRole('link', { name: plTranslations.servicePages.ctaButton }));
    expect(screen.getByRole('status')).toHaveTextContent('open:faq');
  });

  it('shows the mobile number and who answers it', () => {
    renderWithMantine(
      <CallbackProvider>
        <QuoteActions variant="primary" source="service" />
      </CallbackProvider>
    );
    expect(screen.getByRole('link', { name: '501 482 555' })).toHaveAttribute('href', 'tel:+48501482555');
    expect(screen.getByText(plTranslations.servicePages.phoneAnswer)).toBeInTheDocument();
  });
});
