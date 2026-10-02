import { describe, it, expect, vi, afterEach } from 'vitest';
import { getOutboxStore, MemoryOutboxStore, NetlifyBlobsOutboxStore } from './store';

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
