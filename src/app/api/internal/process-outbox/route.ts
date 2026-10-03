import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { processOutbox, getOutboxStore, getOutboxTtlHours } from '@/lib/outbox';
import { sendCallbackEmail } from '@/lib/notify/email';
import { sendTelegramAlert } from '@/lib/notify/telegram';
import { sendRateLimitedRunAlert } from '@/lib/outbox/run-alerts';

// Per-retry limit: the SMTP socket is created at once (DNS included), so destroying it at the
// deadline ends the send. With SMTP hanging, a run takes up to this long per due record; a run
// that outlasts the 10-minute schedule is handled by the guard below and by claim().
const RETRY_EMAIL_DEADLINE_MS = 30_000;

// One run at a time in this process; store.claim() covers a second container during a deploy.
let runInProgress = false;

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

  if (runInProgress) {
    // 200, not an error status: a skipped run is expected and must not show as a failed
    // scheduled task (wget exits non-zero on 4xx/5xx).
    console.warn('[Process Outbox API] Previous run still in progress; skipping this one.');
    return NextResponse.json({ status: 'skipped', reason: 'run-in-progress' }, { status: 200 });
  }
  runInProgress = true;

  try {
    const store = getOutboxStore();
    const ttlHours = getOutboxTtlHours();

    const result = await processOutbox(
      store,
      (record) =>
        sendCallbackEmail(
          {
            id: record.id,
            phone: record.phone,
            slot: record.slot,
            topic: record.topic,
            source: record.source,
            locale: record.locale,
            createdAt: record.createdAt,
          },
          { deadlineMs: RETRY_EMAIL_DEADLINE_MS }
        ),
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

    // Counts only, no record ids or phone numbers
    console.info('[Process Outbox API] Run finished:', JSON.stringify(result));
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[Process Outbox API] Unexpected error processing outbox:', error);
    // E.g. the database cannot be opened: without an alert buffered requests would expire unnoticed.
    await sendRateLimitedRunAlert(
      'alert-run-failed',
      '🚨 Bufor awaryjny: przebieg ponawiania nie powiódł się (baza SQLite niedostępna?). Sprawdź logi aplikacji i wolumen /app/data.',
      sendTelegramAlert
    );
    return NextResponse.json(
      { error: 'Internal server error processing outbox' },
      { status: 500 }
    );
  } finally {
    runInProgress = false;
  }
}
