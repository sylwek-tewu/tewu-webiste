import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { getOutboxStore, resetOutboxStore, MemoryOutboxStore, SqliteOutboxStore } from '@/lib/outbox';
import * as telegram from '@/lib/notify/telegram';
import * as email from '@/lib/notify/email';
import { initDb, resetDbInstance } from '@/db';

vi.mock('@/lib/notify/telegram', () => ({
  sendTelegramAlert: vi.fn(async () => true),
}));

vi.mock('@/lib/notify/email', () => ({
  sendCallbackEmail: vi.fn(async () => true),
}));

function makeRequest(options: {
  headers?: Record<string, string>;
} = {}) {
  const reqHeaders = new Headers();
  if (options.headers) {
    for (const [k, v] of Object.entries(options.headers)) {
      reqHeaders.set(k, v);
    }
  }
  return new NextRequest('http://localhost:3000/api/internal/process-outbox', {
    method: 'POST',
    headers: reqHeaders,
  });
}

describe('POST /api/internal/process-outbox', () => {
  let memoryStore: MemoryOutboxStore;

  beforeEach(() => {
    vi.stubEnv('OUTBOX_STORE', 'memory');
    resetOutboxStore();
    memoryStore = getOutboxStore() as MemoryOutboxStore;
    memoryStore.clear();

    initDb({ path: ':memory:', setAsDefault: true });
    vi.clearAllMocks();
    vi.stubEnv('CRON_SECRET', 'test-cron-secret');
    vi.stubEnv('OUTBOX_ENCRYPTION_KEY', 'the-secret-encryption-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetOutboxStore();
    resetDbInstance();
  });

  it('rejects unauthorized requests when CRON_SECRET is configured', async () => {
    const req = makeRequest();
    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('rejects request with wrong token', async () => {
    const req = makeRequest({
      headers: { authorization: 'Bearer wrong-secret' },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('accepts request with valid Authorization header', async () => {
    const req = makeRequest({
      headers: { authorization: 'Bearer test-cron-secret' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.processed).toBe(0);
  });

  it('accepts request with valid x-cron-secret header', async () => {
    const req = makeRequest({
      headers: { 'x-cron-secret': 'test-cron-secret' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('returns 500 in production when CRON_SECRET is missing', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('CRON_SECRET', '');

    const req = makeRequest();
    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain('CRON_SECRET is required');
  });

  it('processes queued records and deletes them on successful email sending', async () => {
    await memoryStore.put({
      id: 'A1B2C3',
      phone: '+48501482555',
      slot: 'asap',
      source: 'header',
      createdAt: new Date().toISOString(),
      attempts: 1,
    });

    const req = makeRequest({
      headers: { authorization: 'Bearer test-cron-secret' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.processed).toBe(1);
    expect(body.succeeded).toBe(1);
    expect(email.sendCallbackEmail).toHaveBeenCalledOnce();
    expect(await memoryStore.listIds()).toEqual([]);
  });

  it('alerts about store errors at most once per interval, without personal data', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await memoryStore.put({
      id: 'E1E2E3',
      phone: '+48501482555',
      slot: 'asap',
      source: 'header',
      createdAt: new Date().toISOString(),
      attempts: 1,
    });
    vi.spyOn(memoryStore, 'get').mockRejectedValue(new Error('SQLITE_BUSY'));
    const auth = { authorization: 'Bearer test-cron-secret' };

    await POST(makeRequest({ headers: auth }));
    await POST(makeRequest({ headers: auth }));

    expect(telegram.sendTelegramAlert).toHaveBeenCalledOnce();
    const text = vi.mocked(telegram.sendTelegramAlert).mock.calls[0][0];
    expect(text).toMatch(/błęd/i);
    expect(text).not.toContain('482');
    expect(await memoryStore.listIds()).toEqual(['E1E2E3']);
  });

  it('rejects a run while the previous one is still in progress and sends each record once', async () => {
    await memoryStore.put({
      id: 'S1S2S3',
      phone: '+48501482555',
      slot: 'asap',
      source: 'header',
      createdAt: new Date().toISOString(),
      attempts: 1,
    });
    let release!: () => void;
    vi.mocked(email.sendCallbackEmail).mockImplementationOnce(
      () => new Promise<boolean>((resolve) => (release = () => resolve(true)))
    );
    const auth = { authorization: 'Bearer test-cron-secret' };

    const first = POST(makeRequest({ headers: auth }));
    await vi.waitFor(() => expect(email.sendCallbackEmail).toHaveBeenCalledOnce());
    const second = await POST(makeRequest({ headers: auth }));
    release();
    const firstRes = await first;

    expect(second.status).toBe(409);
    expect(firstRes.status).toBe(200);
    expect(email.sendCallbackEmail).toHaveBeenCalledOnce();
    expect(await memoryStore.listIds()).toEqual([]);

    // The guard is released after the run
    expect((await POST(makeRequest({ headers: auth }))).status).toBe(200);
  });

  it('alerts when the run fails as a whole (e.g. the database cannot be opened)', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(memoryStore, 'listIds').mockRejectedValue(new Error('SQLITE_CANTOPEN'));

    const res = await POST(makeRequest({ headers: { authorization: 'Bearer test-cron-secret' } }));

    expect(res.status).toBe(500);
    expect(telegram.sendTelegramAlert).toHaveBeenCalledOnce();
    expect(telegram.sendTelegramAlert).toHaveBeenCalledWith(expect.stringContaining('SQLite'));
  });

  it('retries a record buffered in the real SQLite store and keeps it on failure', async () => {
    vi.stubEnv('OUTBOX_STORE', 'sqlite');
    resetOutboxStore();
    const sqliteStore = getOutboxStore();
    expect(sqliteStore).toBeInstanceOf(SqliteOutboxStore);
    await sqliteStore.put({
      id: 'Q1Q2Q3',
      phone: '+48501482555',
      slot: 'asap',
      source: 'header',
      createdAt: new Date().toISOString(),
      attempts: 1,
    });
    vi.mocked(email.sendCallbackEmail).mockResolvedValueOnce(false);

    const res = await POST(makeRequest({ headers: { authorization: 'Bearer test-cron-secret' } }));
    const body = await res.json();

    expect(body).toMatchObject({ processed: 1, failed: 1 });
    expect(email.sendCallbackEmail).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'Q1Q2Q3', phone: '+48501482555' }),
      expect.objectContaining({ deadlineMs: expect.any(Number) })
    );
    expect((await sqliteStore.get('Q1Q2Q3'))?.attempts).toBe(2);
  });

  it('handles missing OUTBOX_ENCRYPTION_KEY with keyMissing flag and alert', async () => {
    // Save raw with encryption
    await memoryStore.put({
      id: 'K1K2K3',
      phone: '+48501482555',
      slot: 'asap',
      source: 'header',
      createdAt: new Date().toISOString(),
      attempts: 1,
    });

    // Unset encryption key for processing run
    vi.stubEnv('OUTBOX_ENCRYPTION_KEY', '');

    const req = makeRequest({
      headers: { authorization: 'Bearer test-cron-secret' },
    });
    const res = await POST(req);
    const body = await res.json();

    expect(body.keyMissing).toBe(true);
    expect(telegram.sendTelegramAlert).toHaveBeenCalledOnce();
    expect(telegram.sendTelegramAlert).toHaveBeenCalledWith(
      expect.stringContaining('OUTBOX_ENCRYPTION_KEY')
    );
  });
});
