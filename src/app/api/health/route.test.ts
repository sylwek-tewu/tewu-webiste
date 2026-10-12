import { describe, it, expect } from 'vitest';
import { GET } from './route';

describe('GET /api/health', () => {
  it('answers 200 without touching the outbox database', async () => {
    const res = GET();

    expect(res.status).toBe(200);
    expect(await res.text()).toBe('ok');
    expect(res.headers.get('cache-control')).toBe('no-store');
  });
});
