"use client";

import React from 'react';
import { SegmentedControl, Box } from '@mantine/core';
import { useLocale } from '@/i18n/LocaleContext';
import type { Locale } from '@/i18n/types';

// Inline SVG, not emoji: Windows has no flag emoji glyphs and renders "🇺🇦" as the letters "UA".
const FLAG_STRIPES: Record<Locale, [string, string]> = {
  pl: ['#FFFFFF', '#DC143C'],
  uk: ['#0057B7', '#FFD700'],
};

const Flag: React.FC<{ locale: Locale }> = ({ locale }) => {
  const [top, bottom] = FLAG_STRIPES[locale];
  return (
    <svg width={18} height={12} viewBox="0 0 3 2" aria-hidden="true" style={{ borderRadius: 2, boxShadow: '0 0 0 1px rgba(15, 23, 42, 0.15)', flexShrink: 0 }}>
      <rect width={3} height={1} fill={top} />
      <rect y={1} width={3} height={1} fill={bottom} />
    </svg>
  );
};

const optionLabel = (locale: Locale, code: string) => (
  <>
    <Flag locale={locale} />
    {code}
  </>
);

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
          { label: optionLabel('pl', 'PL'), value: 'pl' },
          { label: optionLabel('uk', 'UA'), value: 'uk' },
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
          innerLabel: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          },
        }}
      />
    </Box>
  );
};

export default LanguageSwitcher;
