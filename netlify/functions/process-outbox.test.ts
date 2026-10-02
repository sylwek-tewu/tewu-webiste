import { describe, it, expect, vi, afterEach } from 'vitest';

const blobsStore = {
  list: vi.fn(async () => ({ blobs: [] })),
  get: vi.fn(),
  setJSON: vi.fn(),
  delete: vi.fn(),
};
const getStore = vi.fn(() => blobsStore);
vi.mock('@netlify/blobs', () => ({ getStore }));

describe('process-outbox scheduled function', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reads the Netlify Blobs outbox even when NODE_ENV and NETLIFY* env vars are absent', async () => {
    vi.stubEnv('NODE_ENV', '');
    vi.stubEnv('NETLIFY', '');
    vi.stubEnv('NETLIFY_BLOBS_CONTEXT', '');
    vi.stubEnv('NETLIFY_SITE_ID', '');
    const { default: handler } = await import('./process-outbox.mjs');

    const res = await handler();

    expect(getStore).toHaveBeenCalledWith(expect.objectContaining({ name: 'callback-outbox' }));
    expect(blobsStore.list).toHaveBeenCalled();
    expect(await res.json()).toMatchObject({ processed: 0 });
  });
});
