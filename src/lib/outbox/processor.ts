/**
 * Outbox retry processor.
 * Processes buffered callback requests, retries email sending with growing backoff,
 * and cleans up expired or unreadable records.
 */

import { OutboxRecord, OutboxStore, ProcessResult } from './types';
import { CorruptRecordError, OutboxKeyMissingError } from './crypto';

export const DEFAULT_OUTBOX_TTL_HOURS = 72;

const BASE_RETRY_DELAY_MS = 10 * 60 * 1000;
const MAX_RETRY_DELAY_MS = 2 * 60 * 60 * 1000;
// The cron fires every 10 min but not to the second; don't skip a run that is a little early.
const SCHEDULE_TOLERANCE_MS = 60 * 1000;

export interface ProcessOutboxOptions {
  ttlHours?: number;
  now?: Date;
  onExpire?: (record: Pick<OutboxRecord, 'id' | 'createdAt'>) => Promise<void> | void;
  onCorrupt?: (id: string) => Promise<void> | void;
}

/** Reads CALLBACK_OUTBOX_TTL_HOURS; anything but a positive whole number falls back to the default. */
export function getOutboxTtlHours(): number {
  const parsed = Number(process.env.CALLBACK_OUTBOX_TTL_HOURS);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_OUTBOX_TTL_HOURS;
}

/** Wait after the given number of attempts: 10, 20, 40, 80 min, then every 2 h. */
export function getRetryDelayMs(attempts: number): number {
  return Math.min(BASE_RETRY_DELAY_MS * 2 ** Math.max(attempts - 1, 0), MAX_RETRY_DELAY_MS);
}

function isDue(record: OutboxRecord, now: Date): boolean {
  if (!record.lastAttemptAt) return true;
  const sinceLast = now.getTime() - new Date(record.lastAttemptAt).getTime();
  return sinceLast >= getRetryDelayMs(record.attempts) - SCHEDULE_TOLERANCE_MS;
}

export async function processOutbox(
  store: OutboxStore,
  sendEmail: (record: OutboxRecord) => Promise<boolean>,
  options: ProcessOutboxOptions = {}
): Promise<ProcessResult> {
  const ttlHours = options.ttlHours ?? getOutboxTtlHours();
  const now = options.now ?? new Date();
  const ttlMs = ttlHours * 60 * 60 * 1000;

  const ids = await store.listIds();
  const result: ProcessResult = {
    processed: ids.length,
    succeeded: 0,
    failed: 0,
    expired: 0,
    skipped: 0,
    corrupt: 0,
    errors: 0,
    keyMissing: false,
  };

  // Alerts run after the record was already deleted; their failure is not a store error.
  async function notify(callback: () => Promise<void> | void, id: string): Promise<void> {
    try {
      await callback();
    } catch (error) {
      console.error(`[Outbox] Alert failed for #${id}:`, error instanceof Error ? error.message : 'Unknown');
    }
  }

  async function processRecord(id: string): Promise<void> {
    let record: OutboxRecord | null;
    try {
      record = await store.get(id);
    } catch (error) {
      if (!(error instanceof CorruptRecordError)) throw error;
      // Can never be decrypted (e.g. the encryption key changed), so it can never be delivered.
      await store.delete(id);
      result.corrupt++;
      if (options.onCorrupt) {
        const onCorrupt = options.onCorrupt;
        await notify(() => onCorrupt(id), id);
      }
      return;
    }
    if (!record) return;

    const ageMs = now.getTime() - new Date(record.createdAt).getTime();

    // Check TTL expiration
    if (ageMs > ttlMs) {
      await store.delete(record.id);
      result.expired++;
      if (options.onExpire) {
        const onExpire = options.onExpire;
        const expired = record;
        await notify(() => onExpire(expired), id);
      }
      return;
    }

    if (!isDue(record, now)) {
      result.skipped++;
      return;
    }

    // Attempt email delivery
    let success: boolean;
    try {
      success = await sendEmail(record);
    } catch {
      success = false;
    }

    if (success) {
      await store.delete(record.id);
      result.succeeded++;
    } else {
      record.attempts = (record.attempts || 0) + 1;
      record.lastAttemptAt = now.toISOString();
      await store.put(record);
      result.failed++;
    }
  }

  async function expireUnreadable(id: string, createdAt: string | undefined): Promise<void> {
    if (!createdAt || now.getTime() - new Date(createdAt).getTime() <= ttlMs) return;
    try {
      await store.delete(id);
    } catch (error) {
      console.error(`[Outbox] Store error for #${id}:`, error instanceof Error ? error.message : 'Unknown');
      result.errors++;
      return;
    }
    result.expired++;
    if (options.onExpire) {
      const onExpire = options.onExpire;
      await notify(() => onExpire({ id, createdAt }), id);
    }
  }

  for (const id of ids) {
    try {
      await processRecord(id);
    } catch (error) {
      if (error instanceof OutboxKeyMissingError) {
        // Config problem: nothing can be delivered until the key is back, so records are kept,
        // except those past the retention period, which the privacy policy promises to delete.
        result.keyMissing = true;
        await expireUnreadable(id, error.createdAt);
        continue;
      }
      // Transient store error (I/O, database busy): keep the record for the next run.
      console.error(
        `[Outbox] Store error for #${id}:`,
        error instanceof Error ? error.message : 'Unknown'
      );
      result.errors++;
    }
  }

  return result;
}
