import { Locale, Translations } from './types';
import { plTranslations } from './pl';
import { ukTranslations } from './uk';

export * from './types';
export { plTranslations } from './pl';
export { ukTranslations } from './uk';

export const DEFAULT_LOCALE: Locale = 'pl';
export const SUPPORTED_LOCALES: Locale[] = ['pl', 'uk'];
export const LOCALE_COOKIE_NAME = 'preferred_locale';

export function isSupportedLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}

export function getDictionary(locale: Locale = DEFAULT_LOCALE): Translations {
  switch (locale) {
    case 'uk':
      return ukTranslations;
    case 'pl':
    default:
      return plTranslations;
  }
}
