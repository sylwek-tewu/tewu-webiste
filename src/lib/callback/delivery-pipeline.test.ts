import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  submitCallbackLead,
  CallbackDeliveryDependencies,
} from './delivery-pipeline';
import { MemoryOutboxStore } from '@/lib/outbox/store';
import { DELIVERY_BUDGET } from './delivery-budget';
import * as emailModule from '@/lib/notify/email';
import * as telegramModule from '@/lib/notify/telegram';
import * as storeModule from '@/lib/outbox/store';

const validPayload = {
  phone: '501 482 555',
  slot: '8-12',
  topic: 'kadry-place',
  source: 'header',
  elapsedMs: 3000,
};

const never = <T,>() => new Promise<T>(() => {});

describe('submitCallbackLead delivery pipeline', () => {
  let memoryStore: MemoryOutboxStore;
  let mockDeps: CallbackDeliveryDependencies;

  beforeEach(() => {
    vi.restoreAllMocks();
    memoryStore = new MemoryOutboxStore();
    mockDeps = {
      sendEmail: vi.fn().mockResolvedValue(true),
      sendTelegramPing: vi.fn().mockResolvedValue(true),
      sendAlert: vi.fn().mockResolvedValue(true),
      outboxStore: memoryStore,
      getMissingSmtpConfig: vi.fn().mockReturnValue([]),
      getCallNumber: vi.fn().mockReturnValue({
        raw: '+48914824190',
        telUri: 'tel:+48914824190',
        display: '91 48 24 190',
      }),
    };
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  describe('1. Rejection of malformed JSON / non-object payload', () => {
    it('rejects a string payload, even one holding valid JSON (the route parses the body)', async () => {
      for (const payload of ['{bad json', JSON.stringify(validPayload)]) {
        expect(await submitCallbackLead(payload, mockDeps)).toEqual({
          status: 'validation_error',
          code: 'invalid_request',
          message: expect.any(String),
        });
      }
      expect(mockDeps.sendEmail).not.toHaveBeenCalled();
    });

    it('rejects null payload with validation_error invalid_request', async () => {
      const result = await submitCallbackLead(null, mockDeps);
      expect(result).toEqual({
        status: 'validation_error',
        code: 'invalid_request',
        message: expect.any(String),
      });
    });

    it('rejects array payload with validation_error invalid_request', async () => {
      const result = await submitCallbackLead(['not', 'an', 'object'], mockDeps);
      expect(result).toEqual({
        status: 'validation_error',
        code: 'invalid_request',
        message: expect.any(String),
      });
    });

    it('rejects primitive numbers and booleans with validation_error invalid_request', async () => {
      expect(await submitCallbackLead(12345, mockDeps)).toMatchObject({
        status: 'validation_error',
        code: 'invalid_request',
      });
      expect(await submitCallbackLead(true, mockDeps)).toMatchObject({
        status: 'validation_error',
        code: 'invalid_request',
      });
    });
  });

  describe('2. Honeypot populated -> silently_ignored', () => {
    it('silently ignores requests when honeypot field is filled', async () => {
      const result = await submitCallbackLead(
        { ...validPayload, honeypot: 'spam-bot-value' },
        mockDeps
      );
      expect(result).toEqual({ status: 'silently_ignored' });
      expect(mockDeps.sendEmail).not.toHaveBeenCalled();
      expect(mockDeps.sendTelegramPing).not.toHaveBeenCalled();
      expect(mockDeps.sendAlert).not.toHaveBeenCalled();
      expect(await memoryStore.listIds()).toHaveLength(0);
    });

    it('proceeds normally when honeypot is empty string or whitespace only', async () => {
      const result = await submitCallbackLead(
        { ...validPayload, honeypot: '   ' },
        mockDeps
      );
      expect(result.status).toBe('delivered');
    });
  });

  describe('3. Elapsed time < 2000ms -> silently_ignored', () => {
    it('silently ignores requests submitted faster than 2000ms', async () => {
      const result = await submitCallbackLead(
        { ...validPayload, elapsedMs: 1999 },
        mockDeps
      );
      expect(result).toEqual({ status: 'silently_ignored' });
      expect(mockDeps.sendEmail).not.toHaveBeenCalled();
      expect(mockDeps.sendTelegramPing).not.toHaveBeenCalled();
      expect(mockDeps.sendAlert).not.toHaveBeenCalled();
    });

    it('silently ignores requests with missing elapsedMs', async () => {
      const { elapsedMs: _omitted, ...noElapsed } = validPayload;
      const result = await submitCallbackLead(noElapsed, mockDeps);
      expect(result).toEqual({ status: 'silently_ignored' });
      expect(mockDeps.sendEmail).not.toHaveBeenCalled();
    });

    it('accepts requests with elapsedMs >= 2000ms', async () => {
      const result = await submitCallbackLead(
        { ...validPayload, elapsedMs: 2000 },
        mockDeps
      );
      expect(result.status).toBe('delivered');
    });
  });

  describe('4. Phone validation', () => {
    it('returns phone_required when phone is empty string', async () => {
      const result = await submitCallbackLead({ ...validPayload, phone: '' }, mockDeps);
      expect(result).toEqual({
        status: 'validation_error',
        code: 'phone_required',
        message: expect.any(String),
      });
      expect(mockDeps.sendEmail).not.toHaveBeenCalled();
    });

    it('returns phone_invalid when phone is invalid', async () => {
      const result = await submitCallbackLead({ ...validPayload, phone: '123' }, mockDeps);
      expect(result).toEqual({
        status: 'validation_error',
        code: 'phone_invalid',
        message: expect.any(String),
      });
      expect(mockDeps.sendEmail).not.toHaveBeenCalled();
    });

    it('returns phone_invalid when phone exceeds 30 characters', async () => {
      const result = await submitCallbackLead(
        { ...validPayload, phone: '5'.repeat(31) },
        mockDeps
      );
      expect(result).toEqual({
        status: 'validation_error',
        code: 'phone_invalid',
        message: expect.any(String),
      });
      expect(mockDeps.sendEmail).not.toHaveBeenCalled();
    });

    it('normalizes phone number to E.164', async () => {
      await submitCallbackLead({ ...validPayload, phone: '501 482 555' }, mockDeps);
      expect(mockDeps.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ phone: '+48501482555' }),
        expect.any(Object)
      );
    });
  });

  describe('5. Slot validation', () => {
    it('returns slot_invalid when slot is not an allowed slot', async () => {
      const result = await submitCallbackLead(
        { ...validPayload, slot: '22-23' },
        mockDeps
      );
      expect(result).toEqual({
        status: 'validation_error',
        code: 'slot_invalid',
        message: expect.any(String),
      });
      expect(mockDeps.sendEmail).not.toHaveBeenCalled();
    });

    it.each(['asap', '8-12', '12-16', '17-18'] as const)(
      'accepts valid slot %s',
      async (slot) => {
        const result = await submitCallbackLead({ ...validPayload, slot }, mockDeps);
        expect(result.status).toBe('delivered');
      }
    );
  });

  describe('Field sanitization: topics, source, locale', () => {
    it('sanitizes unknown topic to empty string and unknown source to unknown', async () => {
      await submitCallbackLead(
        {
          ...validPayload,
          topic: 'malicious <script>alert(1)</script>',
          source: 'unknown-source',
        },
        mockDeps
      );
      expect(mockDeps.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ topic: '', source: 'unknown' }),
        expect.any(Object)
      );
    });

    it('passes known topic and source through', async () => {
      await submitCallbackLead(
        { ...validPayload, topic: 'spolka', source: 'floating' },
        mockDeps
      );
      expect(mockDeps.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ topic: 'spolka', source: 'floating' }),
        expect.any(Object)
      );
    });

    it('preserves uk locale and defaults other locales to pl', async () => {
      await submitCallbackLead({ ...validPayload, locale: 'uk' }, mockDeps);
      expect(mockDeps.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ locale: 'uk' }),
        expect.any(Object)
      );

      await submitCallbackLead({ ...validPayload, locale: 'de' }, mockDeps);
      expect(mockDeps.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ locale: 'pl' }),
        expect.any(Object)
      );
    });
  });

  describe('6. Missing SMTP configuration', () => {
    it('sends alert and returns fallback_office_call with 500 when SMTP is not configured', async () => {
      mockDeps.getMissingSmtpConfig = vi.fn().mockReturnValue(['CALLBACK_SMTP_HOST', 'CALLBACK_SMTP_PASS']);
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await submitCallbackLead(validPayload, mockDeps);
      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('missing: CALLBACK_SMTP_HOST, CALLBACK_SMTP_PASS')
      );
      expect(result).toMatchObject({
        status: 'fallback_office_call',
        code: 'unavailable',
        httpStatus: 500,
        message: expect.any(String),
        callNumber: {
          raw: '+48914824190',
          telUri: 'tel:+48914824190',
          display: '91 48 24 190',
        },
      });

      expect(mockDeps.sendEmail).not.toHaveBeenCalled();
      expect(await memoryStore.listIds()).toHaveLength(0);
      expect(mockDeps.sendAlert).toHaveBeenCalledOnce();
      expect(mockDeps.sendAlert).toHaveBeenCalledWith(
        expect.stringContaining('brak ustawień SMTP')
      );
      // Ensure no PII in alert
      expect(vi.mocked(mockDeps.sendAlert).mock.calls[0][0]).not.toContain('501');
    });
  });

  describe('7. Direct SMTP delivery success', () => {
    it('dispatches email and telegram in parallel and returns delivered status', async () => {
      mockDeps.sendEmail = vi.fn().mockResolvedValue(true);
      mockDeps.sendTelegramPing = vi.fn().mockResolvedValue(true);

      const result = await submitCallbackLead(validPayload, mockDeps);
      expect(result).toEqual({
        status: 'delivered',
        id: expect.stringMatching(/^[0-9A-F]{6}$/),
      });

      expect(mockDeps.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.stringMatching(/^[0-9A-F]{6}$/),
          phone: '+48501482555',
          slot: '8-12',
          topic: 'kadry-place',
          source: 'header',
          locale: 'pl',
          createdAt: expect.any(String),
        }),
        { deadlineMs: DELIVERY_BUDGET.emailMs }
      );
      expect(mockDeps.sendTelegramPing).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.stringMatching(/^[0-9A-F]{6}$/),
          phone: '+48501482555',
        })
      );
      expect(await memoryStore.listIds()).toHaveLength(0);
    });

    it('returns delivered even if Telegram ping fails or times out', async () => {
      mockDeps.sendEmail = vi.fn().mockResolvedValue(true);
      mockDeps.sendTelegramPing = vi.fn().mockResolvedValue(false);

      const result = await submitCallbackLead(validPayload, mockDeps);
      expect(result.status).toBe('delivered');
    });
  });

  describe('8. SMTP failure -> buffered in outbox -> alert sent', () => {
    it('buffers record in outbox, sends alert, and returns buffered status', async () => {
      mockDeps.sendEmail = vi.fn().mockResolvedValue(false);

      const result = await submitCallbackLead(
        { ...validPayload, slot: '17-18', topic: 'spolka', source: 'floating', locale: 'uk' },
        mockDeps
      );

      expect(result).toEqual({
        status: 'buffered',
        id: expect.stringMatching(/^[0-9A-F]{6}$/),
      });

      if (result.status !== 'buffered') throw new Error('Expected buffered status');

      const saved = await memoryStore.get(result.id);
      expect(saved).not.toBeNull();
      expect(saved?.phone).toBe('+48501482555');
      expect(saved?.slot).toBe('17-18');
      expect(saved?.topic).toBe('spolka');
      expect(saved?.source).toBe('floating');
      expect(saved?.locale).toBe('uk');
      expect(saved?.attempts).toBe(1);

      expect(mockDeps.sendAlert).toHaveBeenCalledOnce();
      expect(mockDeps.sendAlert).toHaveBeenCalledWith(
        expect.stringContaining(`zgłoszenie #${result.id} zapisane w buforze awaryjnym`)
      );
    });
  });

  describe('9. SMTP and Outbox failure -> fatal alert sent', () => {
    it('returns fallback_office_call with 502 and sends fatal alert when both email and outbox fail', async () => {
      mockDeps.sendEmail = vi.fn().mockResolvedValue(false);
      vi.spyOn(memoryStore, 'put').mockRejectedValue(new Error('Outbox write error'));

      const result = await submitCallbackLead(validPayload, mockDeps);
      expect(result).toMatchObject({
        status: 'fallback_office_call',
        code: 'delivery_failed',
        httpStatus: 502,
        message: expect.any(String),
        callNumber: {
          raw: '+48914824190',
          telUri: 'tel:+48914824190',
          display: '91 48 24 190',
        },
      });

      expect(mockDeps.sendAlert).toHaveBeenCalledOnce();
      expect(mockDeps.sendAlert).toHaveBeenCalledWith(
        expect.stringContaining('Błąd krytyczny: zgłoszenie #')
      );
    });
  });

  describe('Timeouts and budgets', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    });

    it('buffers the request when email hangs past emailMs budget', async () => {
      mockDeps.sendEmail = vi.fn().mockReturnValue(never());

      const promise = submitCallbackLead(validPayload, mockDeps);
      await vi.advanceTimersByTimeAsync(DELIVERY_BUDGET.emailMs);
      const result = await promise;

      expect(result.status).toBe('buffered');
    });

    it('completes delivery without waiting for hanging Telegram ping', async () => {
      mockDeps.sendEmail = vi.fn().mockResolvedValue(true);
      mockDeps.sendTelegramPing = vi.fn().mockReturnValue(never());

      const promise = submitCallbackLead(validPayload, mockDeps);
      await vi.advanceTimersByTimeAsync(DELIVERY_BUDGET.emailMs);
      const result = await promise;

      expect(result.status).toBe('delivered');
    });

    it('stops waiting when outbox write hangs past outboxMs budget and alerts', async () => {
      mockDeps.sendEmail = vi.fn().mockResolvedValue(false);
      vi.spyOn(memoryStore, 'put').mockReturnValue(never());
      mockDeps.sendAlert = vi.fn().mockReturnValue(never());

      const promise = submitCallbackLead(validPayload, mockDeps);
      await vi.advanceTimersByTimeAsync(DELIVERY_BUDGET.outboxMs + DELIVERY_BUDGET.alertMs);
      const result = await promise;

      expect(result).toMatchObject({
        status: 'fallback_office_call',
        code: 'delivery_failed',
        httpStatus: 502,
      });
    });
  });

  describe('Unexpected error handling', () => {
    it('catches unexpected exceptions and returns fallback_office_call with 500 unexpected', async () => {
      mockDeps.getMissingSmtpConfig = vi.fn().mockImplementation(() => {
        throw new Error('Fatal explosion in dependency');
      });

      const result = await submitCallbackLead(validPayload, mockDeps);
      expect(result).toMatchObject({
        status: 'fallback_office_call',
        code: 'unexpected',
        httpStatus: 500,
        message: expect.any(String),
        callNumber: expect.objectContaining({ display: expect.any(String) }),
      });
    });
  });

  describe('Default lazy dependencies', () => {
    it('lazily resolves production dependencies when none are provided', async () => {
      vi.stubEnv('CALLBACK_SMTP_HOST', 'smtp.example.com');
      vi.stubEnv('CALLBACK_SMTP_USER', 'user');
      vi.stubEnv('CALLBACK_SMTP_PASS', 'pass');

      vi.spyOn(emailModule, 'sendCallbackEmail').mockResolvedValue(true);
      vi.spyOn(telegramModule, 'sendTelegramPing').mockResolvedValue(true);
      vi.spyOn(storeModule, 'getOutboxStore').mockReturnValue(memoryStore);

      const result = await submitCallbackLead(validPayload);
      expect(result.status).toBe('delivered');
    });
  });
});
