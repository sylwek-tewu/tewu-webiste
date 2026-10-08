import { Locale, Translations } from './types';
import { DEFAULT_LOCALE } from './config';
import { plTranslations } from './pl';
import { ukTranslations } from './uk';

export * from './types';
export * from './config';
export { plTranslations } from './pl';
export { ukTranslations } from './uk';

/** Both dictionaries; for server code and tests. Client code gets its one dictionary from the layout's provider. */
export function getDictionary(locale: Locale = DEFAULT_LOCALE): Translations {
  switch (locale) {
    case 'uk':
      return ukTranslations;
    case 'pl':
    default:
      return plTranslations;
  }
}
