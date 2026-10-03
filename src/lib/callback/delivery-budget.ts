/**
 * Time budget for POST /api/callback, so the worst case (email times out, outbox write,
 * Telegram alert) stays well under the 10 s synchronous HTTP timeout limit.
 */
export const DELIVERY_BUDGET = {
  /** Email and the Telegram ping run in parallel within this window. */
  emailMs: 5000,
  outboxMs: 2000,
  alertMs: 1500,
} as const;
