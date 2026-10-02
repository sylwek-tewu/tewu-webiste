/**
 * Types ported from https://github.com/mtk3d/poland-public-holidays (commit 4ad14bc536051155a81b25b3cda7e76ecf41cfaa)
 * Copyright 2021 Kamil Szydlowski (MIT License)
 */

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
