/**
 * Netlify Scheduled Function: Retries failed callback emails every 10 minutes.
 */

import { processOutbox, NetlifyBlobsOutboxStore, getOutboxTtlHours } from '../../src/lib/outbox';
import { sendCallbackEmail } from '../../src/lib/notify/email';
import { sendTelegramAlert } from '../../src/lib/notify/telegram';

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

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const config = {
  schedule: '*/10 * * * *',
};
