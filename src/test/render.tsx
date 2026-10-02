import React from 'react';
import { render } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { theme } from '@/theme';
import { LocaleProvider } from '@/i18n/LocaleContext';

/** Renders inside MantineProvider and LocaleProvider, as the app's root layout does. */
export function renderWithMantine(ui: React.ReactElement) {
  return render(
    <MantineProvider theme={theme}>
      <LocaleProvider>{ui}</LocaleProvider>
    </MantineProvider>
  );
}
