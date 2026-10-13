import { describe, it, expect, vi, afterEach } from 'vitest';
import { withTimeout } from './timeout';

describe('withTimeout', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves with the promise value when it settles in time', async () => {
    await expect(withTimeout(Promise.resolve('ok'), 1000, 'late')).resolves.toBe('ok');
  });

  it('resolves with the fallback when the promise takes too long', async () => {
    vi.useFakeTimers();
    const never = new Promise<string>(() => {});
    const result = withTimeout(never, 1000, 'late');
    await vi.advanceTimersByTimeAsync(1000);
    await expect(result).resolves.toBe('late');
  });

  it('resolves with the fallback when the promise rejects', async () => {
    await expect(withTimeout(Promise.reject(new Error('boom')), 1000, 'failed')).resolves.toBe('failed');
  });
});
