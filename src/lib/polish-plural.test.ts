import { describe, it, expect } from 'vitest';
import { formatHoursPl } from './polish-plural';

describe('formatHoursPl', () => {
  it.each([
    [1, '1 godzina'],
    [2, '2 godziny'],
    [4, '4 godziny'],
    [5, '5 godzin'],
    [12, '12 godzin'],
    [14, '14 godzin'],
    [22, '22 godziny'],
    [48, '48 godzin'],
    [72, '72 godziny'],
    [112, '112 godzin'],
  ])('%i -> %s', (n, expected) => {
    expect(formatHoursPl(n)).toBe(expected);
  });
});
