import { Locale } from './types';

/**
 * Parses an Accept-Language header string and determines whether the visitor
 * should be routed to Ukrainian ('uk') or Polish ('pl').
 *
 * Requirements:
 * - If browser language contains Ukrainian ('uk', 'uk-UA') or Russian ('ru', 'ru-RU'),
 *   and has higher priority than Polish, returns 'uk'.
 * - Default fallback is 'pl'.
 */
export function detectLocaleFromAcceptLanguage(acceptLanguageHeader: string | null | undefined): Locale {
  if (!acceptLanguageHeader || typeof acceptLanguageHeader !== 'string') {
    return 'pl';
  }

  // Parse header items with quality factors: e.g. "uk-UA,uk;q=0.9,ru;q=0.8,pl;q=0.5,en;q=0.3"
  const entries: { lang: string; q: number }[] = [];

  const parts = acceptLanguageHeader.split(',');
  for (const part of parts) {
    const [tag, qPart] = part.trim().split(';');
    if (!tag) continue;
    const cleanTag = tag.trim().toLowerCase();
    const primaryTag = cleanTag.split('-')[0]; // 'uk-ua' -> 'uk'

    let q = 1.0;
    if (qPart) {
      const match = qPart.match(/q=([0-9.]+)/);
      if (match && match[1]) {
        const parsed = parseFloat(match[1]);
        if (!isNaN(parsed)) {
          q = parsed;
        }
      }
    }

    entries.push({ lang: primaryTag, q });
  }

  let highestUkOrRuQ = -1;
  let highestPlQ = -1;

  for (const entry of entries) {
    if (entry.lang === 'uk' || entry.lang === 'ru') {
      if (entry.q > highestUkOrRuQ) {
        highestUkOrRuQ = entry.q;
      }
    } else if (entry.lang === 'pl') {
      if (entry.q > highestPlQ) {
        highestPlQ = entry.q;
      }
    }
  }

  // If user specified uk or ru, and it is higher than pl (or pl is absent)
  if (highestUkOrRuQ > 0 && highestUkOrRuQ >= highestPlQ) {
    return 'uk';
  }

  return 'pl';
}
