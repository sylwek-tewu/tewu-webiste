import { describe, it, expect } from 'vitest';
import { normalizePhoneNumber, isValidPhoneNumber } from './phone';

describe('normalizePhoneNumber', () => {
  it('normalizes 9-digit Polish numbers without prefix', () => {
    const res = normalizePhoneNumber('501482555');
    expect(res.valid).toBe(true);
    expect(res.normalized).toBe('+48501482555');
    expect(res.display).toBe('501 482 555');
  });

  it('handles spaces, dashes and parentheses in Polish landline numbers', () => {
    const res = normalizePhoneNumber('(91) 48-24-190');
    expect(res.valid).toBe(true);
    expect(res.normalized).toBe('+48914824190');
    expect(res.display).toBe('91 482 41 90');
  });

  it('normalizes numbers starting with 48 without plus', () => {
    const res = normalizePhoneNumber('48 501 482 555');
    expect(res.valid).toBe(true);
    expect(res.normalized).toBe('+48501482555');
  });

  it('normalizes numbers starting with +48 or 0048', () => {
    expect(normalizePhoneNumber('+48 602 235 736').normalized).toBe('+48602235736');
    expect(normalizePhoneNumber('0048 602 235 736').normalized).toBe('+48602235736');
  });

  it('accepts international numbers with plus prefix', () => {
    const res = normalizePhoneNumber('+49 170 1234567');
    expect(res.valid).toBe(true);
    expect(res.normalized).toBe('+491701234567');
    expect(res.display).toBe('+49 170 1234567');
  });

  it('rejects Polish numbers with a prefix that is not assigned', () => {
    expect(isValidPhoneNumber('012345678')).toBe(false);
    expect(isValidPhoneNumber('112345678')).toBe(false);
  });

  it('rejects invalid or too short/long numbers', () => {
    expect(isValidPhoneNumber('')).toBe(false);
    expect(isValidPhoneNumber('12345')).toBe(false);
    expect(isValidPhoneNumber('abcdefghi')).toBe(false);
    expect(isValidPhoneNumber('1234567890123456789')).toBe(false);
  });

  it('returns a Polish error message for invalid input', () => {
    expect(normalizePhoneNumber('123').error).toMatch(/numer telefonu/);
  });
});
