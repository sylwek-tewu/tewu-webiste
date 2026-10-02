/**
 * Telegram Bot API ping dispatcher (STRICTLY NO PII / NO PHONE NUMBERS).
 */

import { CallbackNotificationData } from './types';
import { CALLBACK_SLOTS, CALLBACK_TOPICS, toKnownSource } from '../callback/types';
import { getWarsawTime } from '../callback/business-hours';

function getSlotLabel(slotId: string): string {
  const found = CALLBACK_SLOTS.find((s) => s.id === slotId);
  return found ? found.label : 'nieznana';
}

function getTopicLabel(topicId?: string): string {
  if (!topicId) return 'ogólny';
  const found = CALLBACK_TOPICS.find((t) => t.id === topicId);
  return found ? found.label : 'ogólny';
}

export function formatTelegramDate(isoString: string): string {
  const date = new Date(isoString);
  const wt = getWarsawTime(date);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(wt.day)}.${pad(wt.month)} ${pad(wt.hour)}:${pad(wt.minute)}`;
}

/**
 * Builds the strict non-PII ping message for Telegram.
 * Guarantees zero personal data (no phone numbers, no freeform text, no IPs):
 * only labels from fixed lists are used, never the raw field values.
 */
export function buildTelegramPingText(data: CallbackNotificationData): string {
  const slotLabel = getSlotLabel(data.slot);
  const topicLabel = getTopicLabel(data.topic);
  const dateStr = formatTelegramDate(data.createdAt);
  const langPrefix = data.locale === 'uk' ? '[UA] ' : '';
  const langTag = data.locale === 'uk' ? 'język: Ukraiński (UA) · ' : '';

  return (
    `${langPrefix}Nowa prośba o oddzwonienie #${data.id} · ` +
    langTag +
    `pora: ${slotLabel} · temat: ${topicLabel} · źródło: ${toKnownSource(data.source)} · ${dateStr}. ` +
    `Szczegóły i numer: w skrzynce biuro@tewu.szczecin.pl (temat maila zawiera #${data.id}).`
  );
}

export async function sendTelegramRaw(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatIds) {
    return false; // Telegram is optional; safely skipped
  }

  const ids = chatIds
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  let allOk = true;

  for (const chatId of ids) {
    let success = false;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            disable_web_page_preview: true,
          }),
          signal: AbortSignal.timeout(4000),
        });

        if (response.ok) {
          success = true;
          break;
        }

        if (response.status === 429 && attempt === 0) {
          const body = (await response.json().catch(() => ({}))) as { parameters?: { retry_after?: number } };
          const retryAfterSec = body.parameters?.retry_after ?? 1;
          if (retryAfterSec <= 2) {
            await new Promise((r) => setTimeout(r, retryAfterSec * 1000));
            continue;
          }
        }

        if (response.status >= 500 && attempt === 0) {
          await new Promise((r) => setTimeout(r, 500));
          continue;
        }

        break;
      } catch {
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 500));
        }
      }
    }

    if (!success) {
      allOk = false;
    }
  }

  return allOk;
}

/**
 * Sends a non-PII ping about a new callback request.
 */
export async function sendTelegramPing(data: CallbackNotificationData): Promise<boolean> {
  const text = buildTelegramPingText(data);
  return sendTelegramRaw(text);
}

/**
 * Sends an alert message (e.g. outbox buffering, delivery failure) with NO PII.
 */
export async function sendTelegramAlert(alertText: string): Promise<boolean> {
  return sendTelegramRaw(alertText);
}
