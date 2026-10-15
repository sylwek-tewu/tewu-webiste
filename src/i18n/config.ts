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

/** The same page's path in the other language: "/kontakt" <-> "/uk/kontakt", "/" <-> "/uk". */
export function localizePath(pathname: string, targetLocale: Locale): string {
  const isUk = localeOfPath(pathname) === 'uk';
  if (targetLocale === 'uk') {
    if (isUk) return pathname;
    return pathname === '/' ? '/uk' : `/uk${pathname}`;
  }
  if (!isUk) return pathname;
  return pathname === '/uk' ? '/' : pathname.slice('/uk'.length);
}

/**
 * Request header set by the proxy: the locale of the requested path, for global-not-found.
 * The proxy always overwrites it on pages, so it is only trustworthy there;
 * elsewhere a client could send it, which only changes the language of that client's own 404.
 */
export const SITE_LOCALE_HEADER = 'x-site-locale';
