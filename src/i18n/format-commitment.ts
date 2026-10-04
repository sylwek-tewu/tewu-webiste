/**
 * Formats callback commitment calculations into localized copy
 * using the dictionary templates from Translations['callbackWidget'].
 */

import type { CallbackCommitment } from '@/lib/calendar';
import { getWarsawDayOfWeek, getWarsawDateParts } from '@/lib/calendar';
import type { Translations, Locale } from '@/i18n/types';

/**
 * Formats a descriptive date phrase for the callback target day (e.g. "jutro" or "w poniedziałek 12 października").
 */
export function formatTargetDayPhrase(
  targetDate: Date,
  t: Translations['callbackWidget'],
  isTomorrow = false
): string {
  if (isTomorrow) {
    return t.commitment.tomorrow;
  }
  const dayOfWeek = getWarsawDayOfWeek(targetDate);
  const parts = getWarsawDateParts(targetDate);
  const prepDay = t.commitment.daysPrep[dayOfWeek] || t.commitment.defaultPrep;
  const monthName = t.commitment.monthsGenitive[parts.month - 1] || '';
  return t.commitment.formatTargetDayPhrase(prepDay, parts.day, monthName);
}

export interface FormattedCommitmentResult {
  message: string;
  isToday: boolean;
  targetDayPhrase?: string;
}

/**
 * Formats a language-neutral CallbackCommitment into a localized sentence and metadata
 * according to the provided locale dictionary.
 */
export function formatCallbackCommitment(
  commitment: CallbackCommitment,
  t: Translations['callbackWidget'],
  _locale?: Locale
): FormattedCommitmentResult {
  const tc = t.commitment;

  // Case 1: "asap" (Jak najszybciej / Якомога швидше)
  if (commitment.slot === 'asap') {
    if (commitment.isToday) {
      if (commitment.officeState === 'before_hours') {
        return {
          message: tc.asapBeforeHours,
          isToday: true,
        };
      }
      return {
        message: tc.asapOpen,
        isToday: true,
      };
    }

    // Not today: check if tomorrow or another business day
    const targetDayPhrase = commitment.isTomorrow
      ? tc.tomorrow
      : formatTargetDayPhrase(commitment.targetDate, t, false);

    if (commitment.officeState === 'after_hours') {
      return {
        message: tc.asapAfterHours(targetDayPhrase),
        isToday: false,
        targetDayPhrase,
      };
    }

    return {
      message: tc.asapClosedDay(targetDayPhrase),
      isToday: false,
      targetDayPhrase,
    };
  }

  // Case 2: Fixed time slots ('8-12', '12-16', '17-18')
  const timeRange = tc.formatSlotRange(commitment.slot);

  if (commitment.isToday) {
    return {
      message: tc.slotToday(timeRange),
      isToday: true,
    };
  }

  if (commitment.isTomorrow) {
    return {
      message: tc.slotTomorrow(timeRange),
      isToday: false,
      targetDayPhrase: tc.tomorrow,
    };
  }

  const targetDayPhrase = formatTargetDayPhrase(commitment.targetDate, t, false);
  return {
    message: tc.slotNextBusinessDay(targetDayPhrase, timeRange),
    isToday: false,
    targetDayPhrase,
  };
}
