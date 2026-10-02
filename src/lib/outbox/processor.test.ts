import { describe, it, expect, vi, afterEach } from 'vitest';
import { MemoryOutboxStore } from './store';
import { processOutbox, getOutboxTtlHours, getRetryDelayMs, DEFAULT_OUTBOX_TTL_HOURS } from './processor';
import { OutboxRecord } from './types';

describe('processOutbox', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('deletes record immediately when sendEmail succeeds', () => {
    const store = new MemoryOutboxStore();
    const record: OutboxRecord = {
      id: 'C9F1A2',
      phone: '+48501482555',
      slot: '8-12',
      source: 'header',
      createdAt: new Date().toISOString(),
      attempts: 0,
    };

    return store.put(record).then(() => {
      return processOutbox(store, async () => true).then((res) => {
        expect(res.processed).toBe(1);
        expect(res.succeeded).toBe(1);
        expect(res.failed).toBe(0);

        return store.get('C9F1A2').then((found) => {
          expect(found).toBeNull();
        });
      });
    });
  });

  it('increments attempts when sendEmail fails', () => {
    const store = new MemoryOutboxStore();
    const record: OutboxRecord = {
      id: 'B8L3',
      phone: '+48914824190',
      slot: 'asap',
      source: 'floating',
      createdAt: new Date().toISOString(),
      attempts: 1,
    };

    return store.put(record).then(() => {
      return processOutbox(store, async () => false).then((res) => {
        expect(res.processed).toBe(1);
        expect(res.succeeded).toBe(0);
        expect(res.failed).toBe(1);

        return store.get('B8L3').then((updated) => {
          expect(updated).not.toBeNull();
          expect(updated?.attempts).toBe(2);
          expect(updated?.lastAttemptAt).toBeDefined();
        });
      });
    });
  });

  it('purges records older than TTL (72 hours) and invokes onExpire callback', () => {
    const store = new MemoryOutboxStore();
    const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();

    const expiredRecord: OutboxRecord = {
      id: 'EXP1',
      phone: '+48501482555',
      slot: '17-18',
      source: 'contact',
      createdAt: fourDaysAgo,
      attempts: 5,
    };

    let expiredNotified = false;

    return store.put(expiredRecord).then(() => {
      return processOutbox(store, async () => true, {
        ttlHours: 72,
        onExpire: () => {
          expiredNotified = true;
        },
      }).then((res) => {
        expect(res.processed).toBe(1);
        expect(res.expired).toBe(1);
        expect(res.succeeded).toBe(0);
        expect(expiredNotified).toBe(true);

        return store.get('EXP1').then((found) => {
          expect(found).toBeNull();
        });
      });
    });
  });

  it('deletes a record it cannot decrypt, reports it, and still processes the others', async () => {
    const store = new MemoryOutboxStore();
    const now = new Date();
    vi.stubEnv('OUTBOX_ENCRYPTION_KEY', 'old-key');
    await store.put({ id: 'OLD1', phone: '+48501482555', slot: 'asap', source: 'header', createdAt: now.toISOString(), attempts: 1 });
    vi.stubEnv('OUTBOX_ENCRYPTION_KEY', 'new-key');
    await store.put({ id: 'NEW1', phone: '+48602235736', slot: 'asap', source: 'header', createdAt: now.toISOString(), attempts: 1 });

    const corrupt: string[] = [];
    const sent: string[] = [];
    const res = await processOutbox(
      store,
      async (record) => {
        sent.push(record.id);
        return true;
      },
      { now, onCorrupt: (id) => void corrupt.push(id) }
    );

    expect(corrupt).toEqual(['OLD1']);
    expect(sent).toEqual(['NEW1']);
    expect(res.corrupt).toBe(1);
    expect(res.succeeded).toBe(1);
    expect(await store.listIds()).toEqual([]);
  });

  it('keeps a record when reading it fails for any reason other than decryption', async () => {
    const store = new MemoryOutboxStore();
    const now = new Date();
    await store.put({ id: 'NET1', phone: '+48501482555', slot: 'asap', source: 'header', createdAt: now.toISOString(), attempts: 1 });
    vi.spyOn(store, 'get').mockRejectedValueOnce(new Error('Blobs 503'));

    const corrupt: string[] = [];
    const res = await processOutbox(store, async () => true, { now, onCorrupt: (id) => void corrupt.push(id) });

    expect(corrupt).toEqual([]);
    expect(res.corrupt).toBe(0);
    expect(res.errors).toBe(1);
    expect(await store.listIds()).toEqual(['NET1']);
  });

  it('keeps processing the other records when a store write fails', async () => {
    const store = new MemoryOutboxStore();
    const now = new Date();
    await store.put({ id: 'BAD1', phone: '+48501482555', slot: 'asap', source: 'header', createdAt: now.toISOString(), attempts: 0 });
    await store.put({ id: 'OK01', phone: '+48602235736', slot: 'asap', source: 'header', createdAt: now.toISOString(), attempts: 0 });
    const realDelete = store.delete.bind(store);
    vi.spyOn(store, 'delete').mockImplementation(async (id) => {
      if (id === 'BAD1') throw new Error('Blobs 503');
      return realDelete(id);
    });

    const res = await processOutbox(store, async () => true, { now });

    expect(res.errors).toBe(1);
    expect(res.succeeded).toBe(1);
    expect(await store.listIds()).toEqual(['BAD1']);
  });

  it('waits longer between retries as attempts grow', async () => {
    const store = new MemoryOutboxStore();
    const now = new Date('2026-10-05T12:00:00Z');
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();

    // 3rd attempt is due 20 min after the 2nd one (5 min ago -> not due yet)
    await store.put({ id: 'WAIT', phone: '+48501482555', slot: 'asap', source: 'header', createdAt: thirtyMinAgo, attempts: 2, lastAttemptAt: fiveMinAgo });
    // 1st retry is due 10 min after the first attempt (30 min ago -> due)
    await store.put({ id: 'DUE1', phone: '+48501482555', slot: 'asap', source: 'header', createdAt: thirtyMinAgo, attempts: 1, lastAttemptAt: thirtyMinAgo });

    const sent: string[] = [];
    const res = await processOutbox(store, async (r) => { sent.push(r.id); return false; }, { now });

    expect(sent).toEqual(['DUE1']);
    expect(res.skipped).toBe(1);
    expect((await store.get('WAIT'))?.attempts).toBe(2);
  });
});

describe('getRetryDelayMs', () => {
  it('doubles from 10 minutes and caps at 2 hours', () => {
    expect(getRetryDelayMs(1)).toBe(10 * 60 * 1000);
    expect(getRetryDelayMs(2)).toBe(20 * 60 * 1000);
    expect(getRetryDelayMs(3)).toBe(40 * 60 * 1000);
    expect(getRetryDelayMs(10)).toBe(2 * 60 * 60 * 1000);
  });
});

describe('getOutboxTtlHours', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reads CALLBACK_OUTBOX_TTL_HOURS', () => {
    vi.stubEnv('CALLBACK_OUTBOX_TTL_HOURS', '48');
    expect(getOutboxTtlHours()).toBe(48);
  });

  it('falls back to the default for missing, invalid, fractional or non-positive values', () => {
    for (const value of ['', 'abc', '0', '-5', '1.5']) {
      vi.stubEnv('CALLBACK_OUTBOX_TTL_HOURS', value);
      expect(getOutboxTtlHours()).toBe(DEFAULT_OUTBOX_TTL_HOURS);
    }
  });

  it('expires records even when the env value is invalid', async () => {
    vi.stubEnv('CALLBACK_OUTBOX_TTL_HOURS', 'abc');
    const store = new MemoryOutboxStore();
    const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
    await store.put({ id: 'EXP2', phone: '+48501482555', slot: 'asap', source: 'header', createdAt: fourDaysAgo, attempts: 3 });

    const res = await processOutbox(store, async () => true);
    expect(res.expired).toBe(1);
  });
});
