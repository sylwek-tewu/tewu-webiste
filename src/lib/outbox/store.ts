/**
 * Outbox Store abstraction.
 * Implements production SQLite store (via Drizzle ORM and better-sqlite3)
 * and in-memory store for dev/testing.
 */

import { and, eq, asc, sql } from 'drizzle-orm';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { getDb, schema } from '@/db';
import { OutboxRecord, OutboxStore } from './types';
import { encryptPhone, decryptPhone, CorruptRecordError, OutboxKeyMissingError } from './crypto';

/**
 * Turns a stored value back into a record with a decrypted phone. Anything that can never be
 * delivered (broken JSON, missing phone, invalid date) is a CorruptRecordError, so the processor
 * removes it instead of retrying it forever past the retention period.
 */
export function reviveRecord(raw: unknown): OutboxRecord {
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
  try {
    return { ...(record as OutboxRecord), phone: decryptPhone(record.phone) };
  } catch (error) {
    // createdAt is stored in plain text, so the processor can still expire the record
    if (error instanceof OutboxKeyMissingError) throw new OutboxKeyMissingError(record.createdAt);
    throw error;
  }
}

export class MemoryOutboxStore implements OutboxStore {
  private records = new Map<string, OutboxRecord>();

  async put(record: OutboxRecord): Promise<void> {
    if (this.records.has(record.id)) throw new Error(`Outbox record #${record.id} already exists`);
    const atRest = { ...record, phone: encryptPhone(record.phone) };
    this.records.set(record.id, atRest);
  }

  async claim(id: string, attempts: number, at: string): Promise<boolean> {
    const raw = this.records.get(id);
    if (!raw || raw.attempts !== attempts) return false;
    this.records.set(id, { ...raw, attempts: attempts + 1, lastAttemptAt: at });
    return true;
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

export class SqliteOutboxStore implements OutboxStore {
  private getDbInstance: () => BetterSQLite3Database<typeof schema>;

  constructor(customDb?: BetterSQLite3Database<typeof schema> | (() => BetterSQLite3Database<typeof schema>)) {
    if (typeof customDb === 'function') {
      this.getDbInstance = customDb;
    } else if (customDb) {
      this.getDbInstance = () => customDb;
    } else {
      this.getDbInstance = () => getDb();
    }
  }

  private get db(): BetterSQLite3Database<typeof schema> {
    return this.getDbInstance();
  }

  async put(record: OutboxRecord): Promise<void> {
    const encryptedPhone = encryptPhone(record.phone);
    await this.db
      .insert(schema.outboxRecords)
      .values({
        id: record.id,
        phone: encryptedPhone,
        slot: record.slot,
        topic: record.topic || null,
        source: record.source,
        locale: record.locale || null,
        createdAt: record.createdAt,
        attempts: record.attempts,
        lastAttemptAt: record.lastAttemptAt || null,
      });
  }

  async claim(id: string, attempts: number, at: string): Promise<boolean> {
    const result = await this.db
      .update(schema.outboxRecords)
      .set({ attempts: attempts + 1, lastAttemptAt: at })
      .where(and(eq(schema.outboxRecords.id, id), eq(schema.outboxRecords.attempts, attempts)));
    return result.changes === 1;
  }

  async get(id: string): Promise<OutboxRecord | null> {
    const rows = await this.db
      .select()
      .from(schema.outboxRecords)
      .where(eq(schema.outboxRecords.id, id))
      .limit(1);

    if (rows.length === 0) return null;
    const row = rows[0];

    return reviveRecord({
      id: row.id,
      phone: row.phone,
      slot: row.slot,
      topic: row.topic ?? undefined,
      source: row.source,
      locale: (row.locale as 'pl' | 'uk') ?? undefined,
      createdAt: row.createdAt,
      attempts: row.attempts,
      lastAttemptAt: row.lastAttemptAt ?? undefined,
    });
  }

  async listIds(): Promise<string[]> {
    const rows = await this.db
      .select({ id: schema.outboxRecords.id })
      .from(schema.outboxRecords)
      .orderBy(asc(schema.outboxRecords.createdAt));
    return rows.map((r) => r.id);
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(schema.outboxRecords)
      .where(eq(schema.outboxRecords.id, id));
    // The WAL still holds the record's old page images until a checkpoint, which at this traffic
    // could take very long; checkpoint now so it is gone from disk (secure_delete zeroes the page).
    // Deletes are rare, so the cost is negligible. Under a concurrent reader it is a no-op, and the
    // next delete or SQLite's own checkpoint finishes the job.
    this.db.run(sql`PRAGMA wal_checkpoint(TRUNCATE)`);
  }
}

// Global in-memory singleton for test environments or explicit memory fallback
let memoryStoreInstance: MemoryOutboxStore | null = null;
let sqliteStoreInstance: SqliteOutboxStore | null = null;

export function getOutboxStore(): OutboxStore {
  // A memory buffer loses every pending request on restart, so production never uses it.
  const memoryRequested = process.env.OUTBOX_STORE === 'memory';
  const isProduction = process.env.NODE_ENV === 'production';
  if (
    (memoryRequested && !isProduction) ||
    (process.env.NODE_ENV === 'test' && process.env.OUTBOX_STORE !== 'sqlite')
  ) {
    if (!memoryStoreInstance) {
      memoryStoreInstance = new MemoryOutboxStore();
    }
    return memoryStoreInstance;
  }

  if (!sqliteStoreInstance) {
    if (memoryRequested) {
      console.error('[Outbox] OUTBOX_STORE=memory is ignored in production; using SQLite.');
    }
    sqliteStoreInstance = new SqliteOutboxStore();
  }
  return sqliteStoreInstance;
}

export function resetOutboxStore(): void {
  memoryStoreInstance = null;
  sqliteStoreInstance = null;
}
