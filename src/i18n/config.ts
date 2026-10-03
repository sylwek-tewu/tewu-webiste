import type { Locale } from './types';

// Kept apart from the dictionaries, so client code can use these without bundling both languages.
export const DEFAULT_LOCALE: Locale = 'pl';
export const SUPPORTED_LOCALES: Locale[] = ['pl', 'uk'];
export const LOCALE_COOKIE_NAME = 'preferred_locale';

export function isSupportedLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}

/** The locale a path belongs to: only a whole "/uk" segment is Ukrainian ("/ukryte" is Polish). */
export function localeOfPath(pathname: string): Locale {
  return pathname === '/uk' || pathname.startsWith('/uk/') ? 'uk' : 'pl';
}

/**
 * Request header set by the proxy: the locale of the requested path, for global-not-found.
 * The proxy always overwrites it, so it is only trustworthy on paths the proxy matcher covers;
 * elsewhere a client could send it, which only changes the language of that client's own 404.
 */
export const SITE_LOCALE_HEADER = 'x-site-locale';
