// @vitest-environment jsdom
import React, { useEffect } from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithMantine } from '@/test/render';
import { CallbackProvider, useCallbackWidget } from './CallbackContext';
import { CallbackFormLoading } from './CallbackFormFallbacks';

function OpenedLoading() {
  const { openWidget } = useCallbackWidget();
  useEffect(() => openWidget('floating'), [openWidget]);
  return <CallbackFormLoading />;
}

describe('CallbackFormLoading', () => {
  it.each([
    ['pl', 'Ładowanie formularza…'],
    ['uk', 'Завантаження форми…'],
  ] as const)('shows the loading text in the page language (%s)', async (locale, text) => {
    renderWithMantine(
      <CallbackProvider>
        <OpenedLoading />
      </CallbackProvider>,
      { locale }
    );
    expect(await screen.findByText(text)).toBeInTheDocument();
  });
});
