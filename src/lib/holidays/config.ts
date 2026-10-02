/**
 * Holiday definitions and custom closed dates configuration.
 * Ported from https://github.com/mtk3d/poland-public-holidays (commit 4ad14bc536051155a81b25b3cda7e76ecf41cfaa)
 * Copyright 2021 Kamil Szydlowski (MIT License)
 */

import { FixedHoliday, MovableHoliday } from './types';

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

/**
 * Custom closed dates for TEWU office (e.g. long weekend bridges, New Year's Eve, vacations).
 * Format: 'YYYY-MM-DD'.
 * Examples:
 * - '2026-05-02' (long May weekend bridge)
 * - '2026-12-31' (New Year's Eve)
 */
export const EXTRA_CLOSED_DATES: string[] = [];

/**
 * Returns the effective list of extra closed dates, combining the static configuration
 * and the EXTRA_CLOSED_DATES environment variable (comma-separated 'YYYY-MM-DD').
 */
export function getExtraClosedDates(overrideList?: string[]): string[] {
  if (overrideList) {
    return overrideList;
  }
  const envDates = process.env.EXTRA_CLOSED_DATES
    ? process.env.EXTRA_CLOSED_DATES.split(',')
        .map((s) => s.trim())
        .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s))
    : [];

  return Array.from(new Set([...EXTRA_CLOSED_DATES, ...envDates]));
}
