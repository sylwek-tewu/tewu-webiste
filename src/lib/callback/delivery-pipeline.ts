/**
 * Deep Callback Intake & Delivery Pipeline (`submitCallbackLead`).
 *
 * Consolidates intake validation, antispam traps (honeypot, elapsed time trap),
 * E.164 phone normalization, dual-channel dispatch (parallel SMTP + Telegram ping),
 * resilient fallback to Outbox store on email failure, and operational Telegram alerts.
 */

import crypto from 'node:crypto';
import { normalizePhoneNumber } from './phone';
import { getCallNumber, ResolvedCallNumber } from './call-number';
import {
  CALLBACK_TOPICS,
  CallbackErrorCode,
  CallbackLead,
  CallbackSlot,
  CallbackTopic,
  Locale,
  toKnownSource,
} from './types';
import { DELIVERY_BUDGET } from './delivery-budget';
import { MIN_FILL_TIME_MS } from './time-trap';
import { getSmtpConfig, sendCallbackEmail } from '@/lib/notify/email';
import { sendTelegramPing, sendTelegramAlert } from '@/lib/notify/telegram';
import { getOutboxStore } from '@/lib/outbox/store';
import type { OutboxStore } from '@/lib/outbox/types';
import { withTimeout } from '@/lib/timeout';

const VALID_SLOTS: CallbackSlot[] = ['asap', '8-12', '12-16', '17-18'];

export interface CallbackDeliveryDependencies {
  sendEmail: (lead: CallbackLead, options?: { deadlineMs?: number }) => Promise<boolean>;
  sendTelegramPing: (lead: CallbackLead) => Promise<boolean>;
  sendAlert: (message: string) => Promise<boolean>;
  outboxStore: OutboxStore;
  /** Names of the SMTP settings that are not set; empty when email can be sent. */
  getMissingSmtpConfig: () => string[];
  getCallNumber: () => ResolvedCallNumber;
}

export type CallbackSubmissionResult =
  | { status: 'delivered'; id: string }
  | { status: 'buffered'; id: string }
  | { status: 'silently_ignored' }
  | { status: 'validation_error'; code: CallbackErrorCode; message: string }
  | {
      status: 'fallback_office_call';
      code: 'unavailable' | 'delivery_failed' | 'unexpected';
      message: string;
      httpStatus: 500 | 502;
      callNumber: ResolvedCallNumber;
    };

/**
 * Processes a callback lead submission through validation, antispam traps,
 * and dual delivery (SMTP + Telegram) with Outbox fallback.
 */
export async function submitCallbackLead(
  payload: unknown,
  dependencies?: Partial<CallbackDeliveryDependencies>
): Promise<CallbackSubmissionResult> {
  const getCallNum = dependencies?.getCallNumber ?? getCallNumber;

  try {
    // The parsed request body: a string here is a double-encoded form, not one to parse again.
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return {
        status: 'validation_error',
        code: 'invalid_request',
        message: 'Nieprawidłowe dane formularza',
      };
    }

    const record = payload as Record<string, unknown>;

    // 1. Honeypot check (Antispam trap: return silently without dispatching)
    if (typeof record.honeypot === 'string' && record.honeypot.trim() !== '') {
      return { status: 'silently_ignored' };
    }

    // 2. Time-trap check (Visitor's elapsed clock must satisfy MIN_FILL_TIME_MS)
    if (
      typeof record.elapsedMs !== 'number' ||
      Number.isNaN(record.elapsedMs) ||
      record.elapsedMs < MIN_FILL_TIME_MS
    ) {
      return { status: 'silently_ignored' };
    }

    // 3. Field validation
    if (typeof record.phone !== 'string' || record.phone.length > 30) {
      return {
        status: 'validation_error',
        code: 'phone_invalid',
        message: 'Nieprawidłowy numer telefonu',
      };
    }

    const phoneResult = normalizePhoneNumber(record.phone);
    if (!phoneResult.valid) {
      return {
        status: 'validation_error',
        code: phoneResult.errorCode ?? 'phone_invalid',
        message: phoneResult.error || 'Wprowadź poprawny numer telefonu',
      };
    }

    if (!VALID_SLOTS.includes(record.slot as CallbackSlot)) {
      return {
        status: 'validation_error',
        code: 'slot_invalid',
        message: 'Wybierz poprawną preferowaną porę kontaktu',
      };
    }

    // Sanitize topic and source to known whitelist
    const topic: CallbackTopic | '' = CALLBACK_TOPICS.some((t) => t.id === record.topic)
      ? (record.topic as CallbackTopic)
      : '';
    const source = toKnownSource(record.source);
    const locale: Locale = record.locale === 'uk' ? 'uk' : 'pl';

    // 4. Short unique ID (6 uppercase hex characters)
    const id = crypto.randomBytes(3).toString('hex').toUpperCase();

    // 5. Dependency resolution (lazy evaluated defaults)
    const getMissingSmtpConfig = dependencies?.getMissingSmtpConfig ?? (() => getSmtpConfig().missing);
    const emailSender = dependencies?.sendEmail ?? sendCallbackEmail;
    const pingSender = dependencies?.sendTelegramPing ?? sendTelegramPing;
    const alertSender = dependencies?.sendAlert ?? sendTelegramAlert;

    const alert = (text: string): Promise<boolean> => {
      return withTimeout(alertSender(text), DELIVERY_BUDGET.alertMs, false);
    };

    const missingSmtpConfig = getMissingSmtpConfig();
    if (missingSmtpConfig.length > 0) {
      console.error(`[Callback Pipeline] SMTP not configured, missing: ${missingSmtpConfig.join(', ')}`);
      const callNumber = getCallNum();
      await alert(
        `🚨 Błąd konfiguracji: brak ustawień SMTP. Zgłoszenie #${id} odrzucone, klient zobaczył numer biura.`
      );
      return {
        status: 'fallback_office_call',
        code: 'unavailable',
        message: 'Formularz jest chwilowo niedostępny. Zadzwoń:',
        httpStatus: 500,
        callNumber,
      };
    }

    const lead: CallbackLead = {
      id,
      phone: phoneResult.normalized,
      slot: record.slot as CallbackSlot,
      topic,
      source,
      locale,
      createdAt: new Date().toISOString(),
    };

    // 6. Email and Telegram ping in parallel, both capped by the email budget
    const [emailSent] = await Promise.all([
      withTimeout(
        emailSender(lead, { deadlineMs: DELIVERY_BUDGET.emailMs }),
        DELIVERY_BUDGET.emailMs,
        false
      ),
      withTimeout(pingSender(lead), DELIVERY_BUDGET.emailMs, false),
    ]);

    if (emailSent) {
      return { status: 'delivered', id };
    }

    // 7. Email failed -> fallback to Outbox store (SQLite persistent storage)
    console.warn(`[Callback Pipeline] Direct SMTP delivery failed for #${id}. Buffering in Outbox store.`);

    const store = dependencies?.outboxStore ?? getOutboxStore();
    const outboxSaved = await withTimeout(
      Promise.resolve()
        .then(() =>
          store.put({
            id: lead.id,
            phone: lead.phone,
            slot: lead.slot,
            topic: lead.topic,
            source: lead.source,
            locale: lead.locale,
            createdAt: lead.createdAt,
            attempts: 1,
            lastAttemptAt: new Date().toISOString(),
          })
        )
        .then(() => true)
        .catch((storeError) => {
          console.error(
            '[Callback Pipeline] Failed to buffer record in outbox:',
            storeError instanceof Error ? storeError.message : 'Unknown'
          );
          return false;
        }),
      DELIVERY_BUDGET.outboxMs,
      false
    );

    if (outboxSaved) {
      await alert(
        `⚠️ Awaria e-mail: zgłoszenie #${id} zapisane w buforze awaryjnym (ponowienie automatyczne).`
      );
      return { status: 'buffered', id };
    }

    // 8. Both SMTP and Outbox failed -> return 502 with fallback office phone
    await alert(
      `🚨 Błąd krytyczny: zgłoszenie #${id} nie zostało doręczone ani zbuforowane. Klient zobaczył numer biura.`
    );
    const callNumber = getCallNum();
    return {
      status: 'fallback_office_call',
      code: 'delivery_failed',
      message: 'Nie udało się wysłać prośby. Zadzwoń:',
      httpStatus: 502,
      callNumber,
    };
  } catch (error) {
    console.error(
      '[Callback Pipeline] Unexpected error:',
      error instanceof Error ? error.message : 'Unknown'
    );
    return {
      status: 'fallback_office_call',
      code: 'unexpected',
      message: 'Wystąpił nieoczekiwany błąd. Zadzwoń do nas:',
      httpStatus: 500,
      callNumber: getCallNum(),
    };
  }
}
