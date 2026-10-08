/**
 * Shared phone normalization logic. The metadata set is injected so the server can use the strict
 * "max" set (phone.ts) while the browser uses the much smaller "min" set (phone-client.ts).
 */

import type { CountryCode, PhoneNumber } from 'libphonenumber-js';

export interface PhoneValidationResult {
  valid: boolean;
  normalized: string; // E.164 formatted string (+48XXXXXXXXX) or empty if invalid
  display: string;    // Human-readable: national format for PL ("501 482 555"), international otherwise
  error?: string;     // Polish message (server responses, emails)
  errorCode?: PhoneErrorCode; // for the form to show the message in the visitor's language
}

export type PhoneErrorCode = 'phone_required' | 'phone_invalid';

type Parse = (text: string, defaultCountry: CountryCode) => PhoneNumber | undefined;

export function createPhoneNormalizer(parse: Parse) {
  return function normalize(raw: string): PhoneValidationResult {
    if (!raw || typeof raw !== 'string' || raw.trim() === '') {
      return { valid: false, normalized: '', display: '', error: 'Numer telefonu jest wymagany', errorCode: 'phone_required' };
    }

    // Numbers without a country code are treated as Polish
    const parsed = parse(raw.trim(), 'PL');

    if (!parsed || !parsed.isValid()) {
      return {
        valid: false,
        normalized: '',
        display: '',
        error: 'Wprowadź poprawny numer telefonu (np. 501 482 555)',
        errorCode: 'phone_invalid',
      };
    }

    const display = parsed.country === 'PL' ? parsed.formatNational() : parsed.formatInternational();
    return { valid: true, normalized: parsed.number, display };
  };
}
