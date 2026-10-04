import { describe, it, expect } from 'vitest';
import { plTranslations, ukTranslations } from '.';
import { CALLBACK_SLOTS, CALLBACK_TOPICS } from '@/lib/callback/types';
import { CALLBACK_SLOT_WINDOWS, formatClockTime } from '@/lib/calendar';
import { COMPANY_FULL_NAME, CONTACT_DETAILS } from '@/constants';

/** Every key path with the type of its value, arrays by length. */
function shape(value: unknown, path = ''): string[] {
  if (Array.isArray(value)) return [`${path}[${value.length}]`, ...value.flatMap((v, i) => shape(v, `${path}[${i}]`))];
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => shape(v, path ? `${path}.${k}` : k));
  }
  return [`${path}:${typeof value}`];
}

describe('dictionaries', () => {
  it('have the same keys in Polish and Ukrainian', () => {
    // Only the Ukrainian policy needs the "Polish original is binding" note
    const ukOnly = 'privacyPolicy.legalNoteUk:string';
    expect(shape(ukTranslations).filter((key) => key !== ukOnly)).toEqual(shape(plTranslations));
  });

  it.each([plTranslations, ukTranslations])('label every callback slot and topic ($locale)', (t) => {
    for (const slot of CALLBACK_SLOTS) expect(t.callbackWidget.slots[slot.id]).toBeTruthy();
    for (const topic of CALLBACK_TOPICS) expect(t.callbackWidget.topics[topic.id]).toBeTruthy();
  });

  it.each([plTranslations, ukTranslations])('show the hours of each fixed slot ($locale)', (t) => {
    for (const slot of ['8-12', '12-16', '17-18'] as const) {
      const { startMinutes, endMinutes } = CALLBACK_SLOT_WINDOWS[slot];
      expect(t.callbackWidget.slots[slot]).toContain(formatClockTime(startMinutes));
      expect(t.callbackWidget.slots[slot]).toContain(formatClockTime(endMinutes));
    }
  });

  it.each([plTranslations, ukTranslations])('take the company name, address and e-mail from constants ($locale)', (t) => {
    expect(t.privacyPolicy.s1Content).toContain(`**${COMPANY_FULL_NAME}**`);
    expect(t.privacyPolicy.s1Content).toContain(CONTACT_DETAILS.address);
    expect(t.privacyPolicy.s6Contact).toContain(CONTACT_DETAILS.email);
  });

  it.each([
    [1, '1 година'],
    [2, '2 години'],
    [4, '4 години'],
    [5, '5 годин'],
    [11, '11 годин'],
    [12, '12 годин'],
    [21, '21 година'],
    [22, '22 години'],
    [48, '48 годин'],
    [72, '72 години'],
  ])('state a %i h retention in Ukrainian as "%s"', (hours, text) => {
    expect(ukTranslations.privacyPolicy.s5Retention(hours)).toContain(`**${text}**`);
    expect(ukTranslations.privacyPolicy.s4BufferDesc(hours)).toContain(text);
  });

  it('state the retention in Polish with the Polish plural', () => {
    expect(plTranslations.privacyPolicy.s5Retention(48)).toContain('**48 godzin**');
    expect(plTranslations.privacyPolicy.s4BufferDesc(72)).toContain('72 godziny');
  });
});
