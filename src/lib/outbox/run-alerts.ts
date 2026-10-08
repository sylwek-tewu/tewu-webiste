/**
 * Rate-limited alerts about a whole outbox run (missing key, recurring store errors), so a
 * persistent problem is reported without a Telegram message every 10 minutes.
 */

import { eq } from 'drizzle-orm';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { getDb, schema } from '@/db';
import type { OutboxStore } from './types';

export const RUN_ALERT_INTERVAL_MS = 6 * 60 * 60 * 1000;

function isOutboxStore(candidate: unknown): candidate is OutboxStore {
  return (
    candidate !== null &&
    typeof candidate === 'object' &&
    'getMeta' in candidate &&
    typeof (candidate as OutboxStore).getMeta === 'function'
  );
}

/** Last alert times sent by this process; covers a database that cannot be read or written. */
const lastAlertInMemory = new Map<string, string>();

/** The later of two ISO timestamps; an unreadable one counts as missing. */
function latest(a: string | null, b: string | null): string | null {
  const ta = a ? Date.parse(a) : NaN;
  const tb = b ? Date.parse(b) : NaN;
  if (Number.isNaN(ta)) return Number.isNaN(tb) ? null : b;
  if (Number.isNaN(tb)) return a;
  return ta >= tb ? a : b;
}

/** For tests: forgets the in-memory fallback. */
export function resetRunAlertMemory(): void {
  lastAlertInMemory.clear();
}

export function shouldSendRunAlert(lastAlertAt: string | null, now: Date): boolean {
  if (!lastAlertAt) return true;
  const last = Date.parse(lastAlertAt);
  return Number.isNaN(last) || now.getTime() - last >= RUN_ALERT_INTERVAL_MS;
}

export async function getLastAlertAt(
  key: string,
  storeOrDb?: OutboxStore | BetterSQLite3Database<typeof schema>
): Promise<string | null> {
  if (isOutboxStore(storeOrDb)) {
    return await storeOrDb.getMeta(key);
  }
  const targetDb = storeOrDb || getDb();
  const rows = await targetDb
    .select({ value: schema.outboxMeta.value })
    .from(schema.outboxMeta)
    .where(eq(schema.outboxMeta.key, key))
    .limit(1);

  return rows.length > 0 ? rows[0].value : null;
}

export async function setLastAlertAt(
  key: string,
  timestamp: string,
  storeOrDb?: OutboxStore | BetterSQLite3Database<typeof schema>
): Promise<void> {
  if (isOutboxStore(storeOrDb)) {
    await storeOrDb.setMeta(key, timestamp);
    return;
  }
  const targetDb = storeOrDb || getDb();
  await targetDb
    .insert(schema.outboxMeta)
    .values({
      key,
      value: timestamp,
      updatedAt: timestamp,
    })
    .onConflictDoUpdate({
      target: schema.outboxMeta.key,
      set: {
        value: timestamp,
        updatedAt: timestamp,
      },
    });
}

/** Sends `text` unless an alert with the same key went out within RUN_ALERT_INTERVAL_MS. */
export async function sendRateLimitedRunAlert(
  key: string,
  text: string,
  send: (text: string) => Promise<boolean>,
  now: Date = new Date(),
  storeOrDb?: OutboxStore | BetterSQLite3Database<typeof schema>
): Promise<void> {
  let storedAt: string | null = null;
  try {
    storedAt = await getLastAlertAt(key, storeOrDb);
  } catch (err) {
    console.error('[RunAlerts] Failed to query alert meta from SQLite:', err);
  }
  // A broken database is often what the alert is about: unreadable, or readable but not writable
  // (full disk, read-only volume), which leaves a stale stored time. The later of the stored time
  // and this process's memory wins, so the alert still goes out at most once per interval.
  const lastAlertAt = latest(storedAt, lastAlertInMemory.get(key) ?? null);

  if (!shouldSendRunAlert(lastAlertAt, now)) return;

  if (await send(text)) {
    lastAlertInMemory.set(key, now.toISOString());
    try {
      await setLastAlertAt(key, now.toISOString(), storeOrDb);
    } catch (err) {
      console.error('[RunAlerts] Failed to update alert meta in SQLite:', err);
    }
  }
}
