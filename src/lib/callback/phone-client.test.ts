import { describe, it, expect } from 'vitest';
import { normalizePhoneNumberForForm } from './phone-client';
import { normalizePhoneNumber } from './phone';

describe('normalizePhoneNumberForForm (browser pre-check, smaller metadata)', () => {
  it('normalizes the same common inputs as the server', () => {
    for (const input of ['501 482 555', '(91) 48-24-190', '+48 602 235 736', '0048501482555', '+49 170 1234567']) {
      expect(normalizePhoneNumberForForm(input).normalized).toBe(normalizePhoneNumber(input).normalized);
    }
  });

  it('rejects obviously wrong input', () => {
    expect(normalizePhoneNumberForForm('').valid).toBe(false);
    expect(normalizePhoneNumberForForm('123').valid).toBe(false);
    expect(normalizePhoneNumberForForm('abcdefghi').valid).toBe(false);
  });

  it('is looser than the server: unassigned prefixes pass here and get a 400 from the API', () => {
    expect(normalizePhoneNumberForForm('112345678').valid).toBe(true);
    expect(normalizePhoneNumber('112345678').valid).toBe(false);
  });
});
