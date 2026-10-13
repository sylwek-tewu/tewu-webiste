"use client";

import React from 'react';
import Link from 'next/link';
import { setLocaleCookie, useLocale } from '@/i18n/LocaleContext';
import type { Locale } from '@/i18n/types';
import classes from './LanguageSwitcher.module.css';

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

const OPTIONS: { locale: Locale; code: string }[] = [
  { locale: 'pl', code: 'PL' },
  { locale: 'uk', code: 'UA' },
];

interface LanguageSwitcherProps {
  size?: 'xs' | 'sm' | 'md';
  fullWidth?: boolean;
}

// Plain links, so crawlers and visitors without JavaScript can follow them to the other language.
export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ size = 'sm', fullWidth = false }) => {
  const { locale, getLocalizedPath } = useLocale();

  return (
    <div
      role="group"
      aria-label="Wybierz język / Оберіть мову"
      className={classes.root}
      data-size={size}
      data-full-width={fullWidth || undefined}
    >
      {OPTIONS.map((option) => {
        const isCurrent = option.locale === locale;
        return (
          <Link
            key={option.locale}
            href={getLocalizedPath(option.locale)}
            // A prefetch goes out without the locale cookie; the proxy would redirect "/" to "/uk" for an
            // Accept-Language: uk visitor and Next would then cache that for the PL link. The target is another
            // root layout anyway, so it loads as a full page.
            prefetch={false}
            hrefLang={option.locale}
            aria-current={isCurrent ? 'page' : undefined}
            // The proxy redirects by this cookie; the link itself does the navigation.
            onClick={isCurrent ? undefined : () => setLocaleCookie(option.locale)}
            className={classes.item}
          >
            <Flag locale={option.locale} />
            {option.code}
          </Link>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
