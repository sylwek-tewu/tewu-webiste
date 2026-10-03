import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shouldSendRunAlert, RUN_ALERT_INTERVAL_MS, sendRateLimitedRunAlert, resetRunAlertMemory } from './run-alerts';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { initDb, schema } from '@/db';

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

describe('sendRateLimitedRunAlert when the database is unavailable', () => {
  beforeEach(() => {
    resetRunAlertMemory();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('still alerts at most once per interval', async () => {
    // A closed connection makes every read and write throw, as with an unreadable volume
    const sqlite = new Database(':memory:');
    const brokenDb = drizzle(sqlite, { schema });
    sqlite.close();
    const send = vi.fn().mockResolvedValue(true);
    const now = new Date('2026-10-05T12:00:00Z');

    await sendRateLimitedRunAlert('db-down', 'Run failed', send, now, brokenDb);
    await sendRateLimitedRunAlert('db-down', 'Run failed', send, new Date(now.getTime() + 10 * 60 * 1000), brokenDb);
    expect(send).toHaveBeenCalledTimes(1);

    await sendRateLimitedRunAlert('db-down', 'Run failed', send, new Date(now.getTime() + RUN_ALERT_INTERVAL_MS), brokenDb);
    expect(send).toHaveBeenCalledTimes(2);
  });
});
