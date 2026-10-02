import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import * as emailModule from '@/lib/notify/email';
import * as telegramModule from '@/lib/notify/telegram';
import * as storeModule from '@/lib/outbox/store';

describe('POST /api/callback route handler', () => {
  const memoryStore = new storeModule.MemoryOutboxStore();

  beforeEach(() => {
    vi.restoreAllMocks();
    memoryStore.clear();
    vi.spyOn(storeModule, 'getOutboxStore').mockReturnValue(memoryStore);
    vi.spyOn(telegramModule, 'sendTelegramPing').mockResolvedValue(true);
    vi.spyOn(telegramModule, 'sendTelegramAlert').mockResolvedValue(true);
  });

  it('handles valid submission with direct email success', async () => {
    vi.spyOn(emailModule, 'sendCallbackEmail').mockResolvedValue(true);

    const req = new NextRequest('http://localhost/api/callback', {
      method: 'POST',
      body: JSON.stringify({
        phone: '501 482 555',
        slot: '8-12',
        topic: 'kadry-place',
        source: 'header',
        formOpenedAt: Date.now() - 3000, // 3s ago
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.delivery).toBe('direct');
    expect(data.id).toBeDefined();
  });

  it('silently ignores honeypot submissions (returns 200 without sending email)', async () => {
    const emailSpy = vi.spyOn(emailModule, 'sendCallbackEmail');

    const req = new NextRequest('http://localhost/api/callback', {
      method: 'POST',
      body: JSON.stringify({
        phone: '501 482 555',
        slot: 'asap',
        honeypot: 'spam-bot-input',
        formOpenedAt: Date.now() - 5000,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(emailSpy).not.toHaveBeenCalled();
  });

  it('silently catches submissions that trigger the time trap (< 2s)', async () => {
    const emailSpy = vi.spyOn(emailModule, 'sendCallbackEmail');

    const req = new NextRequest('http://localhost/api/callback', {
      method: 'POST',
      body: JSON.stringify({
        phone: '501 482 555',
        slot: 'asap',
        formOpenedAt: Date.now() - 500, // Only 500ms
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(emailSpy).not.toHaveBeenCalled();
  });

  it('rejects invalid phone numbers with 400', async () => {
    const req = new NextRequest('http://localhost/api/callback', {
      method: 'POST',
      body: JSON.stringify({
        phone: '123',
        slot: 'asap',
        formOpenedAt: Date.now() - 3000,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('buffers in outbox when email delivery fails (returns 200 buffered)', async () => {
    vi.spyOn(emailModule, 'sendCallbackEmail').mockResolvedValue(false);

    const req = new NextRequest('http://localhost/api/callback', {
      method: 'POST',
      body: JSON.stringify({
        phone: '501 482 555',
        slot: '17-18',
        topic: 'spolka',
        source: 'floating',
        formOpenedAt: Date.now() - 3000,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.delivery).toBe('buffered');

    const records = await memoryStore.list();
    expect(records.length).toBe(1);
    expect(records[0].id).toBe(data.id);
  });
});
