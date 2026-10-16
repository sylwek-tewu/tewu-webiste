import type { Locale } from '@/i18n/types';

export interface PluralForms {
  one: string;
  few: string;
  many: string;
}

/**
 * Polish and Ukrainian plural form of a count. They differ only for 21, 31, …:
 * „21 pytań” but „21 запитання”.
 */
export function pluralForm(locale: Locale, n: number): keyof PluralForms {
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  const few = lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14);
  const one = locale === 'pl' ? n === 1 : lastDigit === 1 && lastTwo !== 11;
  if (one) return 'one';
  return few ? 'few' : 'many';
}

export function formatCount(locale: Locale, n: number, forms: PluralForms): string {
  return `${n} ${forms[pluralForm(locale, n)]}`;
}

/** A label with only a singular and a plural, such as „Źródło” / „Źródła” before a list of links. */
export function singularOrPlural(n: number, forms: { one: string; many: string }): string {
  return n === 1 ? forms.one : forms.many;
}
