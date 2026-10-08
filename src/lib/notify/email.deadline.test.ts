import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import net from 'node:net';
import { EventEmitter } from 'node:events';
import { sendCallbackEmail } from './email';
import type { CallbackNotificationData } from './types';

/**
 * Minimal SMTP server that answers every command after `replyDelayMs`: slow but never idle,
 * so nodemailer's per-phase inactivity timeouts never fire.
 */
function startSlowSmtpServer(replyDelayMs: number) {
  const state = { delivered: false };
  const server = net.createServer((socket) => {
    let inData = false;
    let buffer = '';
    const reply = (text: string) =>
      setTimeout(() => {
        if (!socket.destroyed) socket.write(text);
      }, replyDelayMs);

    socket.write('220 slow.test ESMTP\r\n');
    socket.on('data', (chunk) => {
      buffer += chunk.toString();
      if (inData) {
        if (buffer.includes('\r\n.\r\n')) {
          inData = false;
          buffer = '';
          state.delivered = true;
          reply('250 queued\r\n');
        }
        return;
      }
      let idx;
      while ((idx = buffer.indexOf('\r\n')) >= 0) {
        const line = buffer.slice(0, idx).toUpperCase();
        buffer = buffer.slice(idx + 2);
        if (line.startsWith('EHLO')) reply('250-slow.test\r\n250 AUTH PLAIN\r\n');
        else if (line.startsWith('AUTH')) reply('235 ok\r\n');
        else if (line.startsWith('DATA')) {
          inData = true;
          reply('354 go\r\n');
        } else if (line.startsWith('QUIT')) reply('221 bye\r\n');
        else reply('250 ok\r\n');
      }
    });
    socket.on('error', () => {});
  });
  return new Promise<{ port: number; state: typeof state; close: () => void }>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as net.AddressInfo;
      resolve({ port, state, close: () => server.close() });
    });
  });
}

const data: CallbackNotificationData = {
  id: 'C9F1A2',
  phone: '+48501482555',
  slot: 'asap',
  topic: '',
  source: 'header',
  locale: 'pl',
  createdAt: '2026-10-05T10:00:00.000Z',
};

describe('sendCallbackEmail deadline', () => {
  let server: Awaited<ReturnType<typeof startSlowSmtpServer>>;

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    server?.close();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  async function useServer(replyDelayMs: number) {
    server = await startSlowSmtpServer(replyDelayMs);
    vi.stubEnv('CALLBACK_SMTP_HOST', '127.0.0.1');
    vi.stubEnv('CALLBACK_SMTP_PORT', String(server.port));
    vi.stubEnv('CALLBACK_SMTP_USER', 'user');
    vi.stubEnv('CALLBACK_SMTP_PASS', 'pass');
  }

  it('delivers when the server finishes before the deadline', async () => {
    await useServer(10);
    await expect(sendCallbackEmail(data, { deadlineMs: 5000 })).resolves.toBe(true);
    expect(server.state.delivered).toBe(true);
  });

  it('aborts a slow-but-active send at the deadline, so it cannot deliver after the request was buffered', async () => {
    await useServer(150); // ~7 round trips ≈ 1 s in total, each reply well inside the inactivity timeouts

    await expect(sendCallbackEmail(data, { deadlineMs: 400 })).resolves.toBe(false);

    await new Promise((r) => setTimeout(r, 1500));
    expect(server.state.delivered).toBe(false);
  });
});

describe('sendCallbackEmail connection timeout', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('gives up on a connection that never opens, even without a deadline', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubEnv('CALLBACK_SMTP_HOST', 'smtp.example.com');
    vi.stubEnv('CALLBACK_SMTP_USER', 'user');
    vi.stubEnv('CALLBACK_SMTP_PASS', 'pass');
    const hanging = new EventEmitter() as EventEmitter & { destroy: (err?: Error) => EventEmitter };
    hanging.destroy = (err?: Error) => {
      if (err) hanging.emit('error', err);
      return hanging;
    };
    vi.spyOn(net, 'connect').mockReturnValue(hanging as unknown as net.Socket);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    const result = sendCallbackEmail(data);
    await vi.advanceTimersByTimeAsync(2000);

    await expect(result).resolves.toBe(false);
  });
});
