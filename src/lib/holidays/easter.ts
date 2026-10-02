/**
 * Calculates Easter date using the Anonymous Gregorian algorithm.
 * Ported from https://github.com/mtk3d/poland-public-holidays (commit 4ad14bc536051155a81b25b3cda7e76ecf41cfaa)
 * Copyright 2021 Kamil Szydlowski (MIT License)
 */

export interface DateParts {
  year: number;
  month: number; // 1-12
  day: number;   // 1-31
}

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
  // Using 12:00:00 UTC prevents any DST shift ambiguity
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
