// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { getConversionDelivery, pushCallbackRequestSubmit } from './analytics';

describe('getConversionDelivery', () => {
  it('returns the delivery for accepted requests', () => {
    expect(getConversionDelivery({ success: true, id: 'C9F1A2', delivery: 'direct' })).toBe('direct');
    expect(getConversionDelivery({ success: true, id: 'C9F1A2', delivery: 'buffered' })).toBe('buffered');
  });

  it('returns null when the server ignored the request as spam', () => {
    expect(getConversionDelivery({ success: true, id: 'OK' })).toBeNull();
  });

  it('returns null for errors or unexpected payloads', () => {
    expect(getConversionDelivery({ error: 'x' })).toBeNull();
    expect(getConversionDelivery({ success: true, delivery: 'other' })).toBeNull();
    expect(getConversionDelivery(null)).toBeNull();
  });

  it('records the landing page of a request, or none', () => {
    window.dataLayer = [];
    pushCallbackRequestSubmit({ source: 'service', time_slot: 'asap', delivery: 'direct', landing_page: 'kpir' });
    pushCallbackRequestSubmit({ source: 'header', time_slot: 'asap', delivery: 'direct' });
    expect(window.dataLayer).toEqual([
      expect.objectContaining({ landing_page: 'kpir' }),
      expect.objectContaining({ landing_page: 'none' }),
    ]);
  });
});
