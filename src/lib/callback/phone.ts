/**
 * Phone number validation and normalization utility.
 * Normalizes Polish 9-digit numbers to E.164 (+48XXXXXXXXX) and supports international E.164.
 */

export interface PhoneValidationResult {
  valid: boolean;
  normalized: string; // E.164 formatted string (+48XXXXXXXXX) or empty if invalid
  display: string;    // Human-readable formatted string (e.g. "501 482 555" or "+48 91 48 24 190")
  error?: string;
}

export function normalizePhoneNumber(raw: string): PhoneValidationResult {
  if (!raw || typeof raw !== 'string') {
    return { valid: false, normalized: '', display: '', error: 'Numer telefonu jest wymagany' };
  }

  // Remove whitespace, hyphens, parentheses, slashes, dots
  let cleaned = raw.trim().replace(/[\s\-()./]/g, '');

  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }

  // Case 1: 9-digit Polish number without country code
  if (/^\d{9}$/.test(cleaned)) {
    const normalized = `+48${cleaned}`;
    const display = `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`;
    return { valid: true, normalized, display };
  }

  // Case 2: 11-digit Polish number starting with 48 (without '+')
  if (/^48\d{9}$/.test(cleaned)) {
    const digits = cleaned.slice(2);
    const normalized = `+48${digits}`;
    const display = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
    return { valid: true, normalized, display };
  }

  // Case 3: Polish number with explicit +48 prefix
  if (/^\+48\d{9}$/.test(cleaned)) {
    const digits = cleaned.slice(3);
    const normalized = cleaned;
    const display = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
    return { valid: true, normalized, display };
  }

  // Case 4: International number in valid E.164 format (+ followed by 8 to 15 digits)
  if (/^\+[1-9]\d{7,14}$/.test(cleaned)) {
    return { valid: true, normalized: cleaned, display: cleaned };
  }

  return {
    valid: false,
    normalized: '',
    display: '',
    error: 'Wprowadź poprawny 9-cyfrowy numer telefonu (np. 501 482 555)',
  };
}

export function isValidPhoneNumber(raw: string): boolean {
  return normalizePhoneNumber(raw).valid;
}
