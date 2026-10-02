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
  startHour: number; // e.g. 8
  startMinute: number;
  endHour: number; // e.g. 12
  endMinute: number;
  timeRangeLabel: string; // '8:00–12:00'
  note?: string; // Optional helper text
}

export const CALLBACK_SLOTS: CallbackSlotConfig[] = [
  {
    id: 'asap',
    label: 'Jak najszybciej',
    startHour: 8,
    startMinute: 0,
    endHour: 16,
    endMinute: 0,
    timeRangeLabel: '8:00–16:00',
  },
  {
    id: '8-12',
    label: '8:00–12:00',
    startHour: 8,
    startMinute: 0,
    endHour: 12,
    endMinute: 0,
    timeRangeLabel: '8:00–12:00',
  },
  {
    id: '12-16',
    label: '12:00–16:00',
    startHour: 12,
    startMinute: 0,
    endHour: 16,
    endMinute: 0,
    timeRangeLabel: '12:00–16:00',
  },
  {
    id: '17-18',
    label: '17:00–18:00',
    startHour: 17,
    startMinute: 0,
    endHour: 18,
    endMinute: 0,
    timeRangeLabel: '17:00–18:00',
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
