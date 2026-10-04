import { describe, it, expect } from 'vitest';
import { formatCallbackCommitment } from './format-commitment';
import { plTranslations } from './pl';
import { ukTranslations } from './uk';
import type { Locale } from './types';
import type { CallbackCommitment } from '@/lib/calendar';
import { createWarsawDate, getCallbackCommitment } from '@/lib/calendar';
import type { CallbackSlot } from '@/lib/callback/types';

/** The promise the form shows: the calendar's commitment in the locale's words. */
function promise(slot: CallbackSlot, now: Date, locale: Locale = 'pl') {
  const t = locale === 'uk' ? ukTranslations.callbackWidget : plTranslations.callbackWidget;
  return formatCallbackCommitment(getCallbackCommitment(slot, now), t, locale);
}

describe('formatCallbackCommitment', () => {
  const pl = plTranslations.callbackWidget;
  const uk = ukTranslations.callbackWidget;

  describe('Polish locale', () => {
    it('formats asap during office hours (open)', () => {
      const commitment: CallbackCommitment = {
        isToday: true,
        isTomorrow: false,
        targetDate: createWarsawDate('2026-10-07', 8, 0),
        slot: 'asap',
        withinOfficeHours: true,
        officeState: 'open',
      };
      const res = formatCallbackCommitment(commitment, pl, 'pl');
      expect(res.isToday).toBe(true);
      expect(res.message).toBe('Oddzwonimy jak najszybciej, w godzinach pracy biura (pn–pt 8:00–16:00).');
      expect(res.targetDayPhrase).toBeUndefined();
    });

    it('formats asap before office hours (before_hours)', () => {
      const commitment: CallbackCommitment = {
        isToday: true,
        isTomorrow: false,
        targetDate: createWarsawDate('2026-10-07', 8, 0),
        slot: 'asap',
        withinOfficeHours: false,
        officeState: 'before_hours',
      };
      const res = formatCallbackCommitment(commitment, pl, 'pl');
      expect(res.isToday).toBe(true);
      expect(res.message).toBe('Biuro otwiera się o 8:00. Oddzwonimy dziś od 8:00.');
      expect(res.targetDayPhrase).toBeUndefined();
    });

    it('formats asap after hours (after_hours, tomorrow)', () => {
      const commitment: CallbackCommitment = {
        isToday: false,
        isTomorrow: true,
        targetDate: createWarsawDate('2026-10-08', 8, 0),
        slot: 'asap',
        withinOfficeHours: false,
        officeState: 'after_hours',
      };
      const res = formatCallbackCommitment(commitment, pl, 'pl');
      expect(res.isToday).toBe(false);
      expect(res.targetDayPhrase).toBe('jutro');
      expect(res.message).toBe('Biuro jest teraz zamknięte. Oddzwonimy jutro od 8:00.');
    });

    it('formats asap after hours on Friday (after_hours, Monday 12 Oct)', () => {
      const commitment: CallbackCommitment = {
        isToday: false,
        isTomorrow: false,
        targetDate: createWarsawDate('2026-10-12', 8, 0),
        slot: 'asap',
        withinOfficeHours: false,
        officeState: 'after_hours',
      };
      const res = formatCallbackCommitment(commitment, pl, 'pl');
      expect(res.isToday).toBe(false);
      expect(res.targetDayPhrase).toBe('w poniedziałek 12 października');
      expect(res.message).toBe('Biuro jest teraz zamknięte. Oddzwonimy w poniedziałek 12 października od 8:00.');
    });

    it('formats asap on closed day / weekend (closed_day, Monday 12 Oct)', () => {
      const commitment: CallbackCommitment = {
        isToday: false,
        isTomorrow: false,
        targetDate: createWarsawDate('2026-10-12', 8, 0),
        slot: 'asap',
        withinOfficeHours: false,
        officeState: 'closed_day',
      };
      const res = formatCallbackCommitment(commitment, pl, 'pl');
      expect(res.isToday).toBe(false);
      expect(res.targetDayPhrase).toBe('w poniedziałek 12 października');
      expect(res.message).toBe('Biuro jest dziś nieczynne. Oddzwonimy w poniedziałek 12 października od 8:00.');
    });

    it('formats fixed slot 8-12 for today', () => {
      const commitment: CallbackCommitment = {
        isToday: true,
        isTomorrow: false,
        targetDate: createWarsawDate('2026-10-07', 8, 0),
        slot: '8-12',
        withinOfficeHours: true,
        officeState: 'open',
      };
      const res = formatCallbackCommitment(commitment, pl, 'pl');
      expect(res.isToday).toBe(true);
      expect(res.message).toBe('Oddzwonimy dziś w godzinach 8:00–12:00.');
    });

    it('formats fixed slot 8-12 for tomorrow', () => {
      const commitment: CallbackCommitment = {
        isToday: false,
        isTomorrow: true,
        targetDate: createWarsawDate('2026-10-08', 8, 0),
        slot: '8-12',
        withinOfficeHours: true,
        officeState: 'open',
      };
      const res = formatCallbackCommitment(commitment, pl, 'pl');
      expect(res.isToday).toBe(false);
      expect(res.targetDayPhrase).toBe('jutro');
      expect(res.message).toBe('Oddzwonimy jutro w godzinach 8:00–12:00.');
    });

    it('formats fixed slot 17-18 for next business day', () => {
      const commitment: CallbackCommitment = {
        isToday: false,
        isTomorrow: false,
        targetDate: createWarsawDate('2026-10-12', 8, 0),
        slot: '17-18',
        withinOfficeHours: false,
        officeState: 'after_hours',
      };
      const res = formatCallbackCommitment(commitment, pl, 'pl');
      expect(res.isToday).toBe(false);
      expect(res.targetDayPhrase).toBe('w poniedziałek 12 października');
      expect(res.message).toBe(
        'Oddzwonimy w najbliższym dniu roboczym (w poniedziałek 12 października) w godzinach 17:00–18:00.'
      );
    });
  });

  describe('Ukrainian locale', () => {
    it('formats asap during office hours (open)', () => {
      const commitment: CallbackCommitment = {
        isToday: true,
        isTomorrow: false,
        targetDate: createWarsawDate('2026-10-07', 8, 0),
        slot: 'asap',
        withinOfficeHours: true,
        officeState: 'open',
      };
      const res = formatCallbackCommitment(commitment, uk, 'uk');
      expect(res.isToday).toBe(true);
      expect(res.message).toBe('Передзвонимо якомога швидше в робочі години (пн–пт 8:00–16:00 за польським часом).');
    });

    it('formats asap before office hours (before_hours)', () => {
      const commitment: CallbackCommitment = {
        isToday: true,
        isTomorrow: false,
        targetDate: createWarsawDate('2026-10-07', 8, 0),
        slot: 'asap',
        withinOfficeHours: false,
        officeState: 'before_hours',
      };
      const res = formatCallbackCommitment(commitment, uk, 'uk');
      expect(res.isToday).toBe(true);
      expect(res.message).toBe('Офіс відкривається о 8:00. Передзвонимо вам сьогодні з 8:00 (за польським часом).');
    });

    it('formats asap after hours (after_hours, tomorrow)', () => {
      const commitment: CallbackCommitment = {
        isToday: false,
        isTomorrow: true,
        targetDate: createWarsawDate('2026-10-08', 8, 0),
        slot: 'asap',
        withinOfficeHours: false,
        officeState: 'after_hours',
      };
      const res = formatCallbackCommitment(commitment, uk, 'uk');
      expect(res.isToday).toBe(false);
      expect(res.targetDayPhrase).toBe('завтра');
      expect(res.message).toBe('Офіс зараз зачинено. Передзвонимо завтра з 8:00 (за польським часом).');
    });

    it('formats asap on closed day (closed_day, Monday 12 Oct)', () => {
      const commitment: CallbackCommitment = {
        isToday: false,
        isTomorrow: false,
        targetDate: createWarsawDate('2026-10-12', 8, 0),
        slot: 'asap',
        withinOfficeHours: false,
        officeState: 'closed_day',
      };
      const res = formatCallbackCommitment(commitment, uk, 'uk');
      expect(res.isToday).toBe(false);
      expect(res.targetDayPhrase).toBe('в понеділок, 12 жовтня');
      expect(res.message).toBe('Офіс сьогодні зачинено. Передзвонимо в понеділок, 12 жовтня з 8:00 (за польським часом).');
    });

    it('formats slot 8-12 today and tomorrow', () => {
      const todayCommitment: CallbackCommitment = {
        isToday: true,
        isTomorrow: false,
        targetDate: createWarsawDate('2026-10-07', 8, 0),
        slot: '8-12',
        withinOfficeHours: true,
        officeState: 'open',
      };
      const todayRes = formatCallbackCommitment(todayCommitment, uk, 'uk');
      expect(todayRes.isToday).toBe(true);
      expect(todayRes.message).toBe('Передзвонимо сьогодні з 8:00 до 12:00 (за польським часом).');

      const tomorrowCommitment: CallbackCommitment = {
        isToday: false,
        isTomorrow: true,
        targetDate: createWarsawDate('2026-10-08', 8, 0),
        slot: '8-12',
        withinOfficeHours: true,
        officeState: 'open',
      };
      const tomorrowRes = formatCallbackCommitment(tomorrowCommitment, uk, 'uk');
      expect(tomorrowRes.isToday).toBe(false);
      expect(tomorrowRes.targetDayPhrase).toBe('завтра');
      expect(tomorrowRes.message).toBe('Передзвонимо завтра з 8:00 до 12:00 (за польським часом).');
    });

    it('says "у вівторок" (euphony) when target day is Tuesday (7 April)', () => {
      const commitment: CallbackCommitment = {
        isToday: false,
        isTomorrow: false,
        targetDate: createWarsawDate('2026-04-07', 8, 0),
        slot: '12-16',
        withinOfficeHours: false,
        officeState: 'closed_day',
      };
      const res = formatCallbackCommitment(commitment, uk, 'uk');
      expect(res.targetDayPhrase).toBe('у вівторок, 7 квітня');
      expect(res.message).toBe(
        'Передзвонимо в найближчий робочий день (у вівторок, 7 квітня) з 12:00 до 16:00 (за польським часом).'
      );
    });
  });

  describe('ADR 0002 compliance', () => {
    it('ensures Polish dictionary contains no Cyrillic characters', () => {
      const cyrillicRegex = /[\u0400-\u04FF]/;
      const tc = pl.commitment;
      expect(tc.defaultPrep).not.toMatch(cyrillicRegex);
      expect(tc.tomorrow).not.toMatch(cyrillicRegex);
      expect(tc.asapBeforeHours).not.toMatch(cyrillicRegex);
      expect(tc.asapOpen).not.toMatch(cyrillicRegex);
      expect(tc.asapAfterHours('jutro')).not.toMatch(cyrillicRegex);
      expect(tc.asapClosedDay('jutro')).not.toMatch(cyrillicRegex);
      expect(tc.slotToday('8:00–12:00')).not.toMatch(cyrillicRegex);
      tc.daysPrep.forEach((d) => expect(d).not.toMatch(cyrillicRegex));
      tc.monthsGenitive.forEach((m) => expect(m).not.toMatch(cyrillicRegex));
    });

    it('ensures Ukrainian dictionary includes Warsaw timezone note where required', () => {
      const tc = uk.commitment;
      expect(tc.asapBeforeHours).toContain('за польським часом');
      expect(tc.asapOpen).toContain('за польським часом');
      expect(tc.asapAfterHours('завтра')).toContain('за польським часом');
      expect(tc.asapClosedDay('завтра')).toContain('за польським часом');
      expect(tc.slotToday('з 8:00 до 12:00')).toContain('за польським часом');
      expect(tc.slotTomorrow('з 8:00 до 12:00')).toContain('за польським часом');
      expect(tc.slotNextBusinessDay('в понеділок, 12 жовтня', 'з 8:00 до 12:00')).toContain('за польським часом');
    });
  });
});

describe('promise for a slot at a given time (getCallbackCommitment + formatCallbackCommitment)', () => {
  describe('slot: asap', () => {
    it('returns office hours message when open', () => {
      // Wednesday at 10:30
      const wed1030 = new Date('2026-10-07T10:30:00+02:00');
      const res = promise('asap', wed1030);
      expect(res.isToday).toBe(true);
      expect(res.message).toBe('Oddzwonimy jak najszybciej, w godzinach pracy biura (pn–pt 8:00–16:00).');
    });

    it('returns morning message before 8:00 on business days', () => {
      // Wednesday at 07:30
      const wed0730 = new Date('2026-10-07T07:30:00+02:00');
      const res = promise('asap', wed0730);
      expect(res.isToday).toBe(true);
      expect(res.message).toBe('Biuro otwiera się o 8:00. Oddzwonimy dziś od 8:00.');
    });

    it('returns next day message after 16:00 on weekdays', () => {
      // Wednesday at 16:30 -> tomorrow is Thursday
      const wed1630 = new Date('2026-10-07T16:30:00+02:00');
      const res = promise('asap', wed1630);
      expect(res.isToday).toBe(false);
      expect(res.message).toBe('Biuro jest teraz zamknięte. Oddzwonimy jutro od 8:00.');
    });

    it('returns Monday message on Friday after 16:00', () => {
      // Friday at 16:30 -> next is Monday 2026-10-12
      const fri1630 = new Date('2026-10-09T16:30:00+02:00');
      const res = promise('asap', fri1630);
      expect(res.isToday).toBe(false);
      expect(res.message).toContain('w poniedziałek 12 października');
    });

    it('returns closed today message on weekends', () => {
      // Saturday 2026-10-10 at 14:00
      const sat = new Date('2026-10-10T14:00:00+02:00');
      const res = promise('asap', sat);
      expect(res.isToday).toBe(false);
      expect(res.message).toBe('Biuro jest dziś nieczynne. Oddzwonimy w poniedziałek 12 października od 8:00.');
    });
  });

  describe('slot: 8-12, 12-16, 17-18 with 15-minute buffer', () => {
    it('allows today for 8-12 before 11:45 buffer cutoff', () => {
      const wed1144 = new Date('2026-10-07T11:44:00+02:00');
      const res = promise('8-12', wed1144);
      expect(res.isToday).toBe(true);
      expect(res.message).toBe('Oddzwonimy dziś w godzinach 8:00–12:00.');
    });

    it('moves to next day for 8-12 at 11:45 or later', () => {
      const wed1145 = new Date('2026-10-07T11:45:00+02:00');
      const res = promise('8-12', wed1145);
      expect(res.isToday).toBe(false);
      expect(res.message).toBe('Oddzwonimy jutro w godzinach 8:00–12:00.');
    });

    it('allows today for 12-16 before 15:45 buffer cutoff', () => {
      const wed1544 = new Date('2026-10-07T15:44:00+02:00');
      const res = promise('12-16', wed1544);
      expect(res.isToday).toBe(true);
      expect(res.message).toBe('Oddzwonimy dziś w godzinach 12:00–16:00.');
    });

    it('moves to next day for 12-16 at 15:45', () => {
      const wed1545 = new Date('2026-10-07T15:45:00+02:00');
      const res = promise('12-16', wed1545);
      expect(res.isToday).toBe(false);
      expect(res.message).toBe('Oddzwonimy jutro w godzinach 12:00–16:00.');
    });

    it('allows today for 17-18 before 17:45 cutoff (even after office closes at 16:00)', () => {
      // 16:30 on Wednesday
      const wed1630 = new Date('2026-10-07T16:30:00+02:00');
      const res = promise('17-18', wed1630);
      expect(res.isToday).toBe(true);
      expect(res.message).toBe('Oddzwonimy dziś w godzinach 17:00–18:00.');
    });

    it('moves 17-18 to next business day on Friday at 17:45', () => {
      // Friday 2026-10-09 at 17:45
      const fri1745 = new Date('2026-10-09T17:45:00+02:00');
      const res = promise('17-18', fri1745);
      expect(res.isToday).toBe(false);
      expect(res.message).toBe('Oddzwonimy w najbliższym dniu roboczym (w poniedziałek 12 października) w godzinach 17:00–18:00.');
    });
  });

  describe('Ukrainian locale (locale: "uk")', () => {
    it('returns Ukrainian message during office hours with Warsaw timezone note', () => {
      const wed1030 = new Date('2026-10-07T10:30:00+02:00');
      const res = promise('asap', wed1030, 'uk');
      expect(res.isToday).toBe(true);
      expect(res.message).toBe('Передзвонимо якомога швидше в робочі години (пн–пт 8:00–16:00 за польським часом).');
    });

    it('returns Ukrainian morning message before 8:00', () => {
      const wed0730 = new Date('2026-10-07T07:30:00+02:00');
      const res = promise('asap', wed0730, 'uk');
      expect(res.isToday).toBe(true);
      expect(res.message).toBe('Офіс відкривається о 8:00. Передзвонимо вам сьогодні з 8:00 (за польським часом).');
    });

    it('returns Ukrainian tomorrow message after office hours', () => {
      const wed1630 = new Date('2026-10-07T16:30:00+02:00');
      const res = promise('asap', wed1630, 'uk');
      expect(res.isToday).toBe(false);
      expect(res.message).toBe('Офіс зараз зачинено. Передзвонимо завтра з 8:00 (за польським часом).');
    });

    it('returns Ukrainian weekend message with next business day phrase', () => {
      const saturday = new Date('2026-10-10T14:00:00+02:00');
      const res = promise('asap', saturday, 'uk');
      expect(res.isToday).toBe(false);
      expect(res.message).toBe('Офіс сьогодні зачинено. Передзвонимо в понеділок, 12 жовтня з 8:00 (за польським часом).');
    });

    it('returns Ukrainian slot message for today and tomorrow', () => {
      const wed1000 = new Date('2026-10-07T10:00:00+02:00');
      const todayRes = promise('8-12', wed1000, 'uk');
      expect(todayRes.isToday).toBe(true);
      expect(todayRes.message).toBe('Передзвонимо сьогодні з 8:00 до 12:00 (за польським часом).');

      const wed1145 = new Date('2026-10-07T11:45:00+02:00');
      const tomorrowRes = promise('8-12', wed1145, 'uk');
      expect(tomorrowRes.isToday).toBe(false);
      expect(tomorrowRes.message).toBe('Передзвонимо завтра з 8:00 до 12:00 (за польським часом).');
    });

    it('says "у вівторок" (not "в вівторок") when the next working day is a Tuesday', () => {
      // Saturday before Easter Monday 2026 (6 April), so the next working day is Tuesday 7 April
      const easterSaturday = new Date('2026-04-04T12:00:00+02:00');
      const res = promise('12-16', easterSaturday, 'uk');
      expect(res.message).toBe(
        'Передзвонимо в найближчий робочий день (у вівторок, 7 квітня) з 12:00 до 16:00 (за польським часом).'
      );
    });
  });
});

describe('daylight saving time transitions (Europe/Warsaw)', () => {
  // 2026-10-25 (Sun) 03:00 CEST -> 02:00 CET; 2026-03-29 (Sun) 02:00 CET -> 03:00 CEST

  it('promises Monday when submitted on Friday evening before the autumn switch', () => {
    const res = promise('asap', new Date('2026-10-23T17:00:00+02:00'));
    expect(res.message).toBe('Biuro jest teraz zamknięte. Oddzwonimy w poniedziałek 26 października od 8:00.');
  });

  it('promises "jutro" late on the Sunday of the autumn switch (25 hours long)', () => {
    const res = promise('8-12', new Date('2026-10-25T23:30:00+01:00'));
    expect(res.message).toBe('Oddzwonimy jutro w godzinach 8:00–12:00.');
  });

  it('promises "jutro" late on the Sunday of the spring switch (23 hours long)', () => {
    const res = promise('asap', new Date('2026-03-29T23:30:00+02:00'));
    expect(res.message).toBe('Biuro jest dziś nieczynne. Oddzwonimy jutro od 8:00.');
  });
});
