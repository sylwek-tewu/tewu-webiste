import { CALLBACK_SLOT_WINDOWS, formatClockTime } from '@/lib/calendar';
import type { Locale } from '@/i18n/types';
import type { ServicePageSlug } from '@/lib/service-pages';

export type { Locale };

export type CallbackSlot = 'asap' | '8-12' | '12-16' | '17-18';

export type CallbackTopic =
  | 'spolka'
  | 'fundacja'
  | 'dzialalnosc'
  | 'kadry-place'
  | 'inne';

export interface CallbackSlotConfig {
  id: CallbackSlot;
  label: string;
  timeRangeLabel: string; // '8:00–12:00'
  note?: string; // Optional helper text
}

function timeRangeLabel(slot: CallbackSlot): string {
  const { startMinutes, endMinutes } = CALLBACK_SLOT_WINDOWS[slot];
  return `${formatClockTime(startMinutes)}–${formatClockTime(endMinutes)}`;
}

/** The slots in form order, named in Polish for the office's notifications; the hours come from the calendar. */
export const CALLBACK_SLOTS: CallbackSlotConfig[] = [
  { id: 'asap', label: 'Jak najszybciej', timeRangeLabel: timeRangeLabel('asap') },
  { id: '8-12', label: timeRangeLabel('8-12'), timeRangeLabel: timeRangeLabel('8-12') },
  { id: '12-16', label: timeRangeLabel('12-16'), timeRangeLabel: timeRangeLabel('12-16') },
  {
    id: '17-18',
    label: timeRangeLabel('17-18'),
    timeRangeLabel: timeRangeLabel('17-18'),
    note: 'Dyżur telefoniczny po standardowych godzinach pracy biura',
  },
];

export const CALLBACK_TOPICS: { id: CallbackTopic; label: string }[] = [
  { id: 'spolka', label: 'Spółka z o.o. / partnerska / komandytowa' },
  { id: 'fundacja', label: 'Fundacja lub stowarzyszenie' },
  { id: 'dzialalnosc', label: 'Jednoosobowa działalność gospodarcza (JDG)' },
  { id: 'kadry-place', label: 'Kadry i płace' },
  { id: 'inne', label: 'Inne zapytanie' },
];

/** Where the widget was opened from. Anything else is recorded as 'unknown'. */
export const CALLBACK_SOURCES = ['header', 'floating', 'contact', 'hero', 'service'] as const;

export type CallbackSource = (typeof CALLBACK_SOURCES)[number];

export function toKnownSource(value: unknown): CallbackSource | 'unknown' {
  return (CALLBACK_SOURCES as readonly unknown[]).includes(value) ? (value as CallbackSource) : 'unknown';
}

/**
 * Stable error codes returned by POST /api/callback next to the Polish `error` message,
 * so the form can show its own text in the visitor's language.
 */
export type CallbackErrorCode =
  | 'invalid_request'
  | 'phone_required'
  | 'phone_invalid'
  | 'slot_invalid'
  | 'unavailable'
  | 'delivery_failed'
  | 'unexpected';

export interface CallbackLead {
  id: string; // 6 uppercase hex characters, e.g. 'A1B2C3'
  phone: string; // E.164 normalized, e.g. '+48501482555'
  slot: CallbackSlot;
  topic?: CallbackTopic | '';
  source: CallbackSource | 'unknown';
  locale: Locale;
  /** The service page the widget was opened on, if any. */
  landingPage?: ServicePageSlug;
  createdAt: string; // ISO 8601
}
