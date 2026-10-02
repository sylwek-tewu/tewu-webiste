/**
 * Polish public holidays calculation engine with Europe/Warsaw timezone safety.
 * Ported from https://github.com/mtk3d/poland-public-holidays (commit 4ad14bc536051155a81b25b3cda7e76ecf41cfaa)
 * Copyright 2021 Kamil Szydlowski (MIT License)
 */

import { Holiday } from './types';
import { POLISH_HOLIDAYS_RULES } from './config';
import {
  getEasterDateParts,
  addDaysToParts,
  formatPartsToString,
  DateParts,
} from './easter';

const warsawDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Warsaw',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

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
