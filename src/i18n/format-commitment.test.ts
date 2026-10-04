import { describe, it, expect } from 'vitest';
import { formatCallbackCommitment } from './format-commitment';
import { plTranslations } from './pl';
import { ukTranslations } from './uk';
import type { CallbackCommitment } from '@/lib/calendar';
import { createWarsawDate } from '@/lib/calendar';

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
