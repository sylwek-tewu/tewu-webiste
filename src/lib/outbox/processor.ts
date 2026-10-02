/**
 * Outbox retry processor.
 * Processes buffered callback requests, retries email sending with growing backoff,
 * and cleans up expired or unreadable records.
 */

import { OutboxRecord, OutboxStore, ProcessResult } from './types';
import { CorruptRecordError } from './crypto';

export const DEFAULT_OUTBOX_TTL_HOURS = 72;

const BASE_RETRY_DELAY_MS = 10 * 60 * 1000;
const MAX_RETRY_DELAY_MS = 2 * 60 * 60 * 1000;
// The cron fires every 10 min but not to the second; don't skip a run that is a little early.
const SCHEDULE_TOLERANCE_MS = 60 * 1000;

export interface ProcessOutboxOptions {
  ttlHours?: number;
  now?: Date;
  onExpire?: (record: OutboxRecord) => Promise<void> | void;
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
  };

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
        await options.onCorrupt(id);
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
        await options.onExpire(record);
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

  for (const id of ids) {
    try {
      await processRecord(id);
    } catch (error) {
      // Transient store error (network, Blobs 5xx): keep the record for the next run.
      console.error(
        `[Outbox] Store error for #${id}:`,
        error instanceof Error ? error.message : 'Unknown'
      );
      result.errors++;
    }
  }

  return result;
}
