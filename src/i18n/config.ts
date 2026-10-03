import type { Locale } from './types';

// Kept apart from the dictionaries, so client code can use these without bundling both languages.
export const DEFAULT_LOCALE: Locale = 'pl';
export const SUPPORTED_LOCALES: Locale[] = ['pl', 'uk'];
export const LOCALE_COOKIE_NAME = 'preferred_locale';

export function isSupportedLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}

/** Request header set by the proxy: the locale of the requested path, for global-not-found. */
export const SITE_LOCALE_HEADER = 'x-site-locale';
