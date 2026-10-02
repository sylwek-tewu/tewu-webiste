/**
 * Business days calculations for TEWU office.
 */

import { getWarsawDateParts, getWarsawDateString, isPolishHoliday } from './holidays';
import { getExtraClosedDates } from './config';
import { addDaysToParts, formatPartsToString, DateParts } from './easter';

/**
 * Returns day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday) in Europe/Warsaw timezone.
 */
export function getWarsawDayOfWeek(dateInput: Date | string): number {
  const parts = getWarsawDateParts(dateInput);
  // Using noon UTC is immune to any DST shift
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
 * Creates a Date instance representing a specific time on a given Warsaw calendar day.
 */
export function createWarsawDate(dateStr: string, hour = 8, minute = 0): Date {
  const baseUtc = new Date(`${dateStr}T12:00:00Z`);
  const warsawHourStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Warsaw',
    hour: 'numeric',
    hour12: false,
  }).format(baseUtc);
  const warsawHour = parseInt(warsawHourStr, 10);
  const offsetHours = warsawHour - 12; // +1 or +2
  const offsetSign = offsetHours >= 0 ? '+' : '-';
  const offsetFormatted = `${offsetSign}${String(Math.abs(offsetHours)).padStart(2, '0')}:00`;
  const timeFormatted = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
  return new Date(`${dateStr}T${timeFormatted}${offsetFormatted}`);
}

/**
 * Returns the next business day (strictly after the provided date's calendar day),
 * set to 08:00 Warsaw time.
 */
export function nextBusinessDay(dateInput: Date | string, extraClosedOverride?: string[]): Date {
  let parts: DateParts = getWarsawDateParts(dateInput);

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
