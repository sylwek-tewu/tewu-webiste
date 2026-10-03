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

// "в" after the vowel that ends "Передзвонимо"; "у" before "в" (вівторок) for euphony
const UKRAINIAN_DAYS_PREP = [
  'в неділю',
  'в понеділок',
  'у вівторок',
  'в середу',
  'в четвер',
  'в пʼятницю',
  'в суботу',
];

const UKRAINIAN_MONTHS_GENITIVE = [
  'січня',
  'лютого',
  'березня',
  'квітня',
  'травня',
  'червня',
  'липня',
  'серпня',
  'вересня',
  'жовтня',
  'листопада',
  'грудня',
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
 * Formats a descriptive date phrase for the callback target day in Polish or Ukrainian.
 * If next business day is tomorrow, returns "jutro" or "завтра".
 * Otherwise returns e.g. "w poniedziałek 5 maja" or "у понеділок 5 травня".
 */
export function formatTargetDayPhrase(currentWarsawDateStr: string, targetDate: Date, locale: 'pl' | 'uk' = 'pl'): string {
  const targetWarsaw = getWarsawTime(targetDate);
  const targetDayOfWeek = getWarsawDayOfWeek(targetDate);

  // Check if target is tomorrow
  const currParts = currentWarsawDateStr.split('-').map(Number);
  const tomorrowUtc = new Date(Date.UTC(currParts[0], currParts[1] - 1, currParts[2] + 1, 12, 0, 0));
  const tomorrowStr = tomorrowUtc.toISOString().slice(0, 10);

  if (targetWarsaw.dateStr === tomorrowStr) {
    return locale === 'uk' ? 'завтра' : 'jutro';
  }

  const daysList = locale === 'uk' ? UKRAINIAN_DAYS_PREP : POLISH_DAYS_PREP;
  const monthsList = locale === 'uk' ? UKRAINIAN_MONTHS_GENITIVE : POLISH_MONTHS_GENITIVE;
  const defaultPrep = locale === 'uk' ? 'в робочий день' : 'w dniu roboczym';

  const prepDay = daysList[targetDayOfWeek] || defaultPrep;
  const monthName = monthsList[targetWarsaw.month - 1] || '';
  // Ukrainian dates take a comma: "в понеділок, 12 жовтня"
  return locale === 'uk'
    ? `${prepDay}, ${targetWarsaw.day} ${monthName}`
    : `${prepDay} ${targetWarsaw.day} ${monthName}`;
}

/** "з 8:00 до 12:00" – more natural in Ukrainian than a dashed range. */
function ukTimeRange(slot: { startHour: number; startMinute: number; endHour: number; endMinute: number }): string {
  const time = (h: number, m: number) => `${h}:${String(m).padStart(2, '0')}`;
  return `з ${time(slot.startHour, slot.startMinute)} до ${time(slot.endHour, slot.endMinute)}`;
}

export interface CallbackMessageResult {
  message: string;
  isToday: boolean;
  targetDayPhrase?: string;
}

/**
 * Calculates the exact promise message based on the chosen slot, current Warsaw time, and locale.
 */
export function getCallbackMessage(slot: CallbackSlot, nowInput?: Date, locale: 'pl' | 'uk' = 'pl'): CallbackMessageResult {
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
          message: locale === 'uk'
            ? 'Офіс відкривається о 8:00. Передзвонимо вам сьогодні з 8:00 (за польським часом).'
            : 'Biuro otwiera się o 8:00. Oddzwonimy dziś od 8:00.',
          isToday: true,
        };
      }
      if (wt.totalMinutes < 960) {
        // Between 8:00 and 16:00
        return {
          message: locale === 'uk'
            ? 'Передзвонимо якомога швидше в робочі години (пн–пт 8:00–16:00 за польським часом).'
            : 'Oddzwonimy jak najszybciej, w godzinach pracy biura (pn–pt 8:00–16:00).',
          isToday: true,
        };
      }
      // After 16:00 on a business day
      const nextDate = nextBusinessDay(now);
      const targetPhrase = formatTargetDayPhrase(wt.dateStr, nextDate, locale);
      const daySuffix = (targetPhrase === 'jutro' || targetPhrase === 'завтра') ? targetPhrase : `${targetPhrase}`;
      return {
        message: locale === 'uk'
          ? `Офіс зараз зачинено. Передзвонимо ${daySuffix} з 8:00 (за польським часом).`
          : `Biuro jest teraz zamknięte. Oddzwonimy ${daySuffix} od 8:00.`,
        isToday: false,
        targetDayPhrase: daySuffix,
      };
    } else {
      // Weekend or public holiday
      const nextDate = nextBusinessDay(now);
      const targetPhrase = formatTargetDayPhrase(wt.dateStr, nextDate, locale);
      return {
        message: locale === 'uk'
          ? `Офіс сьогодні зачинено. Передзвонимо ${targetPhrase} з 8:00 (за польським часом).`
          : `Biuro jest dziś nieczynne. Oddzwonimy ${targetPhrase} od 8:00.`,
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
      message: locale === 'uk'
        ? `Передзвонимо сьогодні ${ukTimeRange(slotConfig)} (за польським часом).`
        : `Oddzwonimy dziś w godzinach ${slotConfig.timeRangeLabel}.`,
      isToday: true,
    };
  }

  // Not today -> calculate next business day
  const nextDate = nextBusinessDay(now);
  const targetPhrase = formatTargetDayPhrase(wt.dateStr, nextDate, locale);

  if (targetPhrase === 'jutro' || targetPhrase === 'завтра') {
    return {
      message: locale === 'uk'
        ? `Передзвонимо завтра ${ukTimeRange(slotConfig)} (за польським часом).`
        : `Oddzwonimy jutro w godzinach ${slotConfig.timeRangeLabel}.`,
      isToday: false,
      targetDayPhrase: targetPhrase,
    };
  }

  return {
    message: locale === 'uk'
      ? `Передзвонимо в найближчий робочий день (${targetPhrase}) ${ukTimeRange(slotConfig)} (за польським часом).`
      : `Oddzwonimy w najbliższym dniu roboczym (${targetPhrase}) w godzinach ${slotConfig.timeRangeLabel}.`,
    isToday: false,
    targetDayPhrase: targetPhrase,
  };
}
