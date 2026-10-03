import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shouldSendRunAlert, RUN_ALERT_INTERVAL_MS, sendRateLimitedRunAlert } from './run-alerts';
import { initDb } from '@/db';

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

describe('sendRateLimitedRunAlert with SQLite', () => {
  let testDb: ReturnType<typeof initDb>;

  beforeEach(() => {
    testDb = initDb({ path: ':memory:' });
  });

  it('sends alert on first run and suppresses subsequent alerts within interval', async () => {
    const send = vi.fn().mockResolvedValue(true);
    const now = new Date('2026-10-05T12:00:00Z');

    // First alert should send
    await sendRateLimitedRunAlert('test-key', 'First alert', send, now, testDb);
    expect(send).toHaveBeenCalledTimes(1);

    // Second alert 1 hour later should be suppressed
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    await sendRateLimitedRunAlert('test-key', 'Second alert', send, oneHourLater, testDb);
    expect(send).toHaveBeenCalledTimes(1);

    // Third alert 7 hours later (after RUN_ALERT_INTERVAL_MS) should send
    const sevenHoursLater = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    await sendRateLimitedRunAlert('test-key', 'Third alert', send, sevenHoursLater, testDb);
    expect(send).toHaveBeenCalledTimes(2);
  });
});
