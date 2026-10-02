import { describe, it, expect } from 'vitest';
import { getSubmitDelayMs, MIN_FILL_TIME_MS } from './time-trap';

describe('getSubmitDelayMs', () => {
  it('holds a fast submission for the rest of the minimum fill time', () => {
    expect(getSubmitDelayMs(500)).toBe(MIN_FILL_TIME_MS - 500);
  });

  it('does not delay submissions that already took long enough', () => {
    expect(getSubmitDelayMs(MIN_FILL_TIME_MS)).toBe(0);
    expect(getSubmitDelayMs(60_000)).toBe(0);
  });
});
