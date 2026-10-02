import { describe, it, expect } from 'vitest';
import { MemoryOutboxStore } from './store';
import { processOutbox } from './processor';
import { OutboxRecord } from './types';

describe('processOutbox', () => {
  it('deletes record immediately when sendEmail succeeds', () => {
    const store = new MemoryOutboxStore();
    const record: OutboxRecord = {
      id: 'A7K2',
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

        return store.get('A7K2').then((found) => {
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
});
