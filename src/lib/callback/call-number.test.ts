import { describe, it, expect } from 'vitest';
import { getCallNumber, DEFAULT_OFFICE_CALL_NUMBER } from './call-number';

describe('getCallNumber', () => {
  it('returns default landline number when env is empty or undefined', () => {
    const res = getCallNumber(undefined);
    expect(res.raw).toBe(DEFAULT_OFFICE_CALL_NUMBER);
    expect(res.telUri).toBe('tel:+48914824190');
    expect(res.display).toBe('91 48 24 190');
  });

  it('uses env number when properly configured (mobile)', () => {
    const res = getCallNumber('+48501482555');
    expect(res.raw).toBe('+48501482555');
    expect(res.telUri).toBe('tel:+48501482555');
    expect(res.display).toBe('501 482 555');
  });

  it('formats landline numbers cleanly', () => {
    const res = getCallNumber('+48914824190');
    expect(res.raw).toBe('+48914824190');
    expect(res.display).toBe('91 48 24 190');
  });

  it('formats other landline numbers the same way as the phone validator', () => {
    const res = getCallNumber('+48 91 433 12 34');
    expect(res.raw).toBe('+48914331234');
    expect(res.display).toBe('91 433 12 34');
  });

  it('falls back to default on invalid or garbage values', () => {
    const res = getCallNumber('invalid-phone-string');
    expect(res.raw).toBe(DEFAULT_OFFICE_CALL_NUMBER);
    expect(res.telUri).toBe('tel:+48914824190');
  });
});
