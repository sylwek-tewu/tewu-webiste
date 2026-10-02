/**
 * Netlify Scheduled Function: Retries failed callback emails every 10 minutes.
 */

import { processOutbox, NetlifyBlobsOutboxStore, getOutboxTtlHours } from '../../src/lib/outbox';
import { sendCallbackEmail } from '../../src/lib/notify/email';
import { sendTelegramAlert } from '../../src/lib/notify/telegram';
import { sendRateLimitedRunAlert } from '../../src/lib/outbox/run-alerts';

export default async () => {
  // Always Blobs: this esbuild-bundled function may not get NODE_ENV=production or NETLIFY* at
  // runtime, and the in-memory fallback would silently process an empty outbox.
  const store = new NetlifyBlobsOutboxStore();
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
      '🚨 Bufor awaryjny: brak OUTBOX_ENCRYPTION_KEY w środowisku funkcji. Zgłoszenia czekają (nic nie usunięto) – przywróć klucz.',
      sendTelegramAlert
    );
  }
  if (result.errors > 0) {
    await sendRateLimitedRunAlert(
      'alert-store-errors',
      `⚠️ Bufor awaryjny: błędy odczytu/zapisu Netlify Blobs w ostatnim przebiegu (liczba: ${result.errors}). Zgłoszenia pozostają w buforze – sprawdź logi funkcji.`,
      sendTelegramAlert
    );
  }

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const config = {
  schedule: '*/10 * * * *',
};
