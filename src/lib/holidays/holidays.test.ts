import { describe, it, expect } from 'vitest';
import {
  isPolishHoliday,
  getHolidaysInYear,
  getHolidayOnDate,
  getWarsawDateString,
  isBusinessDay,
  nextBusinessDay,
  isWeekend,
} from './index';

describe('Polish Public Holidays (Original Spec Ported)', () => {
  const existingHolidays = [
    { date: '2006-01-06', name: "Three Kings' Day", namePL: 'Święto Trzech Króli' },
    { date: '1950-05-28', name: 'Green Week', namePL: 'Zielone Świątki' },
    { date: '1990-12-25', name: 'Christmas', namePL: 'Boże Narodzenie' },
    { date: '2025-12-24', name: 'Christmas Eve', namePL: 'Wigilia Bożego Narodzenia' },
  ];

  const nonHolidays = [
    '1978-10-02',
    '2021-02-13',
    '2020-12-07',
    '1919-06-24',
    '2026-05-02', // Normal Saturday
    '2026-10-02', // Normal Friday
  ];

  it('detects existing holidays correctly', () => {
    for (const testCase of existingHolidays) {
      expect(isPolishHoliday(testCase.date)).toBe(true);
      const holiday = getHolidayOnDate(testCase.date);
      expect(holiday).toBeDefined();
      expect(holiday?.name).toBe(testCase.name);
      expect(holiday?.namePL).toBe(testCase.namePL);
    }
  });

  it('identifies non-holidays correctly', () => {
    for (const date of nonHolidays) {
      expect(isPolishHoliday(date)).toBe(false);
      expect(getHolidayOnDate(date)).toBeUndefined();
    }
  });

  it('throws on invalid dates', () => {
    expect(() => getHolidayOnDate('invalid-date')).toThrow('Invalid date');
    expect(() => isPolishHoliday('not-a-date')).toThrow('Invalid date');
  });

  it('throws on invalid year', () => {
    expect(() => getHolidaysInYear(0)).toThrow('Invalid year');
    expect(() => getHolidaysInYear(-2020)).toThrow('Invalid year');
  });
});

describe('Movable Holidays for 2026, 2027, 2028', () => {
  it('calculates 2026 holidays accurately', () => {
    const holidays2026 = getHolidaysInYear(2026);
    const dateOf = (namePL: string) => holidays2026.find((h) => h.namePL === namePL)?.date;

    expect(dateOf('Niedziela Wielkanocna')).toBe('2026-04-05');
    expect(dateOf('Poniedziałek Wielkanocny')).toBe('2026-04-06');
    expect(dateOf('Zielone Świątki')).toBe('2026-05-24');
    expect(dateOf('Boże Ciało')).toBe('2026-06-04');
    expect(dateOf('Wigilia Bożego Narodzenia')).toBe('2026-12-24');
  });

  it('calculates 2027 holidays accurately', () => {
    const holidays2027 = getHolidaysInYear(2027);
    const dateOf = (namePL: string) => holidays2027.find((h) => h.namePL === namePL)?.date;

    expect(dateOf('Niedziela Wielkanocna')).toBe('2027-03-28');
    expect(dateOf('Poniedziałek Wielkanocny')).toBe('2027-03-29');
    expect(dateOf('Zielone Świątki')).toBe('2027-05-16');
    expect(dateOf('Boże Ciało')).toBe('2027-05-27');
    expect(dateOf('Wigilia Bożego Narodzenia')).toBe('2027-12-24');
  });

  it('calculates 2028 holidays accurately', () => {
    const holidays2028 = getHolidaysInYear(2028);
    const dateOf = (namePL: string) => holidays2028.find((h) => h.namePL === namePL)?.date;

    expect(dateOf('Niedziela Wielkanocna')).toBe('2028-04-16');
    expect(dateOf('Poniedziałek Wielkanocny')).toBe('2028-04-17');
    expect(dateOf('Zielone Świątki')).toBe('2028-06-04');
    expect(dateOf('Boże Ciało')).toBe('2028-06-15');
    expect(dateOf('Wigilia Bożego Narodzenia')).toBe('2028-12-24');
  });
});

describe('Timezone & Midnight Safety (Europe/Warsaw vs UTC)', () => {
  it('correctly maps 23:30 Warsaw time on Dec 31 to Dec 31', () => {
    // 2026-12-31 23:30:00 CET is 2026-12-31 22:30:00Z in UTC
    const date = new Date('2026-12-31T22:30:00Z');
    expect(getWarsawDateString(date)).toBe('2026-12-31');
    expect(isPolishHoliday(date)).toBe(false); // Sylwester is not a public holiday
  });

  it('correctly maps 00:30 Warsaw time on Jan 1 (which is 23:30 Dec 31 in UTC) to New Year Jan 1', () => {
    // In UTC, this is still 2026-12-31 23:30:00Z!
    // But in Warsaw it is 2027-01-01 00:30:00 CET!
    const newYearEveUtc = new Date('2026-12-31T23:30:00Z');
    expect(getWarsawDateString(newYearEveUtc)).toBe('2027-01-01');
    expect(isPolishHoliday(newYearEveUtc)).toBe(true); // Nowy Rok!
    expect(getHolidayOnDate(newYearEveUtc)?.namePL).toBe('Nowy Rok');
  });
});

describe('Business Days and Next Business Day Calculations', () => {
  it('identifies weekends correctly', () => {
    expect(isWeekend('2026-10-02')).toBe(false); // Friday
    expect(isWeekend('2026-10-03')).toBe(true);  // Saturday
    expect(isWeekend('2026-10-04')).toBe(true);  // Sunday
    expect(isWeekend('2026-10-05')).toBe(false); // Monday
  });

  it('handles regular Friday -> Monday transition', () => {
    const friday = new Date('2026-10-02T10:00:00+02:00');
    const next = nextBusinessDay(friday);
    expect(getWarsawDateString(next)).toBe('2026-10-05'); // Monday
  });

  it('handles Friday holiday -> Monday transition', () => {
    // 2026-05-01 is Labour Day (Friday)
    expect(isPolishHoliday('2026-05-01')).toBe(true);
    expect(isBusinessDay('2026-05-01')).toBe(false);

    // Thursday before May 1
    const nextFromThursday = nextBusinessDay('2026-04-30');
    // 2026-05-01 is Holiday (Fri), 2026-05-02 is Sat, 2026-05-03 is Sun (and 3 May Constitution)
    // Next business day is Monday 2026-05-04!
    expect(getWarsawDateString(nextFromThursday)).toBe('2026-05-04');
  });

  it('respects EXTRA_CLOSED_DATES overrides', () => {
    const monday = '2026-10-05';
    expect(isBusinessDay(monday)).toBe(true);

    // Mark 2026-10-05 as closed
    expect(isBusinessDay(monday, ['2026-10-05'])).toBe(false);

    // Next business day from Friday when Monday is closed -> Tuesday
    const nextFromFriday = nextBusinessDay('2026-10-02', ['2026-10-05']);
    expect(getWarsawDateString(nextFromFriday)).toBe('2026-10-06');
  });

  it('handles Christmas holiday transitions (24 XII - 26 XII)', () => {
    // 2026-12-24 is Thursday (Wigilia) -> Holiday
    // 2026-12-25 is Friday (Christmas Day 1) -> Holiday
    // 2026-12-26 is Saturday (Christmas Day 2) -> Holiday & Weekend
    // 2026-12-27 is Sunday -> Weekend
    // 2026-12-28 is Monday -> Business Day
    expect(isPolishHoliday('2026-12-24')).toBe(true);
    expect(isPolishHoliday('2026-12-25')).toBe(true);
    expect(isPolishHoliday('2026-12-26')).toBe(true);

    const nextFromWed = nextBusinessDay('2026-12-23');
    expect(getWarsawDateString(nextFromWed)).toBe('2026-12-28');
  });
});
