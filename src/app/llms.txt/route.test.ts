import { describe, it, expect } from 'vitest';
import { buildLlmsTxt } from '@/lib/llms-txt';
import { GET } from './route';

describe('GET /llms.txt', () => {
  it('serves the text as UTF-8 plain text', async () => {
    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    expect(await response.text()).toBe(buildLlmsTxt());
  });
});
