/**
 * Runs once when the Next.js server starts. Opens the outbox database (and applies migrations) at
 * boot, so a broken volume or wrong permissions show up right after a deploy instead of only when
 * SMTP is already down and a request needs buffering. The site itself keeps serving either way.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.NODE_ENV !== 'production') return;
  if (process.env.NEXT_PHASE === 'phase-production-build') return;

  const { getDb } = await import('@/db');
  const { sendTelegramAlert } = await import('@/lib/notify/telegram');
  try {
    getDb();
  } catch (error) {
    console.error('[Startup] Outbox database could not be opened:', error);
    await sendTelegramAlert(
      '🚨 Start serwera: nie udało się otworzyć bazy bufora awaryjnego (SQLite). Zgłoszenia nie będą buforowane przy awarii poczty – sprawdź wolumen /app/data.'
    );
  }
}
