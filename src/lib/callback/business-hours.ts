/**
 * Business hours, office availability, and callback promise copy generator.
 * All computations are performed strictly in Europe/Warsaw timezone.
 */

import { isBusinessDay, nextBusinessDay, getWarsawDayOfWeek } from '../holidays';
import { CallbackSlot, CALLBACK_SLOTS } from './types';

const POLISH_DAYS_PREP = [
  'w niedzielę',
  'w poniedziałek',
  'we wtorek',
  'w środę',
  'w czwartek',
  'w piątek',
  'w sobotę',
];

const POLISH_MONTHS_GENITIVE = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia',
];

export interface WarsawTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  dateStr: string; // 'YYYY-MM-DD'
  totalMinutes: number; // Minutes from midnight
}

/**
 * Returns the current calendar date and time in Europe/Warsaw timezone.
 */
export function getWarsawTime(dateInput?: Date): WarsawTime {
  const date = dateInput ?? new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '0';

  const year = parseInt(get('year'), 10);
  const month = parseInt(get('month'), 10);
  const day = parseInt(get('day'), 10);
  let hour = parseInt(get('hour'), 10);
  if (hour === 24) hour = 0;
  const minute = parseInt(get('minute'), 10);

  const dateStr = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  const totalMinutes = hour * 60 + minute;

  return { year, month, day, hour, minute, dateStr, totalMinutes };
}

/**
 * Checks if the TEWU office is currently open (Monday-Friday 8:00–16:00 Warsaw time, not a holiday).
 */
export function isOfficeOpen(nowInput?: Date): boolean {
  const now = nowInput ?? new Date();
  const wt = getWarsawTime(now);

  if (!isBusinessDay(wt.dateStr)) {
    return false;
  }

  // 8:00 (480 min) to 16:00 (960 min)
  return wt.totalMinutes >= 480 && wt.totalMinutes < 960;
}

/**
 * Formats a descriptive date phrase for the callback target day in Polish.
 * If next business day is tomorrow, returns "jutro".
 * Otherwise returns e.g. "w poniedziałek 5 maja".
 */
export function formatTargetDayPhrase(currentWarsawDateStr: string, targetDate: Date): string {
  const targetWarsaw = getWarsawTime(targetDate);
  const targetDayOfWeek = getWarsawDayOfWeek(targetDate);

  // Check if target is tomorrow
  const currParts = currentWarsawDateStr.split('-').map(Number);
  const tomorrowUtc = new Date(Date.UTC(currParts[0], currParts[1] - 1, currParts[2] + 1, 12, 0, 0));
  const tomorrowStr = tomorrowUtc.toISOString().slice(0, 10);

  if (targetWarsaw.dateStr === tomorrowStr) {
    return 'jutro';
  }

  const prepDay = POLISH_DAYS_PREP[targetDayOfWeek] || 'w dniu roboczym';
  const monthName = POLISH_MONTHS_GENITIVE[targetWarsaw.month - 1] || '';
  return `${prepDay} ${targetWarsaw.day} ${monthName}`;
}

export interface CallbackMessageResult {
  message: string;
  isToday: boolean;
  targetDayPhrase?: string;
}

/**
 * Calculates the exact promise message based on the chosen slot and current Warsaw time.
 */
export function getCallbackMessage(slot: CallbackSlot, nowInput?: Date): CallbackMessageResult {
  const now = nowInput ?? new Date();
  const wt = getWarsawTime(now);
  const todayIsBusinessDay = isBusinessDay(wt.dateStr);

  const slotConfig = CALLBACK_SLOTS.find((s) => s.id === slot) ?? CALLBACK_SLOTS[0];

  // Case 1: "asap" (Jak najszybciej)
  if (slot === 'asap') {
    if (todayIsBusinessDay) {
      if (wt.totalMinutes < 480) {
        // Before 8:00 on a business day
        return {
          message: 'Biuro otwiera się o 8:00. Oddzwonimy dziś od 8:00.',
          isToday: true,
        };
      }
      if (wt.totalMinutes < 960) {
        // Between 8:00 and 16:00
        return {
          message: 'Oddzwonimy jak najszybciej, w godzinach pracy biura (pn–pt 8:00–16:00).',
          isToday: true,
        };
      }
      // After 16:00 on a business day
      const nextDate = nextBusinessDay(now);
      const targetPhrase = formatTargetDayPhrase(wt.dateStr, nextDate);
      const daySuffix = targetPhrase === 'jutro' ? 'jutro' : `${targetPhrase}`;
      return {
        message: `Biuro jest teraz zamknięte. Oddzwonimy ${daySuffix} od 8:00.`,
        isToday: false,
        targetDayPhrase: daySuffix,
      };
    } else {
      // Weekend or public holiday
      const nextDate = nextBusinessDay(now);
      const targetPhrase = formatTargetDayPhrase(wt.dateStr, nextDate);
      return {
        message: `Biuro jest dziś nieczynne. Oddzwonimy ${targetPhrase} od 8:00.`,
        isToday: false,
        targetDayPhrase: targetPhrase,
      };
    }
  }

  // Case 2: Time slots ('8-12', '12-16', '17-18')
  // Buffer requirement: minimum 15 minutes before slot end
  const slotEndMinutes = slotConfig.endHour * 60 + slotConfig.endMinute;
  const bufferCutoffMinutes = slotEndMinutes - 15;

  const canFulfillToday = todayIsBusinessDay && wt.totalMinutes < bufferCutoffMinutes;

  if (canFulfillToday) {
    return {
      message: `Oddzwonimy dziś w godzinach ${slotConfig.timeRangeLabel}.`,
      isToday: true,
    };
  }

  // Not today -> calculate next business day
  const nextDate = nextBusinessDay(now);
  const targetPhrase = formatTargetDayPhrase(wt.dateStr, nextDate);

  if (targetPhrase === 'jutro') {
    return {
      message: `Oddzwonimy jutro w godzinach ${slotConfig.timeRangeLabel}.`,
      isToday: false,
      targetDayPhrase: 'jutro',
    };
  }

  return {
    message: `Oddzwonimy w najbliższym dniu roboczym (${targetPhrase}) w godzinach ${slotConfig.timeRangeLabel}.`,
    isToday: false,
    targetDayPhrase: targetPhrase,
  };
}
