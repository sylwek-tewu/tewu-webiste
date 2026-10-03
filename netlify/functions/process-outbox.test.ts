import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { encryptPhone } from '../../src/lib/outbox/crypto';

type FakeStore = {
  data: Map<string, string>;
  list: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  setJSON: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const mocks = vi.hoisted(() => {
  const makeStore = (): FakeStore => {
    const data = new Map<string, string>();
    return {
      data,
      list: vi.fn(async () => ({ blobs: [...data.keys()].map((key) => ({ key })) })),
      get: vi.fn(async (key: string) => data.get(key) ?? null),
      set: vi.fn(async (key: string, value: string) => void data.set(key, value)),
      setJSON: vi.fn(async (key: string, value: unknown) => void data.set(key, JSON.stringify(value))),
      delete: vi.fn(async (key: string) => void data.delete(key)),
    };
  };
  const stores = new Map<string, FakeStore>();
  return {
    makeStore,
    stores,
    getStore: vi.fn((opts: { name: string }) => {
      if (!stores.has(opts.name)) stores.set(opts.name, makeStore());
      return stores.get(opts.name)!;
    }),
    sendTelegramAlert: vi.fn(async (_text: string) => true),
  };
});

vi.mock('@netlify/blobs', () => ({ getStore: mocks.getStore }));
vi.mock('../../src/lib/notify/telegram', () => ({ sendTelegramAlert: mocks.sendTelegramAlert }));

const outbox = () => mocks.getStore({ name: 'callback-outbox' });

function addRecord(id: string, key = 'the-key') {
  outbox().data.set(
    id,
    JSON.stringify({
      id,
      phone: encryptPhone('+48501482555', key),
      slot: 'asap',
      source: 'header',
      createdAt: new Date().toISOString(),
      attempts: 1,
      lastAttemptAt: new Date().toISOString(),
    })
  );
}

async function runHandler() {
  const { default: handler } = await import('./process-outbox.mjs');
  return (await handler()).json();
}

describe('process-outbox scheduled function', () => {
  beforeEach(() => {
    mocks.stores.clear();
    mocks.sendTelegramAlert.mockClear();
    vi.stubEnv('OUTBOX_ENCRYPTION_KEY', 'the-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reads the Netlify Blobs outbox even when NODE_ENV and NETLIFY* env vars are absent', async () => {
    vi.stubEnv('NODE_ENV', '');
    vi.stubEnv('NETLIFY', '');
    vi.stubEnv('NETLIFY_BLOBS_CONTEXT', '');
    vi.stubEnv('NETLIFY_SITE_ID', '');

    const result = await runHandler();

    expect(mocks.getStore).toHaveBeenCalledWith(expect.objectContaining({ name: 'callback-outbox' }));
    expect(result).toMatchObject({ processed: 0 });
  });

  it('sends one alert and deletes nothing when OUTBOX_ENCRYPTION_KEY is missing', async () => {
    addRecord('K1');
    addRecord('K2');
    vi.stubEnv('OUTBOX_ENCRYPTION_KEY', '');

    const result = await runHandler();

    expect(result.keyMissing).toBe(true);
    expect(outbox().delete).not.toHaveBeenCalled();
    expect(mocks.sendTelegramAlert).toHaveBeenCalledOnce();
    expect(mocks.sendTelegramAlert.mock.calls[0][0]).toContain('OUTBOX_ENCRYPTION_KEY');
  });

  it('alerts about store errors at most once per interval', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    addRecord('E1');
    outbox().get.mockRejectedValue(new Error('Blobs 503'));

    await runHandler();
    await runHandler();

    expect(mocks.sendTelegramAlert).toHaveBeenCalledOnce();
    expect(mocks.sendTelegramAlert.mock.calls[0][0]).toMatch(/błęd/i);
    expect(mocks.sendTelegramAlert.mock.calls[0][0]).not.toContain('482');
    expect(outbox().data.has('E1')).toBe(true);
  });
});
