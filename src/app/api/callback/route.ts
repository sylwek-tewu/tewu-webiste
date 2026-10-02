/**
 * API Route Handler: POST /api/callback
 * Serverless function for processing callback quote requests.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { normalizePhoneNumber } from '@/lib/callback/phone';
import { getCallNumber } from '@/lib/callback/call-number';
import { CallbackSlot } from '@/lib/callback/types';
import { sendCallbackEmail } from '@/lib/notify/email';
import { sendTelegramPing, sendTelegramAlert } from '@/lib/notify/telegram';
import { getOutboxStore } from '@/lib/outbox/store';
import { CallbackNotificationData } from '@/lib/notify/types';

const VALID_SLOTS: CallbackSlot[] = ['asap', '8-12', '12-16', '17-18'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Honeypot check (Antispam trap: return 200 silently without dispatching)
    if (body.honeypot && typeof body.honeypot === 'string' && body.honeypot.trim() !== '') {
      return NextResponse.json({ success: true, id: 'OK' }, { status: 200 });
    }

    // 2. Time-trap check (Submission must not be unrealistically fast, < 2 seconds)
    if (body.formOpenedAt && typeof body.formOpenedAt === 'number') {
      const durationMs = Date.now() - body.formOpenedAt;
      if (durationMs < 2000) {
        return NextResponse.json({ success: true, id: 'OK' }, { status: 200 });
      }
    }

    // 3. Field length limits
    if (typeof body.phone !== 'string' || body.phone.length > 30) {
      return NextResponse.json({ error: 'Nieprawidłowy numer telefonu' }, { status: 400 });
    }
    if (body.topic && (typeof body.topic !== 'string' || body.topic.length > 50)) {
      return NextResponse.json({ error: 'Nieprawidłowy format tematu' }, { status: 400 });
    }
    if (body.source && (typeof body.source !== 'string' || body.source.length > 50)) {
      return NextResponse.json({ error: 'Nieprawidłowy format źródła' }, { status: 400 });
    }

    // 4. Server-side validation
    const phoneResult = normalizePhoneNumber(body.phone);
    if (!phoneResult.valid) {
      return NextResponse.json(
        { error: phoneResult.error || 'Wprowadź poprawny numer telefonu' },
        { status: 400 }
      );
    }

    if (!VALID_SLOTS.includes(body.slot)) {
      return NextResponse.json(
        { error: 'Wybierz poprawną preferowaną porę kontaktu' },
        { status: 400 }
      );
    }

    // 5. Generate short unique ID (6 uppercase alphanumeric characters)
    const id = crypto.randomBytes(3).toString('hex').toUpperCase();

    const notificationData: CallbackNotificationData = {
      id,
      phone: phoneResult.normalized,
      slot: body.slot,
      topic: body.topic || '',
      source: body.source || 'widget',
      createdAt: new Date().toISOString(),
    };

    // 6. Dispatch email and telegram ping in parallel
    const [emailRes] = await Promise.allSettled([
      sendCallbackEmail(notificationData),
      sendTelegramPing(notificationData),
    ]);

    const emailSent = emailRes.status === 'fulfilled' && emailRes.value === true;

    if (emailSent) {
      return NextResponse.json(
        { success: true, id, delivery: 'direct' },
        { status: 200 }
      );
    }

    // 7. Email failed -> fallback to Outbox store (Netlify Blobs)
    console.warn(`[Callback API] Direct SMTP delivery failed for #${id}. Buffering in Outbox store.`);

    const store = getOutboxStore();
    let outboxSaved = false;

    try {
      await store.put({
        id,
        phone: notificationData.phone,
        slot: notificationData.slot,
        topic: notificationData.topic,
        source: notificationData.source,
        createdAt: notificationData.createdAt,
        attempts: 1,
        lastAttemptAt: new Date().toISOString(),
      });
      outboxSaved = true;
    } catch (storeError) {
      console.error('[Callback API] Failed to buffer record in outbox:', storeError instanceof Error ? storeError.message : 'Unknown');
    }

    if (outboxSaved) {
      // Notify Telegram of buffering without any personal data
      await sendTelegramAlert(
        `⚠️ Awaria e-mail: zgłoszenie #${id} zapisane w buforze awaryjnym (ponowienie automatyczne).`
      );

      return NextResponse.json(
        { success: true, id, delivery: 'buffered' },
        { status: 200 }
      );
    }

    // 8. Both SMTP and Outbox failed -> return 502 with fallback office phone
    const callInfo = getCallNumber();
    await sendTelegramAlert(
      `🚨 Błąd krytyczny: zgłoszenie #${id} nie zostało doręczone ani zbuforowane. Klient zobaczył numer biura.`
    );

    return NextResponse.json(
      {
        error: `Nie udało się wysłać prośby. Zadzwoń: ${callInfo.display}`,
        callNumber: callInfo.display,
        telUri: callInfo.telUri,
      },
      { status: 502 }
    );
  } catch (error) {
    console.error('[Callback API] Unexpected error:', error instanceof Error ? error.message : 'Unknown');
    const callInfo = getCallNumber();
    return NextResponse.json(
      {
        error: `Wystąpił nieoczekiwany błąd. Zadzwoń do nas: ${callInfo.display}`,
        callNumber: callInfo.display,
        telUri: callInfo.telUri,
      },
      { status: 500 }
    );
  }
}
