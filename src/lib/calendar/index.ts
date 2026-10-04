/**
 * Consolidated Calendar & Office Hours Module for TEWU.
 *
 * Consolidates Polish statutory holidays, Anonymous Gregorian Easter algorithm,
 * business day progression, office hours determination, and language-neutral
 * callback commitment calculation in Europe/Warsaw timezone.
 *
 * Holiday rules and Easter math ported from https://github.com/mtk3d/poland-public-holidays
 * (commit 4ad14bc536051155a81b25b3cda7e76ecf41cfaa), Copyright 2021 Kamil Szydlowski (MIT License).
 * See src/lib/holidays/LICENSE.poland-public-holidays.txt.
 */

import type { CallbackSlot } from '../callback/types';
export type { CallbackSlot };

// --- Module-Cached Intl.DateTimeFormat Instances for Europe/Warsaw ---

const warsawDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Warsaw',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const warsawTimeFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Warsaw',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const warsawHourFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Warsaw',
  hour: 'numeric',
  hour12: false,
});

// --- Types & Interfaces ---

export interface Holiday {
  name: string;
  namePL: string;
  date: string; // ISO date string 'YYYY-MM-DD' in Europe/Warsaw
}

export interface HolidayConfig {
  name: string;
  namePL: string;
  type: 'fixed' | 'movable';
}

export interface FixedHoliday extends HolidayConfig {
  type: 'fixed';
  date: string; // 'MM-DD'
}

export interface MovableHoliday extends HolidayConfig {
  type: 'movable';
  afterEaster: number; // Days after Easter Sunday (0 = Easter, 1 = Easter Monday, 49 = Pentecost, 60 = Corpus Christi)
}

export interface DateParts {
  year: number;
  month: number; // 1-12
  day: number;   // 1-31
}

export interface WarsawTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  dateStr: string; // 'YYYY-MM-DD'
  totalMinutes: number; // Minutes from midnight
}

export interface CallbackCommitment {
  isToday: boolean;
  isTomorrow: boolean;
  /** Start of the slot's window on the day we will call. */
  targetDate: Date;
  slot: CallbackSlot;
  withinOfficeHours: boolean;
  officeState: 'open' | 'before_hours' | 'after_hours' | 'closed_day';
}

// --- Holiday Configuration & Rules ---

/**
 * Public holidays in Poland according to Polish law (Dz.U. 1951 nr 4 poz. 28 with amendments).
 * Note: Christmas Eve (Wigilia, 12-24) is included as a holiday according to the feature/add-christmas-eve branch.
 */
export const POLISH_HOLIDAYS_RULES: (FixedHoliday | MovableHoliday)[] = [
  {
    name: 'New Year',
    namePL: 'Nowy Rok',
    date: '01-01',
    type: 'fixed',
  },
  {
    name: "Three Kings' Day",
    namePL: 'Święto Trzech Króli',
    date: '01-06',
    type: 'fixed',
  },
  {
    name: 'Labour Day',
    namePL: 'Święto Pracy',
    date: '05-01',
    type: 'fixed',
  },
  {
    name: '3 May Constitution Day',
    namePL: 'Narodowe Święto Konstytucji Trzeciego Maja',
    date: '05-03',
    type: 'fixed',
  },
  {
    name: 'Assumption of Mary',
    namePL: 'Wniebowzięcie Najświętszej Maryi Panny',
    date: '08-15',
    type: 'fixed',
  },
  {
    name: "All Saints' Day",
    namePL: 'Wszystkich Świętych',
    date: '11-01',
    type: 'fixed',
  },
  {
    name: 'National Independence Day',
    namePL: 'Narodowe Święto Niepodległości',
    date: '11-11',
    type: 'fixed',
  },
  {
    name: 'Christmas Eve',
    namePL: 'Wigilia Bożego Narodzenia',
    date: '12-24',
    type: 'fixed',
  },
  {
    name: 'Christmas',
    namePL: 'Boże Narodzenie',
    date: '12-25',
    type: 'fixed',
  },
  {
    name: 'Second Day of Christmas',
    namePL: 'Boże Narodzenie - drugi dzień',
    date: '12-26',
    type: 'fixed',
  },
  {
    name: 'Easter Sunday',
    namePL: 'Niedziela Wielkanocna',
    type: 'movable',
    afterEaster: 0,
  },
  {
    name: 'Easter Monday',
    namePL: 'Poniedziałek Wielkanocny',
    type: 'movable',
    afterEaster: 1,
  },
  {
    name: 'Green Week',
    namePL: 'Zielone Świątki',
    type: 'movable',
    afterEaster: 49,
  },
  {
    name: 'Feast of Corpus Christi',
    namePL: 'Boże Ciało',
    type: 'movable',
    afterEaster: 60,
  },
];

export const EXTRA_CLOSED_DATES: string[] = [];

/**
 * Returns the effective list of extra closed dates, combining the static configuration
 * and the NEXT_PUBLIC_EXTRA_CLOSED_DATES environment variable (comma-separated 'YYYY-MM-DD').
 */
export function getExtraClosedDates(overrideList?: string[]): string[] {
  if (overrideList) {
    return overrideList;
  }
  const envDates = process.env.NEXT_PUBLIC_EXTRA_CLOSED_DATES
    ? process.env.NEXT_PUBLIC_EXTRA_CLOSED_DATES.split(',')
        .map((s) => s.trim())
        .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s))
    : [];

  return Array.from(new Set([...EXTRA_CLOSED_DATES, ...envDates]));
}

// --- Easter Calculation (Anonymous Gregorian Algorithm) ---

/**
 * Calculates Easter Sunday calendar date for a given year.
 * Reference: https://en.wikipedia.org/wiki/Date_of_Easter#Anonymous_Gregorian_algorithm
 */
export function getEasterDateParts(year: number): DateParts {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const p = h + l - 7 * m + 114;

  const day = (p % 31) + 1;
  const month = Math.floor(p / 31); // 3 = March, 4 = April

  return { year, month, day };
}

/**
 * Adds an integer number of days to a calendar date using UTC noon arithmetic
 * to prevent any timezone/DST shift.
 */
export function addDaysToParts(parts: DateParts, days: number): DateParts {
  const utcDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days, 12, 0, 0));
  return {
    year: utcDate.getUTCFullYear(),
    month: utcDate.getUTCMonth() + 1,
    day: utcDate.getUTCDate(),
  };
}

export function formatPartsToString(parts: DateParts): string {
  const y = parts.year.toString().padStart(4, '0');
  const m = parts.month.toString().padStart(2, '0');
  const d = parts.day.toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// --- Europe/Warsaw Timezone Operations ---

/**
 * Converts a Date object or ISO date string into a calendar date string 'YYYY-MM-DD'
 * in the Europe/Warsaw timezone.
 */
export function getWarsawDateString(dateInput: Date | string): string {
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }
  const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(dateObj.getTime())) {
    throw new Error(`Invalid date: ${dateInput}`);
  }
  return warsawDateFormatter.format(dateObj);
}

/**
 * Extracts year, month, day components in Europe/Warsaw timezone.
 */
export function getWarsawDateParts(dateInput: Date | string): DateParts {
  const dateStr = getWarsawDateString(dateInput);
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month, day };
}

/**
 * Returns the current calendar date and time in Europe/Warsaw timezone.
 */
export function getWarsawTime(dateInput?: Date): WarsawTime {
  const date = dateInput ?? new Date();
  const parts = warsawTimeFormatter.formatToParts(date);
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
 * Returns day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday) in Europe/Warsaw timezone.
 */
export function getWarsawDayOfWeek(dateInput: Date | string): number {
  const parts = getWarsawDateParts(dateInput);
  const utcDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0));
  return utcDate.getUTCDay();
}

/**
 * Checks if the given date falls on a weekend (Saturday or Sunday) in Warsaw.
 */
export function isWeekend(dateInput: Date | string): boolean {
  const day = getWarsawDayOfWeek(dateInput);
  return day === 0 || day === 6;
}

/**
 * Creates a Date instance representing a specific time on a given Warsaw calendar day.
 */
export function createWarsawDate(dateStr: string, hour = 8, minute = 0): Date {
  const baseUtc = new Date(`${dateStr}T12:00:00Z`);
  const warsawHourStr = warsawHourFormatter.format(baseUtc);
  const warsawHour = parseInt(warsawHourStr, 10);
  const offsetHours = warsawHour - 12; // +1 or +2
  const offsetSign = offsetHours >= 0 ? '+' : '-';
  const offsetFormatted = `${offsetSign}${String(Math.abs(offsetHours)).padStart(2, '0')}:00`;
  const timeFormatted = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
  return new Date(`${dateStr}T${timeFormatted}${offsetFormatted}`);
}

// --- Holiday Checks ---

/**
 * Returns all Polish public holidays in a given calendar year.
 */
export function getHolidaysInYear(yearInput: number | Date | string): Holiday[] {
  let yearNumber: number;
  if (typeof yearInput === 'number') {
    yearNumber = yearInput;
  } else {
    yearNumber = getWarsawDateParts(yearInput).year;
  }

  if (isNaN(yearNumber) || yearNumber <= 0) {
    throw new Error(`Invalid year: ${yearInput}`);
  }

  const easterParts = getEasterDateParts(yearNumber);

  const holidays: Holiday[] = POLISH_HOLIDAYS_RULES.map((rule) => {
    let dateStr: string;
    if (rule.type === 'fixed') {
      const y = yearNumber.toString().padStart(4, '0');
      dateStr = `${y}-${rule.date}`;
    } else {
      const holidayParts = addDaysToParts(easterParts, rule.afterEaster);
      dateStr = formatPartsToString(holidayParts);
    }

    return {
      name: rule.name,
      namePL: rule.namePL,
      date: dateStr,
    };
  });

  return holidays.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Returns holiday details if the date is a Polish public holiday, or undefined otherwise.
 */
export function getHolidayOnDate(dateInput: Date | string): Holiday | undefined {
  const dateStr = getWarsawDateString(dateInput);
  const year = parseInt(dateStr.slice(0, 4), 10);
  const holidays = getHolidaysInYear(year);
  return holidays.find((h) => h.date === dateStr);
}

/**
 * Checks if a given date is a statutory Polish public holiday.
 */
export function isPolishHoliday(dateInput: Date | string): boolean {
  return getHolidayOnDate(dateInput) !== undefined;
}

// --- Business Day & Office Hours Determination ---

/**
 * Checks if a given date is a working business day for TEWU
 * (Monday-Friday, not a statutory Polish holiday, and not an extra closed date).
 */
export function isBusinessDay(dateInput: Date | string, extraClosedOverride?: string[]): boolean {
  if (isWeekend(dateInput)) {
    return false;
  }
  if (isPolishHoliday(dateInput)) {
    return false;
  }
  const dateStr = getWarsawDateString(dateInput);
  const extraClosed = getExtraClosedDates(extraClosedOverride);
  if (extraClosed.includes(dateStr)) {
    return false;
  }
  return true;
}

/**
 * Returns the next business day (strictly after the provided date's calendar day),
 * set to 08:00 Warsaw time.
 */
export function nextBusinessDay(dateInput?: Date | string, extraClosedOverride?: string[]): Date {
  const base = dateInput ?? new Date();
  let parts: DateParts = getWarsawDateParts(base);

  // Advance day by day until a business day is reached
  for (let i = 0; i < 365; i++) {
    parts = addDaysToParts(parts, 1);
    const candidateStr = formatPartsToString(parts);
    if (isBusinessDay(candidateStr, extraClosedOverride)) {
      return createWarsawDate(candidateStr, 8, 0);
    }
  }

  throw new Error(`Could not find next business day within 365 days of ${dateInput}`);
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

// --- Callback Commitment Calculation ---

const FIXED_SLOT_BUFFER_MINUTES = 15;

/** Minutes since midnight, Warsaw time. */
export interface SlotWindow {
  startMinutes: number;
  endMinutes: number;
}

/**
 * When we call back for each slot; 'asap' is the office's working hours. The one source for the
 * cutoff, the promise shown in the form and the slot names in notifications.
 */
export const CALLBACK_SLOT_WINDOWS: Record<CallbackSlot, SlotWindow> = {
  asap: { startMinutes: 8 * 60, endMinutes: 16 * 60 },
  '8-12': { startMinutes: 8 * 60, endMinutes: 12 * 60 },
  '12-16': { startMinutes: 12 * 60, endMinutes: 16 * 60 },
  '17-18': { startMinutes: 17 * 60, endMinutes: 18 * 60 },
};

/** "8:00", "17:30" */
export function formatClockTime(minutes: number): string {
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;
}

/**
 * Calculates language-neutral callback commitment data based on slot, current Warsaw time,
 * and office availability.
 */
export function getCallbackCommitment(slot: CallbackSlot, nowInput?: Date): CallbackCommitment {
  const now = nowInput ?? new Date();
  const wt = getWarsawTime(now);
  const todayIsBusinessDay = isBusinessDay(wt.dateStr);

  let officeState: 'open' | 'before_hours' | 'after_hours' | 'closed_day';
  if (!todayIsBusinessDay) {
    officeState = 'closed_day';
  } else if (wt.totalMinutes < 480) {
    officeState = 'before_hours';
  } else if (wt.totalMinutes < 960) {
    officeState = 'open';
  } else {
    officeState = 'after_hours';
  }

  const withinOfficeHours = officeState === 'open';

  let canFulfillToday = false;
  if (todayIsBusinessDay) {
    if (slot === 'asap') {
      canFulfillToday = wt.totalMinutes < 960;
    } else {
      const bufferCutoffMinutes = CALLBACK_SLOT_WINDOWS[slot].endMinutes - FIXED_SLOT_BUFFER_MINUTES;
      canFulfillToday = wt.totalMinutes < bufferCutoffMinutes;
    }
  }

  const isToday = canFulfillToday;
  const targetDateStr = isToday ? wt.dateStr : getWarsawDateString(nextBusinessDay(now));
  const { startMinutes } = CALLBACK_SLOT_WINDOWS[slot];
  const targetDate = createWarsawDate(targetDateStr, Math.floor(startMinutes / 60), startMinutes % 60);

  const todayParts = getWarsawDateParts(now);
  const tomorrowParts = addDaysToParts(todayParts, 1);
  const tomorrowStr = formatPartsToString(tomorrowParts);
  const isTomorrow = targetDateStr === tomorrowStr;

  return {
    isToday,
    isTomorrow,
    targetDate,
    slot,
    withinOfficeHours,
    officeState,
  };
}
