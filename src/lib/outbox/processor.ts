/**
 * Outbox retry processor.
 * Processes buffered callback requests, retries email sending with growing backoff,
 * and cleans up expired or unreadable records.
 */

import { OutboxRecord, OutboxStore, ProcessResult } from './types';

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

/** Reads CALLBACK_OUTBOX_TTL_HOURS; invalid or non-positive values fall back to the default. */
export function getOutboxTtlHours(): number {
  const parsed = Number(process.env.CALLBACK_OUTBOX_TTL_HOURS);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_OUTBOX_TTL_HOURS;
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
  };

  for (const id of ids) {
    let record: OutboxRecord | null;
    try {
      record = await store.get(id);
    } catch {
      // Unreadable (e.g. the encryption key changed): it can never be delivered, so drop it.
      await store.delete(id);
      result.corrupt++;
      if (options.onCorrupt) {
        await options.onCorrupt(id);
      }
      continue;
    }
    if (!record) continue;

    const ageMs = now.getTime() - new Date(record.createdAt).getTime();

    // Check TTL expiration
    if (ageMs > ttlMs) {
      await store.delete(record.id);
      result.expired++;
      if (options.onExpire) {
        await options.onExpire(record);
      }
      continue;
    }

    if (!isDue(record, now)) {
      result.skipped++;
      continue;
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

  return result;
}
