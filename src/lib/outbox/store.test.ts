import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { getOutboxStore, resetOutboxStore, MemoryOutboxStore, SqliteOutboxStore } from './store';
import { CorruptRecordError } from './crypto';
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
});

describe('MemoryOutboxStore', () => {
  it('lists record ids', async () => {
    const store = new MemoryOutboxStore();
    await store.put({
      id: 'A1',
      phone: '+48501482555',
      slot: 'asap',
      source: 'header',
      createdAt: new Date().toISOString(),
      attempts: 1,
    });
    expect(await store.listIds()).toEqual(['A1']);
  });
});

describe('SqliteOutboxStore', () => {
  let testDb: ReturnType<typeof initDb>;

  beforeEach(() => {
    testDb = initDb({ path: ':memory:' });
  });

  afterEach(() => {
    resetDbInstance();
  });

  const valid = {
    id: 'C9F1A2',
    phone: '+48501482555',
    slot: 'asap',
    source: 'header',
    createdAt: '2026-10-05T10:00:00.000Z',
    attempts: 1,
  };

  it('returns a stored record and encrypts phone at rest', async () => {
    process.env.OUTBOX_ENCRYPTION_KEY = 'test-encryption-key-for-unit-tests';
    const store = new SqliteOutboxStore(testDb);
    await store.put(valid);

    const record = await store.get('C9F1A2');
    expect(record).toEqual(valid);

    // Verify phone is NOT plaintext in the raw database
    const rawRows = await testDb.select().from(schema.outboxRecords);
    expect(rawRows[0].phone).not.toEqual('+48501482555');
  });

  it('updates existing record on duplicate put', async () => {
    const store = new SqliteOutboxStore(testDb);
    await store.put(valid);
    await store.put({ ...valid, attempts: 2 });

    const updated = await store.get('C9F1A2');
    expect(updated?.attempts).toBe(2);

    const ids = await store.listIds();
    expect(ids).toEqual(['C9F1A2']);
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

  it('reports a record with an invalid date as corrupt', async () => {
    const store = new SqliteOutboxStore(testDb);
    await testDb.insert(schema.outboxRecords).values({
      id: 'CORRUPT',
      phone: 'some-phone',
      slot: 'asap',
      source: 'header',
      createdAt: 'invalid-date',
      attempts: 1,
    });

    await expect(store.get('CORRUPT')).rejects.toBeInstanceOf(CorruptRecordError);
  });
});
