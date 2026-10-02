/**
 * Outbox retry processor.
 * Processes buffered callback requests, retries email sending, and cleans up expired records.
 */

import { OutboxRecord, OutboxStore, ProcessResult } from './types';

export const DEFAULT_OUTBOX_TTL_HOURS = 72;

export interface ProcessOutboxOptions {
  ttlHours?: number;
  now?: Date;
  onExpire?: (record: OutboxRecord) => Promise<void> | void;
}

export async function processOutbox(
  store: OutboxStore,
  sendEmail: (record: OutboxRecord) => Promise<boolean>,
  options: ProcessOutboxOptions = {}
): Promise<ProcessResult> {
  const ttlHours = options.ttlHours ?? parseInt(process.env.CALLBACK_OUTBOX_TTL_HOURS || String(DEFAULT_OUTBOX_TTL_HOURS), 10);
  const now = options.now ?? new Date();
  const ttlMs = ttlHours * 60 * 60 * 1000;

  const records = await store.list();
  const result: ProcessResult = {
    processed: records.length,
    succeeded: 0,
    failed: 0,
    expired: 0,
  };

  for (const record of records) {
    const createdTime = new Date(record.createdAt).getTime();
    const ageMs = now.getTime() - createdTime;

    // Check TTL expiration
    if (ageMs > ttlMs) {
      await store.delete(record.id);
      result.expired++;
      if (options.onExpire) {
        await options.onExpire(record);
      }
      continue;
    }

    // Attempt email delivery
    try {
      const success = await sendEmail(record);
      if (success) {
        await store.delete(record.id);
        result.succeeded++;
      } else {
        record.attempts = (record.attempts || 0) + 1;
        record.lastAttemptAt = now.toISOString();
        await store.put(record);
        result.failed++;
      }
    } catch {
      record.attempts = (record.attempts || 0) + 1;
      record.lastAttemptAt = now.toISOString();
      await store.put(record);
      result.failed++;
    }
  }

  return result;
}
