"use client";

import React, { createContext, useContext, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Locale, Translations } from './types';
import { LOCALE_COOKIE_NAME, localizePath } from './config';

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

// Lives in config.ts so server code (page metadata) can import it; re-exported for existing callers.
export { localizePath };

/**
 * The locale comes from the root layout ((pl) or (uk) route group), which also sets <html lang>,
 * so each page bundles only its own dictionary.
 */
export function LocaleProvider({
  locale,
  t,
  children,
}: {
  locale: Locale;
  t: Translations;
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '/';
  const router = useRouter();

  const value = useMemo(() => {
    const getLocalizedPath = (targetLocale: Locale) => localizePath(pathname, targetLocale);
    return {
      locale,
      t,
      getLocalizedPath,
      switchLocale: (targetLocale: Locale) => {
        setLocaleCookie(targetLocale);
        // The other locale has its own root layout, so Next.js loads the target as a full page.
        router.push(getLocalizedPath(targetLocale));
      },
    };
  }, [locale, t, pathname, router]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
