/**
 * Google Tag Manager / dataLayer analytics dispatcher.
 * Strictly non-PII events only.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function pushCallbackWidgetOpen(source: string): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'callback_widget_open',
    source,
  });
}

export function pushCallbackRequestSubmit(params: {
  source: string;
  topic?: string;
  time_slot: string;
  delivery: CallbackDelivery;
  landing_page?: string;
}): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'callback_request_submit',
    source: params.source,
    topic: params.topic || 'none',
    time_slot: params.time_slot,
    delivery: params.delivery,
    landing_page: params.landing_page || 'none',
  });
}

export type CallbackDelivery = 'direct' | 'buffered';

/**
 * The delivery to report as a conversion, or null when nothing was delivered.
 * Requests the server silently dropped as spam come back without `delivery`.
 */
export function getConversionDelivery(response: unknown): CallbackDelivery | null {
  if (!response || typeof response !== 'object') return null;
  const { success, delivery } = response as { success?: unknown; delivery?: unknown };
  if (success !== true) return null;
  return delivery === 'direct' || delivery === 'buffered' ? delivery : null;
}
