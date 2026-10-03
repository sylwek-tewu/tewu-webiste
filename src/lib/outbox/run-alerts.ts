/**
 * Rate-limited alerts about a whole outbox run (missing key, recurring store errors), so a
 * persistent problem is reported without a Telegram message every 10 minutes.
 */

import { getStore } from '@netlify/blobs';

export const RUN_ALERT_INTERVAL_MS = 6 * 60 * 60 * 1000;

// Separate store, so these keys never show up as outbox records.
const META_STORE = 'callback-outbox-meta';

export function shouldSendRunAlert(lastAlertAt: string | null, now: Date): boolean {
  if (!lastAlertAt) return true;
  const last = Date.parse(lastAlertAt);
  return Number.isNaN(last) || now.getTime() - last >= RUN_ALERT_INTERVAL_MS;
}

/** Sends `text` unless an alert with the same key went out within RUN_ALERT_INTERVAL_MS. */
export async function sendRateLimitedRunAlert(
  key: string,
  text: string,
  send: (text: string) => Promise<boolean>,
  now: Date = new Date()
): Promise<void> {
  const meta = getStore({ name: META_STORE, consistency: 'strong' });
  const lastAlertAt = await meta.get(key, { type: 'text' });
  if (!shouldSendRunAlert(lastAlertAt, now)) return;
  if (await send(text)) {
    await meta.set(key, now.toISOString());
  }
}
