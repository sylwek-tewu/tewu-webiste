import type { Locale } from '@/i18n/types';

const MONTHS_GENITIVE: Record<Locale, string[]> = {
  pl: ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'],
  uk: ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'],
};

const YEAR_ABBREVIATION: Record<Locale, string> = { pl: 'r.', uk: 'р.' };

/**
 * "2026-10-15" → "15 października 2026 r." / "15 жовтня 2026 р.". Without Intl, so the server
 * and every browser render the same text (no hydration mismatch).
 */
export function formatLongDate(locale: Locale, isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return `${day} ${MONTHS_GENITIVE[locale][month - 1]} ${year} ${YEAR_ABBREVIATION[locale]}`;
}
