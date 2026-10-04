/**
 * API Route Handler: POST /api/callback
 * Serverless function for processing callback quote requests.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { normalizePhoneNumber } from '@/lib/callback/phone';
import { getCallNumber } from '@/lib/callback/call-number';
import { CALLBACK_TOPICS, CallbackErrorCode, CallbackSlot, CallbackTopic, toKnownSource } from '@/lib/callback/types';
import { DELIVERY_BUDGET } from '@/lib/callback/delivery-budget';
import { MIN_FILL_TIME_MS } from '@/lib/callback/time-trap';
import { getSmtpConfig, sendCallbackEmail } from '@/lib/notify/email';
import { sendTelegramPing, sendTelegramAlert } from '@/lib/notify/telegram';
import { getOutboxStore } from '@/lib/outbox/store';
import { CallbackNotificationData } from '@/lib/notify/types';
import { withTimeout } from '@/lib/timeout';

const VALID_SLOTS: CallbackSlot[] = ['asap', '8-12', '12-16', '17-18'];

// Silent "success" for spam traps. Carries no `delivery`, so the widget records no conversion.
const silentlyIgnored = () => NextResponse.json({ success: true, id: 'OK' }, { status: 200 });

function validationError(code: CallbackErrorCode, message: string) {
  return NextResponse.json({ error: message, code }, { status: 400 });
}

function errorWithCallNumber(code: CallbackErrorCode, message: string, status: number) {
  const callInfo = getCallNumber();
  return NextResponse.json(
    {
      error: `${message} ${callInfo.display}`,
      code,
      callNumber: callInfo.display,
      telUri: callInfo.telUri,
    },
    { status }
  );
}

function alert(text: string): Promise<boolean> {
  return withTimeout(sendTelegramAlert(text), DELIVERY_BUDGET.alertMs, false);
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return validationError('invalid_request', 'Nieprawidłowe dane formularza');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return validationError('invalid_request', 'Nieprawidłowe dane formularza');
  }

  try {
    // 1. Honeypot check (Antispam trap: return 200 silently without dispatching)
    if (typeof body.honeypot === 'string' && body.honeypot.trim() !== '') {
      return silentlyIgnored();
    }

    // 2. Time-trap check. The browser measures elapsed time on its own clock,
    // so visitor/server clock skew cannot drop a genuine request.
    if (typeof body.elapsedMs !== 'number' || !(body.elapsedMs >= MIN_FILL_TIME_MS)) {
      return silentlyIgnored();
    }

    // 3. Field validation
    if (typeof body.phone !== 'string' || body.phone.length > 30) {
      return validationError('phone_invalid', 'Nieprawidłowy numer telefonu');
    }
    const phoneResult = normalizePhoneNumber(body.phone);
    if (!phoneResult.valid) {
      return validationError(
        phoneResult.errorCode ?? 'phone_invalid',
        phoneResult.error || 'Wprowadź poprawny numer telefonu'
      );
    }

    if (!VALID_SLOTS.includes(body.slot as CallbackSlot)) {
      return validationError('slot_invalid', 'Wybierz poprawną preferowaną porę kontaktu');
    }

    // Only known values reach email and Telegram; anything else would be user-typed text.
    const topic: CallbackTopic | '' = CALLBACK_TOPICS.some((t) => t.id === body.topic) ? (body.topic as CallbackTopic) : '';
    const source = toKnownSource(body.source);

    // 4. Short unique ID (6 uppercase hex characters)
    const id = crypto.randomBytes(3).toString('hex').toUpperCase();
    const locale: 'pl' | 'uk' = body.locale === 'uk' ? 'uk' : 'pl';

    // 5. Without SMTP config every request would sit in the outbox until it expires.
    const smtp = getSmtpConfig();
    if (smtp.missing.length > 0) {
      console.error(`[Callback API] SMTP not configured, missing: ${smtp.missing.join(', ')}`);
      await alert(`🚨 Błąd konfiguracji: brak ustawień SMTP. Zgłoszenie #${id} odrzucone, klient zobaczył numer biura.`);
      return errorWithCallNumber('unavailable', 'Formularz jest chwilowo niedostępny. Zadzwoń:', 500);
    }

    const notificationData: CallbackNotificationData = {
      id,
      phone: phoneResult.normalized,
      slot: body.slot as CallbackSlot,
      topic,
      source,
      locale,
      createdAt: new Date().toISOString(),
    };

    // 6. Email and Telegram ping in parallel, both capped by the email budget
    const [emailSent] = await Promise.all([
      withTimeout(
        sendCallbackEmail(notificationData, { deadlineMs: DELIVERY_BUDGET.emailMs }),
        DELIVERY_BUDGET.emailMs,
        false
      ),
      withTimeout(sendTelegramPing(notificationData), DELIVERY_BUDGET.emailMs, false),
    ]);

    if (emailSent) {
      return NextResponse.json({ success: true, id, delivery: 'direct' }, { status: 200 });
    }

    // 7. Email failed -> fallback to Outbox store (SQLite persistent storage)
    console.warn(`[Callback API] Direct SMTP delivery failed for #${id}. Buffering in Outbox store.`);

    const outboxSaved = await withTimeout(
      getOutboxStore()
        .put({
          id,
          phone: notificationData.phone,
          slot: notificationData.slot,
          topic: notificationData.topic,
          source: notificationData.source,
          locale: notificationData.locale,
          createdAt: notificationData.createdAt,
          attempts: 1,
          lastAttemptAt: new Date().toISOString(),
        })
        .then(() => true)
        .catch((storeError) => {
          console.error(
            '[Callback API] Failed to buffer record in outbox:',
            storeError instanceof Error ? storeError.message : 'Unknown'
          );
          return false;
        }),
      DELIVERY_BUDGET.outboxMs,
      false
    );

    if (outboxSaved) {
      await alert(`⚠️ Awaria e-mail: zgłoszenie #${id} zapisane w buforze awaryjnym (ponowienie automatyczne).`);
      return NextResponse.json({ success: true, id, delivery: 'buffered' }, { status: 200 });
    }

    // 8. Both SMTP and Outbox failed -> return 502 with fallback office phone
    await alert(`🚨 Błąd krytyczny: zgłoszenie #${id} nie zostało doręczone ani zbuforowane. Klient zobaczył numer biura.`);
    return errorWithCallNumber('delivery_failed', 'Nie udało się wysłać prośby. Zadzwoń:', 502);
  } catch (error) {
    console.error('[Callback API] Unexpected error:', error instanceof Error ? error.message : 'Unknown');
    return errorWithCallNumber('unexpected', 'Wystąpił nieoczekiwany błąd. Zadzwoń do nas:', 500);
  }
}
