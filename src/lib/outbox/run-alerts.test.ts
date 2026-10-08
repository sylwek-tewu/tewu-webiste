import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shouldSendRunAlert, RUN_ALERT_INTERVAL_MS, sendRateLimitedRunAlert, resetRunAlertMemory } from './run-alerts';
import type { OutboxStore } from './types';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { initDb, resetDbInstance, schema } from '@/db';

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
    resetRunAlertMemory();
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

describe('sendRateLimitedRunAlert with OutboxStore', () => {
  it('uses store.getMeta and store.setMeta for rate limiting', async () => {
    resetRunAlertMemory();
    const metaMap = new Map<string, string>();
    const mockStore: OutboxStore = {
      put: vi.fn(),
      claim: vi.fn(),
      get: vi.fn(),
      listIds: vi.fn(),
      delete: vi.fn(),
      getMeta: vi.fn(async (key: string) => metaMap.get(key) ?? null),
      setMeta: vi.fn(async (key: string, value: string) => {
        metaMap.set(key, value);
      }),
    };

    const send = vi.fn().mockResolvedValue(true);
    const now = new Date('2026-10-05T12:00:00Z');

    // First alert sends and stores in meta
    await sendRateLimitedRunAlert('store-alert', 'Store alert 1', send, now, mockStore);
    expect(send).toHaveBeenCalledTimes(1);
    expect(mockStore.getMeta).toHaveBeenCalledWith('store-alert');
    expect(mockStore.setMeta).toHaveBeenCalledWith('store-alert', now.toISOString());

    // Second alert 1 hour later is suppressed
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    await sendRateLimitedRunAlert('store-alert', 'Store alert 2', send, oneHourLater, mockStore);
    expect(send).toHaveBeenCalledTimes(1);

    // Third alert 7 hours later sends
    const sevenHoursLater = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    await sendRateLimitedRunAlert('store-alert', 'Store alert 3', send, sevenHoursLater, mockStore);
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

  it('still alerts at most once per interval when the database is readable but not writable', async () => {
    // Full disk or a volume remounted read-only: reads return a stale time, every write fails
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'run-alerts-'));
    const file = path.join(dir, 'outbox.db');
    const now = new Date('2026-10-05T12:00:00Z');
    const stale = new Date(now.getTime() - 2 * RUN_ALERT_INTERVAL_MS).toISOString();
    const writable = initDb({ path: file, setAsDefault: true });
    await writable.insert(schema.outboxMeta).values({ key: 'store-errors', value: stale, updatedAt: stale });
    resetDbInstance(); // closes the writable connection
    const sqlite = new Database(file, { readonly: true });
    const readOnlyDb = drizzle(sqlite, { schema });
    const send = vi.fn().mockResolvedValue(true);

    try {
      for (let run = 0; run < 4; run++) {
        const at = new Date(now.getTime() + run * 10 * 60 * 1000);
        await sendRateLimitedRunAlert('store-errors', 'Store errors', send, at, readOnlyDb);
      }
      expect(send).toHaveBeenCalledOnce();
    } finally {
      sqlite.close();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
