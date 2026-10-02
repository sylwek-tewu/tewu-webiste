"use client";

import React, { createContext, useContext, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Locale, Translations, getDictionary, LOCALE_COOKIE_NAME } from './index';

interface LocaleContextValue {
  locale: Locale;
  t: Translations;
  switchLocale: (targetLocale: Locale) => void;
  getLocalizedPath: (targetLocale: Locale) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function setLocaleCookie(locale: Locale) {
  // 1 year retention for user's explicit preference
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const router = useRouter();

  const isUk = pathname === '/uk' || pathname.startsWith('/uk/');
  const locale: Locale = isUk ? 'uk' : 'pl';

  const t = useMemo(() => getDictionary(locale), [locale]);

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const getLocalizedPath = (targetLocale: Locale): string => {
    if (targetLocale === locale) return pathname;

    if (targetLocale === 'uk') {
      // Switching from PL to UK
      if (pathname === '/') return '/uk';
      return `/uk${pathname}`;
    } else {
      // Switching from UK to PL
      if (pathname === '/uk') return '/';
      const withoutUk = pathname.replace(/^\/uk/, '');
      return withoutUk.startsWith('/') ? withoutUk : `/${withoutUk}`;
    }
  };

  const switchLocale = (targetLocale: Locale) => {
    setLocaleCookie(targetLocale);
    const targetPath = getLocalizedPath(targetLocale);
    router.push(targetPath);
  };

  const value = useMemo(
    () => ({
      locale,
      t,
      switchLocale,
      getLocalizedPath,
    }),
    [locale, pathname, t]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
