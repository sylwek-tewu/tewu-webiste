/**
 * Outbox Store abstraction.
 * Implements production Netlify Blobs store and in-memory store for dev/testing.
 */

import { getStore } from '@netlify/blobs';
import { OutboxRecord, OutboxStore } from './types';
import { encryptPhone, decryptPhone, CorruptRecordError } from './crypto';

/**
 * Turns a stored value back into a record with a decrypted phone. Anything that can never be
 * delivered (broken JSON, missing phone, invalid date) is a CorruptRecordError, so the processor
 * removes it instead of retrying it forever past the retention period.
 */
function reviveRecord(raw: unknown): OutboxRecord {
  let value = raw;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch (error) {
      throw new CorruptRecordError('Outbox record is not valid JSON', { cause: error });
    }
  }
  const record = value as Partial<OutboxRecord> | null;
  if (
    !record ||
    typeof record !== 'object' ||
    typeof record.id !== 'string' ||
    typeof record.phone !== 'string' ||
    typeof record.createdAt !== 'string' ||
    Number.isNaN(Date.parse(record.createdAt))
  ) {
    throw new CorruptRecordError('Outbox record is missing required fields');
  }
  return { ...(record as OutboxRecord), phone: decryptPhone(record.phone) };
}

export class MemoryOutboxStore implements OutboxStore {
  private records = new Map<string, OutboxRecord>();

  async put(record: OutboxRecord): Promise<void> {
    // Encrypt at rest in memory store too to simulate real persistence
    const atRest = { ...record, phone: encryptPhone(record.phone) };
    this.records.set(record.id, atRest);
  }

  async get(id: string): Promise<OutboxRecord | null> {
    const raw = this.records.get(id);
    if (!raw) return null;
    return reviveRecord(raw);
  }

  async listIds(): Promise<string[]> {
    return Array.from(this.records.keys());
  }

  async delete(id: string): Promise<void> {
    this.records.delete(id);
  }

  clear(): void {
    this.records.clear();
  }
}

export class NetlifyBlobsOutboxStore implements OutboxStore {
  private storeName = 'callback-outbox';

  private getBlobsStore() {
    return getStore({
      name: this.storeName,
      consistency: 'strong',
    });
  }

  async put(record: OutboxRecord): Promise<void> {
    const blobs = this.getBlobsStore();
    const encryptedRecord = {
      ...record,
      phone: encryptPhone(record.phone),
    };
    await blobs.setJSON(record.id, encryptedRecord);
  }

  async get(id: string): Promise<OutboxRecord | null> {
    const blobs = this.getBlobsStore();
    const raw = await blobs.get(id);
    if (raw === null) return null;
    return reviveRecord(raw);
  }

  async listIds(): Promise<string[]> {
    const { blobs: list } = await this.getBlobsStore().list();
    return list.map((item) => item.key);
  }

  async delete(id: string): Promise<void> {
    const blobs = this.getBlobsStore();
    await blobs.delete(id);
  }
}

// Global in-memory singleton for local development / testing
let memoryStoreInstance: MemoryOutboxStore | null = null;

export function getOutboxStore(): OutboxStore {
  // Production always uses Blobs: if its context is missing, writes fail loudly (502 + alert)
  // instead of "buffering" into memory that disappears with the function instance.
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.NETLIFY ||
    process.env.NETLIFY_BLOBS_CONTEXT ||
    process.env.NETLIFY_SITE_ID
  ) {
    return new NetlifyBlobsOutboxStore();
  }

  if (!memoryStoreInstance) {
    memoryStoreInstance = new MemoryOutboxStore();
  }
  return memoryStoreInstance;
}
