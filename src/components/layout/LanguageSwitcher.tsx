"use client";

import React from 'react';
import { SegmentedControl, Box } from '@mantine/core';
import { useLocale } from '@/i18n/LocaleContext';
import type { Locale } from '@/i18n/types';

interface LanguageSwitcherProps {
  size?: 'xs' | 'sm' | 'md';
  fullWidth?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ size = 'sm', fullWidth = false }) => {
  const { locale, switchLocale } = useLocale();

  return (
    <Box style={{ display: fullWidth ? 'block' : 'inline-block' }}>
      <SegmentedControl
        value={locale}
        onChange={(val) => switchLocale(val as Locale)}
        data={[
          { label: '🇵🇱 PL', value: 'pl' },
          { label: '🇺🇦 UA', value: 'uk' },
        ]}
        size={size}
        radius="xl"
        fullWidth={fullWidth}
        aria-label="Wybierz język / Оберіть мову"
        styles={{
          root: {
            backgroundColor: 'var(--mantine-color-slate-1)',
            padding: 3,
            border: '1px solid var(--mantine-color-slate-2)',
          },
          indicator: {
            backgroundColor: 'var(--mantine-color-white)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
          },
          label: {
            fontWeight: 700,
            fontSize: size === 'xs' ? '0.75rem' : '0.8125rem',
            paddingTop: 4,
            paddingBottom: 4,
            paddingLeft: 10,
            paddingRight: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
          },
        }}
      />
    </Box>
  );
};

export default LanguageSwitcher;
