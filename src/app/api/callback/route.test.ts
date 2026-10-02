import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import * as emailModule from '@/lib/notify/email';
import * as telegramModule from '@/lib/notify/telegram';
import * as storeModule from '@/lib/outbox/store';
import { DELIVERY_BUDGET } from '@/lib/callback/delivery-budget';

function makeRequest(body: unknown, raw = false): NextRequest {
  return new NextRequest('http://localhost/api/callback', {
    method: 'POST',
    body: raw ? (body as string) : JSON.stringify(body),
  });
}

const validBody = {
  phone: '501 482 555',
  slot: '8-12',
  topic: 'kadry-place',
  source: 'header',
  elapsedMs: 3000,
};

const never = <T,>() => new Promise<T>(() => {});

describe('POST /api/callback route handler', () => {
  const memoryStore = new storeModule.MemoryOutboxStore();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv('CALLBACK_SMTP_HOST', 'smtp.example.com');
    vi.stubEnv('CALLBACK_SMTP_USER', 'user');
    vi.stubEnv('CALLBACK_SMTP_PASS', 'pass');
    memoryStore.clear();
    vi.spyOn(storeModule, 'getOutboxStore').mockReturnValue(memoryStore);
    vi.spyOn(telegramModule, 'sendTelegramPing').mockResolvedValue(true);
    vi.spyOn(telegramModule, 'sendTelegramAlert').mockResolvedValue(true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it('handles valid submission with direct email success', async () => {
    vi.spyOn(emailModule, 'sendCallbackEmail').mockResolvedValue(true);

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.delivery).toBe('direct');
    expect(data.id).toMatch(/^[0-9A-F]{6}$/);
  });

  describe('spam traps', () => {
    it('silently ignores honeypot submissions without a delivery marker', async () => {
      const emailSpy = vi.spyOn(emailModule, 'sendCallbackEmail');

      const res = await POST(makeRequest({ ...validBody, honeypot: 'spam-bot-input' }));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.delivery).toBeUndefined();
      expect(emailSpy).not.toHaveBeenCalled();
    });

    it('silently ignores submissions faster than 2 seconds without a delivery marker', async () => {
      const emailSpy = vi.spyOn(emailModule, 'sendCallbackEmail');

      const res = await POST(makeRequest({ ...validBody, elapsedMs: 500 }));
      expect(res.status).toBe(200);
      expect((await res.json()).delivery).toBeUndefined();
      expect(emailSpy).not.toHaveBeenCalled();
    });

    it('silently ignores submissions with no elapsed time', async () => {
      const emailSpy = vi.spyOn(emailModule, 'sendCallbackEmail');
      const { elapsedMs: _omit, ...withoutElapsed } = validBody;
      void _omit;

      const res = await POST(makeRequest(withoutElapsed));
      expect(res.status).toBe(200);
      expect((await res.json()).delivery).toBeUndefined();
      expect(emailSpy).not.toHaveBeenCalled();
    });

    it('ignores the server clock, so a visitor whose clock runs ahead is not dropped', async () => {
      const emailSpy = vi.spyOn(emailModule, 'sendCallbackEmail').mockResolvedValue(true);

      // Browser clock 60 s ahead: the old formOpenedAt field would be in the server's future.
      const res = await POST(makeRequest({ ...validBody, formOpenedAt: Date.now() + 60_000 }));
      expect((await res.json()).delivery).toBe('direct');
      expect(emailSpy).toHaveBeenCalledOnce();
    });
  });

  describe('input validation', () => {
    it('rejects invalid phone numbers with 400', async () => {
      const res = await POST(makeRequest({ ...validBody, phone: '123' }));
      expect(res.status).toBe(400);
      expect((await res.json()).error).toBeDefined();
    });

    it('rejects malformed JSON with 400', async () => {
      const res = await POST(makeRequest('{not json', true));
      expect(res.status).toBe(400);
    });

    it('rejects a null body with 400', async () => {
      const res = await POST(makeRequest(null));
      expect(res.status).toBe(400);
    });

    it('drops an unknown topic and replaces an unknown source before notifying anyone', async () => {
      const emailSpy = vi.spyOn(emailModule, 'sendCallbackEmail').mockResolvedValue(true);
      const pingSpy = vi.spyOn(telegramModule, 'sendTelegramPing');

      const res = await POST(
        makeRequest({ ...validBody, topic: 'zadzwoń 600 700 800', source: '<b>601 602 603</b>' })
      );
      expect(res.status).toBe(200);

      const sent = emailSpy.mock.calls[0][0];
      expect(sent.topic).toBe('');
      expect(sent.source).toBe('unknown');
      expect(pingSpy.mock.calls[0][0]).toMatchObject({ topic: '', source: 'unknown' });
    });

    it('passes known topics and sources through', async () => {
      const emailSpy = vi.spyOn(emailModule, 'sendCallbackEmail').mockResolvedValue(true);

      await POST(makeRequest({ ...validBody, topic: 'spolka', source: 'floating' }));
      expect(emailSpy.mock.calls[0][0]).toMatchObject({ topic: 'spolka', source: 'floating' });
    });
  });

  it('returns 500 with the office number when SMTP is not configured, without buffering', async () => {
    vi.stubEnv('CALLBACK_SMTP_PASS', '');
    const emailSpy = vi.spyOn(emailModule, 'sendCallbackEmail');
    const alertSpy = vi.spyOn(telegramModule, 'sendTelegramAlert');

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.callNumber).toBe('91 48 24 190');
    expect(emailSpy).not.toHaveBeenCalled();
    expect(await memoryStore.listIds()).toEqual([]);
    expect(alertSpy).toHaveBeenCalledOnce();
    expect(alertSpy.mock.calls[0][0]).not.toContain('482');
  });

  it('buffers in outbox when email delivery fails (returns 200 buffered)', async () => {
    vi.spyOn(emailModule, 'sendCallbackEmail').mockResolvedValue(false);

    const res = await POST(makeRequest({ ...validBody, slot: '17-18', topic: 'spolka', source: 'floating' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.delivery).toBe('buffered');

    const record = await memoryStore.get(data.id);
    expect(record?.phone).toBe('+48501482555');
  });

  it('returns 502 with the office number when both email and the outbox fail', async () => {
    vi.spyOn(emailModule, 'sendCallbackEmail').mockResolvedValue(false);
    vi.spyOn(memoryStore, 'put').mockRejectedValue(new Error('blobs down'));
    const alertSpy = vi.spyOn(telegramModule, 'sendTelegramAlert');

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(502);
    expect((await res.json()).telUri).toBe('tel:+48914824190');
    expect(alertSpy).toHaveBeenCalledOnce();
  });

  describe('response time budget', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    });

    it('buffers the request when email hangs past its budget', async () => {
      vi.spyOn(emailModule, 'sendCallbackEmail').mockReturnValue(never());

      const pending = POST(makeRequest(validBody));
      await vi.advanceTimersByTimeAsync(DELIVERY_BUDGET.emailMs);
      const res = await pending;

      expect((await res.json()).delivery).toBe('buffered');
    });

    it('does not wait for a hanging Telegram ping once email succeeded', async () => {
      vi.spyOn(emailModule, 'sendCallbackEmail').mockResolvedValue(true);
      vi.spyOn(telegramModule, 'sendTelegramPing').mockReturnValue(never());

      const pending = POST(makeRequest(validBody));
      await vi.advanceTimersByTimeAsync(DELIVERY_BUDGET.emailMs);
      const res = await pending;

      expect((await res.json()).delivery).toBe('direct');
    });

    it('stops waiting for hanging outbox writes and alerts', async () => {
      vi.spyOn(emailModule, 'sendCallbackEmail').mockResolvedValue(false);
      vi.spyOn(memoryStore, 'put').mockReturnValue(never());
      vi.spyOn(telegramModule, 'sendTelegramAlert').mockReturnValue(never());

      const pending = POST(makeRequest(validBody));
      await vi.advanceTimersByTimeAsync(DELIVERY_BUDGET.outboxMs + DELIVERY_BUDGET.alertMs);
      const res = await pending;

      expect(res.status).toBe(502);
    });

    it('keeps the worst case under the 10 s Netlify function limit', () => {
      const worstCase = DELIVERY_BUDGET.emailMs + DELIVERY_BUDGET.outboxMs + DELIVERY_BUDGET.alertMs;
      expect(worstCase).toBeLessThanOrEqual(9000);
    });
  });
});
