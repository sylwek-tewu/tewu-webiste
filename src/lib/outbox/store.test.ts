import { describe, it, expect, vi, afterEach } from 'vitest';
import { getOutboxStore, MemoryOutboxStore, NetlifyBlobsOutboxStore } from './store';
import { CorruptRecordError } from './crypto';

const blobs = vi.hoisted(() => ({ get: vi.fn(), setJSON: vi.fn(), delete: vi.fn(), list: vi.fn() }));
vi.mock('@netlify/blobs', () => ({ getStore: () => blobs }));

describe('getOutboxStore', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses the in-memory store in local development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NETLIFY', '');
    vi.stubEnv('NETLIFY_BLOBS_CONTEXT', '');
    vi.stubEnv('NETLIFY_SITE_ID', '');
    expect(getOutboxStore()).toBeInstanceOf(MemoryOutboxStore);
  });

  it('always uses Netlify Blobs in production, even without Netlify env vars', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NETLIFY', '');
    vi.stubEnv('NETLIFY_BLOBS_CONTEXT', '');
    vi.stubEnv('NETLIFY_SITE_ID', '');
    expect(getOutboxStore()).toBeInstanceOf(NetlifyBlobsOutboxStore);
  });
});

describe('MemoryOutboxStore', () => {
  it('lists record ids', async () => {
    const store = new MemoryOutboxStore();
    await store.put({ id: 'A1', phone: '+48501482555', slot: 'asap', source: 'header', createdAt: new Date().toISOString(), attempts: 1 });
    expect(await store.listIds()).toEqual(['A1']);
  });
});

describe('NetlifyBlobsOutboxStore.get', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  const valid = { id: 'C9F1A2', phone: '+48501482555', slot: 'asap', source: 'header', createdAt: '2026-10-05T10:00:00.000Z', attempts: 1 };

  it('returns a stored record', async () => {
    blobs.get.mockResolvedValue(JSON.stringify(valid));
    expect(await new NetlifyBlobsOutboxStore().get('C9F1A2')).toEqual(valid);
  });

  it('returns null for a missing record', async () => {
    blobs.get.mockResolvedValue(null);
    expect(await new NetlifyBlobsOutboxStore().get('C9F1A2')).toBeNull();
  });

  it('reports unparseable JSON as a corrupt record', async () => {
    blobs.get.mockResolvedValue('{not json');
    await expect(new NetlifyBlobsOutboxStore().get('C9F1A2')).rejects.toBeInstanceOf(CorruptRecordError);
  });

  it('reports a record without a phone or a valid date as corrupt', async () => {
    blobs.get.mockResolvedValue(JSON.stringify({ ...valid, phone: undefined }));
    await expect(new NetlifyBlobsOutboxStore().get('C9F1A2')).rejects.toBeInstanceOf(CorruptRecordError);
    blobs.get.mockResolvedValue(JSON.stringify({ ...valid, createdAt: 'yesterday' }));
    await expect(new NetlifyBlobsOutboxStore().get('C9F1A2')).rejects.toBeInstanceOf(CorruptRecordError);
  });

  it('passes network errors through as ordinary errors, so the record is kept', async () => {
    blobs.get.mockRejectedValue(new Error('Blobs 503'));
    const error = await new NetlifyBlobsOutboxStore().get('C9F1A2').catch((e) => e);
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(CorruptRecordError);
  });
});
