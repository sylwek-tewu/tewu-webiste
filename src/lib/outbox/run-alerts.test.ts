import { describe, it, expect } from 'vitest';
import { shouldSendRunAlert, RUN_ALERT_INTERVAL_MS } from './run-alerts';

describe('shouldSendRunAlert', () => {
  const now = new Date('2026-10-05T12:00:00Z');

  it('alerts when there was no previous alert', () => {
    expect(shouldSendRunAlert(null, now)).toBe(true);
  });

  it('stays quiet within the interval and alerts again after it', () => {
    const justBefore = new Date(now.getTime() - RUN_ALERT_INTERVAL_MS + 1).toISOString();
    const atInterval = new Date(now.getTime() - RUN_ALERT_INTERVAL_MS).toISOString();
    expect(shouldSendRunAlert(justBefore, now)).toBe(false);
    expect(shouldSendRunAlert(atInterval, now)).toBe(true);
  });

  it('alerts when the stored time is unreadable', () => {
    expect(shouldSendRunAlert('garbage', now)).toBe(true);
  });
});
