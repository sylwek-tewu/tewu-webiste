import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  isOfficeOpen,
  isBusinessDay,
  nextBusinessDay,
  getCallbackCommitment,
  getHolidaysInYear,
  getHolidayOnDate,
  isPolishHoliday,
  getExtraClosedDates,
  getWarsawDateString,
  getWarsawDateParts,
  createWarsawDate,
  isWeekend,
  POLISH_HOLIDAYS_RULES,
  CallbackCommitment,
} from './index';

describe('Calendar & Office Hours Module', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_EXTRA_CLOSED_DATES;
    vi.restoreAllMocks();
  });

  describe('isOfficeOpen', () => {
    it('returns true during office hours (8:00–16:00 Warsaw) on regular business days', () => {
      // Monday 2026-10-05 08:00 CEST (UTC+2)
      expect(isOfficeOpen(new Date('2026-10-05T08:00:00+02:00'))).toBe(true);
      // Monday 2026-10-05 12:30 CEST
      expect(isOfficeOpen(new Date('2026-10-05T12:30:00+02:00'))).toBe(true);
      // Monday 2026-10-05 15:59 CEST
      expect(isOfficeOpen(new Date('2026-10-05T15:59:00+02:00'))).toBe(true);
    });

    it('returns false outside office hours on regular business days', () => {
      // Monday 07:59 CEST
      expect(isOfficeOpen(new Date('2026-10-05T07:59:00+02:00'))).toBe(false);
      // Monday 16:00 CEST
      expect(isOfficeOpen(new Date('2026-10-05T16:00:00+02:00'))).toBe(false);
      // Monday 20:00 CEST
      expect(isOfficeOpen(new Date('2026-10-05T20:00:00+02:00'))).toBe(false);
      // Monday 00:01 CEST
      expect(isOfficeOpen(new Date('2026-10-05T00:01:00+02:00'))).toBe(false);
    });

    it('returns false on weekends regardless of hour', () => {
      // Saturday 12:00
      expect(isOfficeOpen(new Date('2026-10-10T12:00:00+02:00'))).toBe(false);
      // Sunday 10:00
      expect(isOfficeOpen(new Date('2026-10-11T10:00:00+02:00'))).toBe(false);
    });

    it('returns false on statutory Polish holidays even on weekdays between 8:00 and 16:00', () => {
      // 2026-01-01 (New Year - Thursday) 10:00 Warsaw (UTC+1)
      expect(isOfficeOpen(new Date('2026-01-01T10:00:00+01:00'))).toBe(false);
      // 2026-01-06 (Three Kings - Tuesday) 12:00 Warsaw
      expect(isOfficeOpen(new Date('2026-01-06T12:00:00+01:00'))).toBe(false);
      // 2026-04-06 (Easter Monday - Monday) 11:00 Warsaw
      expect(isOfficeOpen(new Date('2026-04-06T11:00:00+02:00'))).toBe(false);
      // 2026-05-01 (Labour Day - Friday) 09:00 Warsaw
      expect(isOfficeOpen(new Date('2026-05-01T09:00:00+02:00'))).toBe(false);
      // 2026-06-04 (Corpus Christi - Thursday) 14:00 Warsaw
      expect(isOfficeOpen(new Date('2026-06-04T14:00:00+02:00'))).toBe(false);
      // 2026-11-11 (Independence Day - Wednesday) 13:00 Warsaw
      expect(isOfficeOpen(new Date('2026-11-11T13:00:00+01:00'))).toBe(false);
      // 2026-12-24 (Christmas Eve - Thursday) 10:00 Warsaw
      expect(isOfficeOpen(new Date('2026-12-24T10:00:00+01:00'))).toBe(false);
      // 2026-12-25 (Christmas - Friday) 12:00 Warsaw
      expect(isOfficeOpen(new Date('2026-12-25T12:00:00+01:00'))).toBe(false);
    });

    it('returns false on NEXT_PUBLIC_EXTRA_CLOSED_DATES', () => {
      process.env.NEXT_PUBLIC_EXTRA_CLOSED_DATES = '2026-10-07';
      // Wednesday 10:00
      expect(isOfficeOpen(new Date('2026-10-07T10:00:00+02:00'))).toBe(false);
    });

    it('handles DST transitions properly (winter CET vs summer CEST)', () => {
      // Winter time (CET, UTC+1) in late October: 2026-10-26
      expect(isOfficeOpen(new Date('2026-10-26T07:59:00+01:00'))).toBe(false);
      expect(isOfficeOpen(new Date('2026-10-26T08:00:00+01:00'))).toBe(true);
      expect(isOfficeOpen(new Date('2026-10-26T15:59:00+01:00'))).toBe(true);
      expect(isOfficeOpen(new Date('2026-10-26T16:00:00+01:00'))).toBe(false);

      // Summer time (CEST, UTC+2) in late March: 2026-03-30
      expect(isOfficeOpen(new Date('2026-03-30T07:59:00+02:00'))).toBe(false);
      expect(isOfficeOpen(new Date('2026-03-30T08:00:00+02:00'))).toBe(true);
      expect(isOfficeOpen(new Date('2026-03-30T15:59:00+02:00'))).toBe(true);
      expect(isOfficeOpen(new Date('2026-03-30T16:00:00+02:00'))).toBe(false);
    });

    it('defaults to current time if no argument is passed', () => {
      // Should execute without errors and return boolean
      const result = isOfficeOpen();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Statutory Polish Holidays & Rules', () => {
    it('contains all 14 statutory holiday rules including Wigilia', () => {
      expect(POLISH_HOLIDAYS_RULES.length).toBe(14);
      const wigilia = POLISH_HOLIDAYS_RULES.find((r) => r.namePL === 'Wigilia Bożego Narodzenia');
      expect(wigilia).toBeDefined();
      expect(wigilia?.type).toBe('fixed');
    });

    it('accurately calculates holidays for 2026, 2027, and 2028', () => {
      // 2026
      const h2026 = getHolidaysInYear(2026);
      const find2026 = (namePL: string) => h2026.find((h) => h.namePL === namePL)?.date;
      expect(find2026('Nowy Rok')).toBe('2026-01-01');
      expect(find2026('Święto Trzech Króli')).toBe('2026-01-06');
      expect(find2026('Niedziela Wielkanocna')).toBe('2026-04-05');
      expect(find2026('Poniedziałek Wielkanocny')).toBe('2026-04-06');
      expect(find2026('Święto Pracy')).toBe('2026-05-01');
      expect(find2026('Narodowe Święto Konstytucji Trzeciego Maja')).toBe('2026-05-03');
      expect(find2026('Zielone Świątki')).toBe('2026-05-24');
      expect(find2026('Boże Ciało')).toBe('2026-06-04');
      expect(find2026('Wniebowzięcie Najświętszej Maryi Panny')).toBe('2026-08-15');
      expect(find2026('Wszystkich Świętych')).toBe('2026-11-01');
      expect(find2026('Narodowe Święto Niepodległości')).toBe('2026-11-11');
      expect(find2026('Wigilia Bożego Narodzenia')).toBe('2026-12-24');
      expect(find2026('Boże Narodzenie')).toBe('2026-12-25');
      expect(find2026('Boże Narodzenie - drugi dzień')).toBe('2026-12-26');

      // 2027
      const h2027 = getHolidaysInYear(2027);
      const find2027 = (namePL: string) => h2027.find((h) => h.namePL === namePL)?.date;
      expect(find2027('Niedziela Wielkanocna')).toBe('2027-03-28');
      expect(find2027('Poniedziałek Wielkanocny')).toBe('2027-03-29');
      expect(find2027('Boże Ciało')).toBe('2027-05-27');

      // 2028
      const h2028 = getHolidaysInYear(2028);
      const find2028 = (namePL: string) => h2028.find((h) => h.namePL === namePL)?.date;
      expect(find2028('Niedziela Wielkanocna')).toBe('2028-04-16');
      expect(find2028('Poniedziałek Wielkanocny')).toBe('2028-04-17');
      expect(find2028('Boże Ciało')).toBe('2028-06-15');
    });

    it('identifies holidays and non-holidays correctly via isPolishHoliday and getHolidayOnDate', () => {
      expect(isPolishHoliday('2026-01-01')).toBe(true);
      expect(getHolidayOnDate('2026-01-01')?.namePL).toBe('Nowy Rok');

      expect(isPolishHoliday('2026-12-24')).toBe(true);
      expect(getHolidayOnDate('2026-12-24')?.namePL).toBe('Wigilia Bożego Narodzenia');

      expect(isPolishHoliday('2026-05-02')).toBe(false);
      expect(getHolidayOnDate('2026-05-02')).toBeUndefined();
    });
  });

  describe('Business Day Calculations & Extra Closed Dates', () => {
    it('identifies business days correctly', () => {
      expect(isBusinessDay('2026-10-05')).toBe(true); // Regular Monday
      expect(isBusinessDay('2026-10-10')).toBe(false); // Saturday
      expect(isBusinessDay('2026-10-11')).toBe(false); // Sunday
      expect(isBusinessDay('2026-11-11')).toBe(false); // Statutory Holiday (Wednesday)
    });

    it('supports NEXT_PUBLIC_EXTRA_CLOSED_DATES environment variable', () => {
      process.env.NEXT_PUBLIC_EXTRA_CLOSED_DATES = '2026-05-02, 2026-12-31';
      const closed = getExtraClosedDates();
      expect(closed).toContain('2026-05-02');
      expect(closed).toContain('2026-12-31');

      // 2026-12-31 is Thursday, normally a business day
      expect(isBusinessDay('2026-12-31')).toBe(false);
    });

    it('supports explicit extraClosedOverride parameter', () => {
      expect(isBusinessDay('2026-10-05', ['2026-10-05'])).toBe(false);
      expect(isBusinessDay('2026-10-06', ['2026-10-05'])).toBe(true);
    });

    it('calculates nextBusinessDay across weekends, holidays, and bridges', () => {
      // Thursday 2026-10-01 -> Friday 2026-10-02 08:00 Warsaw
      const nextFri = nextBusinessDay('2026-10-01');
      expect(getWarsawDateString(nextFri)).toBe('2026-10-02');

      // Friday 2026-10-02 -> Monday 2026-10-05 08:00 Warsaw
      const nextMon = nextBusinessDay('2026-10-02');
      expect(getWarsawDateString(nextMon)).toBe('2026-10-05');

      // Saturday 2026-10-03 -> Monday 2026-10-05
      const fromSat = nextBusinessDay('2026-10-03');
      expect(getWarsawDateString(fromSat)).toBe('2026-10-05');

      // Thursday before Easter (2026-04-02): Good Friday is a business day in Poland -> 2026-04-03
      expect(getWarsawDateString(nextBusinessDay('2026-04-02'))).toBe('2026-04-03');

      // Good Friday 2026-04-03 -> Next business day skips Easter Sunday (04-05) and Easter Monday (04-06) -> Tuesday 2026-04-07
      expect(getWarsawDateString(nextBusinessDay('2026-04-03'))).toBe('2026-04-07');

      // Long weekend with extra closed date: Thursday 2026-04-30, 05-01 is holiday, 05-02 Saturday, 05-03 holiday Sunday -> Monday 2026-05-04
      expect(getWarsawDateString(nextBusinessDay('2026-04-30'))).toBe('2026-05-04');
    });

    it('defaults nextBusinessDay() dateInput to current time when omitted', () => {
      const result = nextBusinessDay();
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('getCallbackCommitment', () => {
    describe('asap slot', () => {
      it('calculates commitment during office hours (officeState: open)', () => {
        // Wednesday 10:30 Warsaw
        const now = new Date('2026-10-07T10:30:00+02:00');
        const commitment: CallbackCommitment = getCallbackCommitment('asap', now);

        expect(commitment).toEqual({
          slot: 'asap',
          officeState: 'open',
          withinOfficeHours: true,
          isToday: true,
          isTomorrow: false,
          targetDate: createWarsawDate('2026-10-07', 8, 0),
        });
      });

      it('calculates commitment before office hours on business day (officeState: before_hours)', () => {
        // Wednesday 07:30 Warsaw
        const now = new Date('2026-10-07T07:30:00+02:00');
        const commitment = getCallbackCommitment('asap', now);

        expect(commitment).toEqual({
          slot: 'asap',
          officeState: 'before_hours',
          withinOfficeHours: false,
          isToday: true,
          isTomorrow: false,
          targetDate: createWarsawDate('2026-10-07', 8, 0),
        });
      });

      it('calculates commitment after office hours on business day (officeState: after_hours, target is tomorrow)', () => {
        // Wednesday 16:30 Warsaw -> target is Thursday 2026-10-08
        const now = new Date('2026-10-07T16:30:00+02:00');
        const commitment = getCallbackCommitment('asap', now);

        expect(commitment).toEqual({
          slot: 'asap',
          officeState: 'after_hours',
          withinOfficeHours: false,
          isToday: false,
          isTomorrow: true,
          targetDate: createWarsawDate('2026-10-08', 8, 0),
        });
      });

      it('calculates commitment after office hours on Friday (officeState: after_hours, target is next Monday)', () => {
        // Friday 2026-10-09 16:30 Warsaw -> next business day is Monday 2026-10-12
        const now = new Date('2026-10-09T16:30:00+02:00');
        const commitment = getCallbackCommitment('asap', now);

        expect(commitment).toEqual({
          slot: 'asap',
          officeState: 'after_hours',
          withinOfficeHours: false,
          isToday: false,
          isTomorrow: false,
          targetDate: createWarsawDate('2026-10-12', 8, 0),
        });
      });

      it('calculates commitment on Saturday (officeState: closed_day, target is Monday)', () => {
        // Saturday 2026-10-10 14:00 Warsaw
        const now = new Date('2026-10-10T14:00:00+02:00');
        const commitment = getCallbackCommitment('asap', now);

        expect(commitment).toEqual({
          slot: 'asap',
          officeState: 'closed_day',
          withinOfficeHours: false,
          isToday: false,
          isTomorrow: false, // Target is Monday, not tomorrow (Sunday)
          targetDate: createWarsawDate('2026-10-12', 8, 0),
        });
      });

      it('calculates commitment on Sunday (officeState: closed_day, target is tomorrow Monday)', () => {
        // Sunday 2026-10-11 14:00 Warsaw -> target is Monday 2026-10-12 (tomorrow!)
        const now = new Date('2026-10-11T14:00:00+02:00');
        const commitment = getCallbackCommitment('asap', now);

        expect(commitment).toEqual({
          slot: 'asap',
          officeState: 'closed_day',
          withinOfficeHours: false,
          isToday: false,
          isTomorrow: true,
          targetDate: createWarsawDate('2026-10-12', 8, 0),
        });
      });

      it('calculates commitment on a holiday weekday (officeState: closed_day)', () => {
        // Wednesday 2026-11-11 10:00 Warsaw (Independence Day) -> target Thursday 2026-11-12
        const now = new Date('2026-11-11T10:00:00+01:00');
        const commitment = getCallbackCommitment('asap', now);

        expect(commitment).toEqual({
          slot: 'asap',
          officeState: 'closed_day',
          withinOfficeHours: false,
          isToday: false,
          isTomorrow: true,
          targetDate: createWarsawDate('2026-11-12', 8, 0),
        });
      });
    });

    describe('fixed slots (8-12, 12-16, 17-18) and 15-minute buffer', () => {
      it('slot 8-12: fulfills today if before 11:45, defers to tomorrow if at or after 11:45', () => {
        // Wednesday 11:44 -> isToday: true
        const wed1144 = new Date('2026-10-07T11:44:00+02:00');
        const commit1144 = getCallbackCommitment('8-12', wed1144);
        expect(commit1144.isToday).toBe(true);
        expect(commit1144.isTomorrow).toBe(false);
        expect(commit1144.officeState).toBe('open');
        expect(getWarsawDateString(commit1144.targetDate)).toBe('2026-10-07');

        // Wednesday 11:45 -> isToday: false, isTomorrow: true
        const wed1145 = new Date('2026-10-07T11:45:00+02:00');
        const commit1145 = getCallbackCommitment('8-12', wed1145);
        expect(commit1145.isToday).toBe(false);
        expect(commit1145.isTomorrow).toBe(true);
        expect(commit1145.officeState).toBe('open');
        expect(getWarsawDateString(commit1145.targetDate)).toBe('2026-10-08');
      });

      it('slot 12-16: fulfills today if before 15:45, defers to tomorrow if at or after 15:45', () => {
        // Wednesday 15:44 -> isToday: true
        const wed1544 = new Date('2026-10-07T15:44:00+02:00');
        const commit1544 = getCallbackCommitment('12-16', wed1544);
        expect(commit1544.isToday).toBe(true);
        expect(commit1544.isTomorrow).toBe(false);
        expect(commit1544.officeState).toBe('open');
        expect(getWarsawDateString(commit1544.targetDate)).toBe('2026-10-07');

        // Wednesday 15:45 -> isToday: false, isTomorrow: true
        const wed1545 = new Date('2026-10-07T15:45:00+02:00');
        const commit1545 = getCallbackCommitment('12-16', wed1545);
        expect(commit1545.isToday).toBe(false);
        expect(commit1545.isTomorrow).toBe(true);
        expect(commit1545.officeState).toBe('open');
        expect(getWarsawDateString(commit1545.targetDate)).toBe('2026-10-08');
      });

      it('slot 17-18: fulfills today after office closes if before 17:45 cutoff', () => {
        // Wednesday 16:30 -> office closed (after_hours), but slot 17-18 is tonight!
        const wed1630 = new Date('2026-10-07T16:30:00+02:00');
        const commit1630 = getCallbackCommitment('17-18', wed1630);
        expect(commit1630.isToday).toBe(true);
        expect(commit1630.isTomorrow).toBe(false);
        expect(commit1630.officeState).toBe('after_hours');
        expect(commit1630.withinOfficeHours).toBe(false);
        expect(getWarsawDateString(commit1630.targetDate)).toBe('2026-10-07');

        // Friday 17:45 -> at cutoff, defers to Monday!
        const fri1745 = new Date('2026-10-09T17:45:00+02:00');
        const commit1745 = getCallbackCommitment('17-18', fri1745);
        expect(commit1745.isToday).toBe(false);
        expect(commit1745.isTomorrow).toBe(false);
        expect(commit1745.officeState).toBe('after_hours');
        expect(getWarsawDateString(commit1745.targetDate)).toBe('2026-10-12');
      });

      it('fixed slot on closed day (weekend) defers to next business day', () => {
        // Saturday 10:00 -> defers to Monday
        const sat = new Date('2026-10-10T10:00:00+02:00');
        const commitSat = getCallbackCommitment('8-12', sat);
        expect(commitSat.isToday).toBe(false);
        expect(commitSat.isTomorrow).toBe(false);
        expect(commitSat.officeState).toBe('closed_day');
        expect(getWarsawDateString(commitSat.targetDate)).toBe('2026-10-12');
      });

      it('targets the start of the slot window on the day of the call', () => {
        const wed1000 = new Date('2026-10-07T10:00:00+02:00');
        expect(getCallbackCommitment('12-16', wed1000).targetDate).toEqual(createWarsawDate('2026-10-07', 12, 0));
        expect(getCallbackCommitment('17-18', wed1000).targetDate).toEqual(createWarsawDate('2026-10-07', 17, 0));
        // Past the 17:45 cutoff: Thursday at 17:00
        const wed1750 = new Date('2026-10-07T17:50:00+02:00');
        expect(getCallbackCommitment('17-18', wed1750).targetDate).toEqual(createWarsawDate('2026-10-08', 17, 0));
      });
    });

    it('defaults nowInput to current time when omitted', () => {
      const commitment = getCallbackCommitment('asap');
      expect(commitment).toHaveProperty('isToday');
      expect(commitment).toHaveProperty('isTomorrow');
      expect(commitment).toHaveProperty('targetDate');
      expect(commitment).toHaveProperty('slot', 'asap');
      expect(commitment).toHaveProperty('withinOfficeHours');
      expect(commitment).toHaveProperty('officeState');
    });
  });

  describe('Timezone & Date Helpers', () => {
    it('getWarsawDateParts and getWarsawDateString return correct values', () => {
      const parts = getWarsawDateParts('2026-10-05T01:00:00+02:00');
      expect(parts).toEqual({ year: 2026, month: 10, day: 5 });

      const dateStr = getWarsawDateString(new Date('2026-10-05T01:00:00+02:00'));
      expect(dateStr).toBe('2026-10-05');
    });

    it('isWeekend identifies Saturday and Sunday in Warsaw', () => {
      expect(isWeekend('2026-10-09')).toBe(false); // Friday
      expect(isWeekend('2026-10-10')).toBe(true);  // Saturday
      expect(isWeekend('2026-10-11')).toBe(true);  // Sunday
      expect(isWeekend('2026-10-12')).toBe(false); // Monday
    });
  });
});
