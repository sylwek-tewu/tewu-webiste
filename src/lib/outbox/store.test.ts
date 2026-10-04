import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { eq } from 'drizzle-orm';
import { getOutboxStore, resetOutboxStore, MemoryOutboxStore, SqliteOutboxStore } from './store';
import type { OutboxRecord } from './types';
import type { CallbackSlot } from '@/lib/callback/types';
import { CorruptRecordError, OutboxKeyMissingError } from './crypto';
import { initDb, schema, resetDbInstance } from '@/db';

describe('getOutboxStore', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetOutboxStore();
    resetDbInstance();
  });

  it('uses the in-memory store when OUTBOX_STORE=memory or in default test env', () => {
    expect(getOutboxStore()).toBeInstanceOf(MemoryOutboxStore);
  });

  it('uses SqliteOutboxStore in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    resetOutboxStore();
    expect(getOutboxStore()).toBeInstanceOf(SqliteOutboxStore);
  });

  it('ignores OUTBOX_STORE=memory in production', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('OUTBOX_STORE', 'memory');
    resetOutboxStore();
    expect(getOutboxStore()).toBeInstanceOf(SqliteOutboxStore);
  });
});

describe('MemoryOutboxStore', () => {
  beforeEach(() => {
    vi.stubEnv('OUTBOX_ENCRYPTION_KEY', 'test-key-memory-outbox');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('lists record ids', async () => {
    const store = new MemoryOutboxStore();
    await store.put({
      id: 'A1',
      phone: '+48501482555',
      slot: 'asap',
      source: 'header',
      locale: 'pl',
      createdAt: new Date().toISOString(),
      attempts: 1,
    });
    expect(await store.listIds()).toEqual(['A1']);
  });

  it('defaults attempts and lastAttemptAt when omitted in put', async () => {
    const store = new MemoryOutboxStore();
    const createdAt = '2026-10-05T10:00:00.000Z';
    await store.put({
      id: 'DEF1',
      phone: '+48501482555',
      slot: 'asap',
      source: 'header',
      locale: 'pl',
      createdAt,
    });
    const record = await store.get('DEF1');
    expect(record).toEqual({
      id: 'DEF1',
      phone: '+48501482555',
      slot: 'asap',
      source: 'header',
      locale: 'pl',
      createdAt,
      attempts: 1,
      lastAttemptAt: createdAt,
    });
  });

  it('preserves attempts and lastAttemptAt when provided in put', async () => {
    const store = new MemoryOutboxStore();
    const createdAt = '2026-10-05T10:00:00.000Z';
    const lastAttemptAt = '2026-10-05T10:05:00.000Z';
    await store.put({
      id: 'PRES1',
      phone: '+48501482555',
      slot: 'asap',
      source: 'header',
      locale: 'pl',
      createdAt,
      attempts: 3,
      lastAttemptAt,
    });
    const record = await store.get('PRES1');
    expect(record?.attempts).toBe(3);
    expect(record?.lastAttemptAt).toBe(lastAttemptAt);
  });

  it('reports an unreadable record by the reason it cannot be read', async () => {
    const store = new MemoryOutboxStore();
    const createdAt = '2026-10-05T10:00:00.000Z';
    await store.put({ id: 'R1', phone: '+48501482555', slot: 'asap', source: 'header', locale: 'pl', createdAt });

    vi.stubEnv('OUTBOX_ENCRYPTION_KEY', '');
    await expect(store.get('R1')).rejects.toEqual(new OutboxKeyMissingError(createdAt));
    vi.stubEnv('OUTBOX_ENCRYPTION_KEY', 'different-key-now');
    await expect(store.get('R1')).rejects.toBeInstanceOf(CorruptRecordError);
  });

  describe('metadata storage (getMeta / setMeta)', () => {
    it('returns null for unknown key', async () => {
      const store = new MemoryOutboxStore();
      expect(await store.getMeta('unknown-key')).toBeNull();
    });

    it('stores, retrieves, and updates metadata', async () => {
      const store = new MemoryOutboxStore();
      await store.setMeta('lock', 'active');
      expect(await store.getMeta('lock')).toBe('active');

      await store.setMeta('lock', 'released');
      expect(await store.getMeta('lock')).toBe('released');
    });

    it('clears metadata on clear()', async () => {
      const store = new MemoryOutboxStore();
      await store.setMeta('k1', 'v1');
      store.clear();
      expect(await store.getMeta('k1')).toBeNull();
    });
  });
});

describe('SqliteOutboxStore', () => {
  let testDb: ReturnType<typeof initDb>;

  beforeEach(() => {
    vi.stubEnv('OUTBOX_ENCRYPTION_KEY', 'test-encryption-key-for-unit-tests');
    testDb = initDb({ path: ':memory:' });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetDbInstance();
  });

  const valid: OutboxRecord = {
    id: 'C9F1A2',
    phone: '+48501482555',
    slot: 'asap',
    source: 'header',
    locale: 'pl',
    createdAt: '2026-10-05T10:00:00.000Z',
    attempts: 1,
  };

  it('returns a stored record and encrypts phone at rest', async () => {
    const store = new SqliteOutboxStore(testDb);
    await store.put(valid);

    const record = await store.get('C9F1A2');
    expect(record).toEqual(valid);

    // Verify phone is NOT plaintext in the raw database
    const rawRows = await testDb.select().from(schema.outboxRecords);
    expect(rawRows[0].phone).not.toEqual('+48501482555');
  });

  it('rejects a duplicate put instead of overwriting the pending record', async () => {
    const store = new SqliteOutboxStore(testDb);
    await store.put(valid);

    await expect(store.put({ ...valid, phone: '+48602235736' })).rejects.toThrow();
    expect((await store.get('C9F1A2'))?.phone).toBe(valid.phone);
  });

  it('claims a record once per attempt count', async () => {
    const store = new SqliteOutboxStore(testDb);
    await store.put(valid);
    const at = '2026-10-05T10:10:00.000Z';

    expect(await store.claim('C9F1A2', 1, at)).toBe(true);
    // A second run that read the same record (attempts: 1) loses the claim
    expect(await store.claim('C9F1A2', 1, at)).toBe(false);

    const claimed = await store.get('C9F1A2');
    expect(claimed?.attempts).toBe(2);
    expect(claimed?.lastAttemptAt).toBe(at);
  });

  it('does not re-create a deleted record when claiming it', async () => {
    const store = new SqliteOutboxStore(testDb);
    await store.put(valid);
    await store.delete('C9F1A2');

    expect(await store.claim('C9F1A2', 1, '2026-10-05T10:10:00.000Z')).toBe(false);
    expect(await store.listIds()).toEqual([]);
  });

  it('returns null for a missing record', async () => {
    const store = new SqliteOutboxStore(testDb);
    expect(await store.get('C9F1A2')).toBeNull();
  });

  it('lists record ids and deletes records', async () => {
    const store = new SqliteOutboxStore(testDb);
    await store.put(valid);
    await store.put({ ...valid, id: 'D8E2B1' });

    expect(await store.listIds()).toEqual(['C9F1A2', 'D8E2B1']);

    await store.delete('C9F1A2');
    expect(await store.listIds()).toEqual(['D8E2B1']);
    expect(await store.get('C9F1A2')).toBeNull();
  });

  it('leaves no trace of a deleted record in the database files', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'outbox-store-'));
    const file = path.join(dir, 'outbox.db');
    try {
      const fileDb = initDb({ path: file, setAsDefault: true });
      const store = new SqliteOutboxStore(fileDb);
      // slot is stored in plain text, so it is easy to look for in the raw bytes
      const marker = 'TRACE-MARKER-7f3a';
      await store.put({ ...valid, slot: marker as CallbackSlot });
      await store.delete(valid.id);

      for (const name of fs.readdirSync(dir)) {
        expect(fs.readFileSync(path.join(dir, name)).includes(marker), name).toBe(false);
      }
    } finally {
      resetDbInstance();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('reports a record with an invalid date as corrupt', async () => {
    const store = new SqliteOutboxStore(testDb);
    await testDb.insert(schema.outboxRecords).values({
      id: 'CORRUPT',
      phone: 'some-phone',
      slot: 'asap',
      source: 'header',
      locale: 'pl',
      createdAt: 'invalid-date',
      attempts: 1,
    });

    await expect(store.get('CORRUPT')).rejects.toBeInstanceOf(CorruptRecordError);
  });

  describe('defaults and locale handling', () => {
    it('defaults attempts and lastAttemptAt when omitted in put', async () => {
      const store = new SqliteOutboxStore(testDb);
      const createdAt = '2026-10-05T10:00:00.000Z';
      await store.put({
        id: 'SQL_DEF1',
        phone: '+48501482555',
        slot: 'asap',
        source: 'header',
        locale: 'pl',
        createdAt,
      });
      const record = await store.get('SQL_DEF1');
      expect(record).toEqual({
        id: 'SQL_DEF1',
        phone: '+48501482555',
        slot: 'asap',
        source: 'header',
        locale: 'pl',
        createdAt,
        attempts: 1,
        lastAttemptAt: createdAt,
      });
    });

    it('rejects a row without a locale', () => {
      expect(() =>
        testDb
          .insert(schema.outboxRecords)
          .values({
            id: 'NOLOC',
            phone: '+48501482555',
            slot: 'asap',
            source: 'header',
            locale: null as unknown as string,
            createdAt: '2026-10-05T10:00:00.000Z',
            attempts: 1,
          })
          .run()
      ).toThrow(/NOT NULL constraint failed: outbox_records\.locale/);
    });

    it('preserves explicit locale', async () => {
      const store = new SqliteOutboxStore(testDb);
      await store.put({
        id: 'UKLOC',
        phone: '+48501482555',
        slot: 'asap',
        source: 'header',
        locale: 'uk',
        createdAt: '2026-10-05T10:00:00.000Z',
      });
      const record = await store.get('UKLOC');
      expect(record?.locale).toBe('uk');
    });

    it('preserves attempts and lastAttemptAt when provided in put', async () => {
      const store = new SqliteOutboxStore(testDb);
      const createdAt = '2026-10-05T10:00:00.000Z';
      const lastAttemptAt = '2026-10-05T10:15:00.000Z';
      await store.put({
        id: 'PRES_SQL',
        phone: '+48501482555',
        slot: 'asap',
        source: 'header',
        locale: 'pl',
        createdAt,
        attempts: 4,
        lastAttemptAt,
      });
      const record = await store.get('PRES_SQL');
      expect(record?.attempts).toBe(4);
      expect(record?.lastAttemptAt).toBe(lastAttemptAt);
    });
  });

  it('reports an unreadable record by the reason it cannot be read', async () => {
    const store = new SqliteOutboxStore(testDb);
    await store.put(valid);

    // createdAt is kept in plain text, so a record waiting for the key can still expire
    vi.stubEnv('OUTBOX_ENCRYPTION_KEY', '');
    const keyMissing = store.get(valid.id);
    await expect(keyMissing).rejects.toBeInstanceOf(OutboxKeyMissingError);
    await expect(keyMissing).rejects.toMatchObject({ createdAt: valid.createdAt });
    vi.stubEnv('OUTBOX_ENCRYPTION_KEY', 'wrong-key-completely');
    await expect(store.get(valid.id)).rejects.toBeInstanceOf(CorruptRecordError);
  });

  describe('metadata storage (getMeta / setMeta)', () => {
    it('returns null for unknown key', async () => {
      const store = new SqliteOutboxStore(testDb);
      expect(await store.getMeta('nonexistent')).toBeNull();
    });

    it('stores, retrieves, and updates metadata in outboxMeta table', async () => {
      const store = new SqliteOutboxStore(testDb);
      await store.setMeta('last_alert', '2026-10-05T12:00:00.000Z');
      expect(await store.getMeta('last_alert')).toBe('2026-10-05T12:00:00.000Z');

      // Verify row in schema.outboxMeta directly
      const rows = await testDb.select().from(schema.outboxMeta).where(eq(schema.outboxMeta.key, 'last_alert'));
      expect(rows).toHaveLength(1);
      expect(rows[0].value).toBe('2026-10-05T12:00:00.000Z');
      expect(rows[0].updatedAt).toBeDefined();

      // Upsert / update
      await store.setMeta('last_alert', '2026-10-05T13:00:00.000Z');
      expect(await store.getMeta('last_alert')).toBe('2026-10-05T13:00:00.000Z');
      const updatedRows = await testDb.select().from(schema.outboxMeta).where(eq(schema.outboxMeta.key, 'last_alert'));
      expect(updatedRows).toHaveLength(1);
      expect(updatedRows[0].value).toBe('2026-10-05T13:00:00.000Z');
    });
  });
});
