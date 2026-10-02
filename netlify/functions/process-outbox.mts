/**
 * Netlify Scheduled Function: Retries failed callback emails every 10 minutes.
 */

import { processOutbox, getOutboxStore } from '../../src/lib/outbox';
import { sendCallbackEmail } from '../../src/lib/notify/email';
import { sendTelegramAlert } from '../../src/lib/notify/telegram';

export default async () => {
  const store = getOutboxStore();

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
      onExpire: async (record) => {
        await sendTelegramAlert(
          `⚠️ Zgłoszenie #${record.id} wygasło po przekroczeniu czasu retencji (72h) bez skutecznego doręczenia.`
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
