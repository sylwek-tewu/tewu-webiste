import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { processOutbox, getOutboxStore, getOutboxTtlHours } from '@/lib/outbox';
import { sendCallbackEmail } from '@/lib/notify/email';
import { sendTelegramAlert } from '@/lib/notify/telegram';
import { sendRateLimitedRunAlert } from '@/lib/outbox/run-alerts';

function isValidSecret(provided: string | null | undefined, expected: string): boolean {
  if (!provided) return false;
  const bufProvided = Buffer.from(provided);
  const bufExpected = Buffer.from(expected);
  if (bufProvided.length !== bufExpected.length) return false;
  return crypto.timingSafeEqual(bufProvided, bufExpected);
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Process Outbox API] CRON_SECRET is not configured in production environment.');
      return NextResponse.json(
        { error: 'Server configuration error: CRON_SECRET is required' },
        { status: 500 }
      );
    }
  }

  const authHeader = request.headers.get('authorization');
  const cronSecretHeader = request.headers.get('x-cron-secret');

  const match = authHeader ? /^bearer\s+(.+)$/i.exec(authHeader) : null;
  const bearerToken = match ? match[1].trim() : null;
  const providedSecret = bearerToken || cronSecretHeader;

  if (expectedSecret && !isValidSecret(providedSecret, expectedSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const store = getOutboxStore();
    const ttlHours = getOutboxTtlHours();

    const result = await processOutbox(
      store,
      async (record) => {
        return await sendCallbackEmail({
          id: record.id,
          phone: record.phone,
          slot: record.slot,
          topic: record.topic,
          source: record.source,
          locale: record.locale,
          createdAt: record.createdAt,
        });
      },
      {
        ttlHours,
        onExpire: async (record) => {
          await sendTelegramAlert(
            `⚠️ Zgłoszenie #${record.id} wygasło po przekroczeniu czasu retencji (${ttlHours}h) bez skutecznego doręczenia.`
          );
        },
        onCorrupt: async (id) => {
          await sendTelegramAlert(
            `🚨 Zgłoszenie #${id} w buforze awaryjnym nie dało się odczytać (zmieniony OUTBOX_ENCRYPTION_KEY?) i zostało usunięte.`
          );
        },
      }
    );

    if (result.keyMissing) {
      await sendRateLimitedRunAlert(
        'alert-key-missing',
        '🚨 Bufor awaryjny: brak OUTBOX_ENCRYPTION_KEY w środowisku serwera. Zgłoszenia czekają (nic nie usunięto) – przywróć klucz.',
        sendTelegramAlert
      );
    }
    if (result.errors > 0) {
      await sendRateLimitedRunAlert(
        'alert-store-errors',
        `⚠️ Bufor awaryjny: błędy bazy danych SQLite w ostatnim przebiegu (liczba: ${result.errors}). Zgłoszenia pozostają w buforze – sprawdź logi aplikacji.`,
        sendTelegramAlert
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[Process Outbox API] Unexpected error processing outbox:', error);
    return NextResponse.json(
      { error: 'Internal server error processing outbox' },
      { status: 500 }
    );
  }
}
