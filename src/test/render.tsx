import React from 'react';
import { render } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { theme } from '@/theme';
import { LocaleProvider } from '@/i18n/LocaleContext';
import { getDictionary, type Locale } from '@/i18n';

/** Renders inside MantineProvider and LocaleProvider, as the app's root layouts do. */
export function renderWithMantine(ui: React.ReactElement, { locale = 'pl' }: { locale?: Locale } = {}) {
  return render(
    <MantineProvider theme={theme}>
      <LocaleProvider locale={locale} t={getDictionary(locale)}>
        {ui}
      </LocaleProvider>
    </MantineProvider>
  );
}
