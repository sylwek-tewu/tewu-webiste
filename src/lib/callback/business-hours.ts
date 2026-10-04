/**
 * Business hours and office availability facade.
 * Delegates timezone and commitment calculation to `@/lib/calendar`
 * and copy formatting to `@/i18n/format-commitment`.
 */

import {
  getWarsawTime,
  isOfficeOpen,
  getCallbackCommitment,
  type WarsawTime,
} from '../calendar';
import type { CallbackSlot } from './types';
import {
  formatCallbackCommitment,
  formatTargetDayPhrase as formatTargetDayPhraseI18n,
} from '@/i18n/format-commitment';
import { plTranslations } from '@/i18n/pl';
import { ukTranslations } from '@/i18n/uk';

export type { WarsawTime };
export { getWarsawTime, isOfficeOpen };

export interface CallbackMessageResult {
  message: string;
  isToday: boolean;
  targetDayPhrase?: string;
}

/**
 * Formats a descriptive date phrase for the callback target day in Polish or Ukrainian.
 * If next business day is tomorrow, returns "jutro" or "завтра".
 * Otherwise returns e.g. "w poniedziałek 5 maja" or "у понеділок 5 травня".
 */
export function formatTargetDayPhrase(
  currentWarsawDateStr: string,
  targetDate: Date,
  locale: 'pl' | 'uk' = 'pl'
): string {
  const t = locale === 'uk' ? ukTranslations.callbackWidget : plTranslations.callbackWidget;
  const targetWarsaw = getWarsawTime(targetDate);

  const currParts = currentWarsawDateStr.split('-').map(Number);
  const tomorrowUtc = new Date(Date.UTC(currParts[0], currParts[1] - 1, currParts[2] + 1, 12, 0, 0));
  const tomorrowStr = tomorrowUtc.toISOString().slice(0, 10);
  const isTomorrow = targetWarsaw.dateStr === tomorrowStr;

  return formatTargetDayPhraseI18n(targetDate, t, isTomorrow);
}

/**
 * Calculates the exact promise message based on the chosen slot, current Warsaw time, and locale.
 * Delegates to getCallbackCommitment (calculation) and formatCallbackCommitment (i18n copy).
 */
export function getCallbackMessage(
  slot: CallbackSlot,
  nowInput?: Date,
  locale: 'pl' | 'uk' = 'pl'
): CallbackMessageResult {
  const commitment = getCallbackCommitment(slot, nowInput);
  const t = locale === 'uk' ? ukTranslations.callbackWidget : plTranslations.callbackWidget;
  return formatCallbackCommitment(commitment, t, locale);
}
