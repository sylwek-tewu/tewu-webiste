/**
 * Outbox Store abstraction.
 * Implements production Netlify Blobs store and in-memory store for dev/testing.
 */

import { getStore } from '@netlify/blobs';
import { OutboxRecord, OutboxStore } from './types';
import { encryptPhone, decryptPhone } from './crypto';

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
    return { ...raw, phone: decryptPhone(raw.phone) };
  }

  async list(): Promise<OutboxRecord[]> {
    const list: OutboxRecord[] = [];
    for (const raw of this.records.values()) {
      list.push({ ...raw, phone: decryptPhone(raw.phone) });
    }
    return list;
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
    const raw = await blobs.get(id, { type: 'json' }) as OutboxRecord | null;
    if (!raw) return null;
    return {
      ...raw,
      phone: decryptPhone(raw.phone),
    };
  }

  async list(): Promise<OutboxRecord[]> {
    const blobs = this.getBlobsStore();
    const { blobs: list } = await blobs.list();
    const records: OutboxRecord[] = [];

    for (const item of list) {
      const rec = await this.get(item.key);
      if (rec) {
        records.push(rec);
      }
    }

    return records;
  }

  async delete(id: string): Promise<void> {
    const blobs = this.getBlobsStore();
    await blobs.delete(id);
  }
}

// Global in-memory singleton for local development / testing
let memoryStoreInstance: MemoryOutboxStore | null = null;

export function getOutboxStore(): OutboxStore {
  // If running in Netlify environment with blobs support
  if (process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT || process.env.NETLIFY_SITE_ID) {
    return new NetlifyBlobsOutboxStore();
  }

  if (!memoryStoreInstance) {
    memoryStoreInstance = new MemoryOutboxStore();
  }
  return memoryStoreInstance;
}
