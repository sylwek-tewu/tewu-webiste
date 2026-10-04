/**
 * Autonomous Outbox Processing Coordinator.
 * Consolidates in-process mutex locking, retry processing, record-level alerts,
 * and rate-limited run-level alerting.
 */

import type { CallbackLead } from '@/lib/callback/types';
import type { OutboxStore, ProcessResult } from './types';
import { getOutboxStore } from './store';
import { processOutbox, getOutboxTtlHours } from './processor';
import { sendCallbackEmail } from '@/lib/notify/email';
import { sendTelegramAlert } from '@/lib/notify/telegram';
import { sendRateLimitedRunAlert } from './run-alerts';

export const RETRY_EMAIL_DEADLINE_MS = 30_000;

// One run at a time in this process; store.claim() covers a second container during a deploy.
let runInProgress = false;

export function resetCoordinatorMutex(): void {
  runInProgress = false;
}

export interface OutboxCoordinatorDependencies {
  store: OutboxStore;
  sendEmail: (record: CallbackLead) => Promise<boolean>;
  sendAlert: (text: string) => Promise<boolean>;
  ttlHours: number;
  now: () => Date;
}

export async function runOutboxProcessing(
  dependencies?: Partial<OutboxCoordinatorDependencies>
): Promise<ProcessResult | { status: 'skipped'; reason: 'run-in-progress' }> {
  if (runInProgress) {
    console.warn('[Outbox Coordinator] Previous run still in progress; skipping this one.');
    return { status: 'skipped', reason: 'run-in-progress' };
  }
  runInProgress = true;

  let currentNow = new Date();
  let store: OutboxStore | undefined;
  let sendAlert = sendTelegramAlert;

  try {
    currentNow = dependencies?.now ? dependencies.now() : new Date();
    store = dependencies?.store ?? getOutboxStore();
    const ttlHours = dependencies?.ttlHours ?? getOutboxTtlHours();
    sendAlert = dependencies?.sendAlert ?? sendTelegramAlert;
    const sendEmail =
      dependencies?.sendEmail ??
      ((record: CallbackLead) =>
        sendCallbackEmail(record, { deadlineMs: RETRY_EMAIL_DEADLINE_MS }));

    const result = await processOutbox(store, sendEmail, {
      ttlHours,
      now: currentNow,
      onExpire: async (record) => {
        try {
          await sendAlert(
            `⚠️ Zgłoszenie #${record.id} wygasło po przekroczeniu czasu retencji (${ttlHours}h) bez skutecznego doręczenia.`
          );
        } catch (error) {
          console.error(
            `[Outbox Coordinator] Failed to dispatch expiration alert for #${record.id}:`,
            error
          );
        }
      },
      onCorrupt: async (id) => {
        try {
          await sendAlert(
            `🚨 Zgłoszenie #${id} w buforze awaryjnym nie dało się odczytać (zmieniony OUTBOX_ENCRYPTION_KEY?) i zostało usunięte.`
          );
        } catch (error) {
          console.error(
            `[Outbox Coordinator] Failed to dispatch corruption alert for #${id}:`,
            error
          );
        }
      },
    });

    if (result.keyMissing) {
      await sendRateLimitedRunAlert(
        'alert-key-missing',
        '🚨 Bufor awaryjny: brak OUTBOX_ENCRYPTION_KEY w środowisku serwera. Zgłoszenia czekają (nic nie usunięto) – przywróć klucz.',
        sendAlert,
        currentNow,
        store
      );
    }

    if (result.errors > 0) {
      await sendRateLimitedRunAlert(
        'alert-store-errors',
        `⚠️ Bufor awaryjny: błędy bazy danych SQLite w ostatnim przebiegu (liczba: ${result.errors}). Zgłoszenia pozostają w buforze – sprawdź logi aplikacji.`,
        sendAlert,
        currentNow,
        store
      );
    }

    return result;
  } catch (error) {
    console.error('[Outbox Coordinator] Unexpected error processing outbox:', error);
    try {
      await sendRateLimitedRunAlert(
        'alert-run-failed',
        '🚨 Bufor awaryjny: przebieg ponawiania nie powiódł się (baza SQLite niedostępna?). Sprawdź logi aplikacji i wolumen /app/data.',
        sendAlert,
        currentNow,
        store
      );
    } catch (alertError) {
      console.error('[Outbox Coordinator] Failed to dispatch fatal alert:', alertError);
    }
    throw error;
  } finally {
    runInProgress = false;
  }
}
