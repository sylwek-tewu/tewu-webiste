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
  delivery: 'direct' | 'buffered';
}): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'callback_request_submit',
    source: params.source,
    topic: params.topic || 'none',
    time_slot: params.time_slot,
    delivery: params.delivery,
  });
}
