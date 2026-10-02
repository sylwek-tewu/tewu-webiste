/**
 * Phone number validation and normalization utility, backed by libphonenumber-js.
 * Numbers without a country code are treated as Polish; output is E.164 (+48XXXXXXXXX).
 * Uses the full ("max") metadata so unassigned prefixes (e.g. 0…, 1… in Poland) are rejected.
 */

import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

export interface PhoneValidationResult {
  valid: boolean;
  normalized: string; // E.164 formatted string (+48XXXXXXXXX) or empty if invalid
  display: string;    // Human-readable: national format for PL ("501 482 555"), international otherwise
  error?: string;
}

export function normalizePhoneNumber(raw: string): PhoneValidationResult {
  if (!raw || typeof raw !== 'string' || raw.trim() === '') {
    return { valid: false, normalized: '', display: '', error: 'Numer telefonu jest wymagany' };
  }

  const parsed = parsePhoneNumberFromString(raw.trim(), 'PL');

  if (!parsed || !parsed.isValid()) {
    return {
      valid: false,
      normalized: '',
      display: '',
      error: 'Wprowadź poprawny numer telefonu (np. 501 482 555)',
    };
  }

  const display = parsed.country === 'PL' ? parsed.formatNational() : parsed.formatInternational();
  return { valid: true, normalized: parsed.number, display };
}

export function isValidPhoneNumber(raw: string): boolean {
  return normalizePhoneNumber(raw).valid;
}
