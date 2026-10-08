/**
 * Call number resolver for the direct "Zadzwoń" action.
 * Controlled via NEXT_PUBLIC_CALLBACK_CALL_NUMBER env variable, falling back to default +48914824190.
 */

// Pulls in libphonenumber metadata: call this on the server (the root layout passes the result
// to the widget as a prop) or in lazily loaded code, not in the always-loaded client bundle.
import { normalizePhoneNumber } from './phone';
import { CONTACT_DETAILS } from '@/constants';

export const DEFAULT_OFFICE_CALL_NUMBER = '+48914824190'; // TEWU Sekretariat

export interface ResolvedCallNumber {
  raw: string;     // E.164 without prefix: '+48914824190'
  telUri: string;  // 'tel:+48914824190'
  display: string; // '91 48 24 190'
}

// The office's own number keeps the house style used across the site.
function formatDisplay(e164: string, libraryDisplay: string): string {
  return e164 === DEFAULT_OFFICE_CALL_NUMBER ? CONTACT_DETAILS.phone : libraryDisplay;
}

export function getCallNumber(envValue?: string): ResolvedCallNumber {
  const candidate = envValue !== undefined ? envValue : process.env.NEXT_PUBLIC_CALLBACK_CALL_NUMBER;

  if (candidate && typeof candidate === 'string' && candidate.trim() !== '') {
    const parsed = normalizePhoneNumber(candidate.trim());
    if (parsed.valid) {
      return {
        raw: parsed.normalized,
        telUri: `tel:${parsed.normalized}`,
        display: formatDisplay(parsed.normalized, parsed.display),
      };
    }
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[CallbackWidget] Invalid NEXT_PUBLIC_CALLBACK_CALL_NUMBER: "${candidate}". Falling back to default ${DEFAULT_OFFICE_CALL_NUMBER}.`
      );
    }
  }

  return {
    raw: DEFAULT_OFFICE_CALL_NUMBER,
    telUri: `tel:${DEFAULT_OFFICE_CALL_NUMBER}`,
    display: CONTACT_DETAILS.phone,
  };
}
