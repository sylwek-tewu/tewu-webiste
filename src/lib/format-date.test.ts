import { describe, it, expect } from 'vitest';
import { formatLongDate } from './format-date';

describe('formatLongDate', () => {
  it('writes the day, the month in the genitive and the year', () => {
    expect(formatLongDate('pl', '2026-10-15')).toBe('15 października 2026 r.');
    expect(formatLongDate('uk', '2026-10-15')).toBe('15 жовтня 2026 р.');
  });

  it('drops the leading zero of the day', () => {
    expect(formatLongDate('pl', '2027-01-05')).toBe('5 stycznia 2027 r.');
  });
});
