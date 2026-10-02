/**
 * Call number resolver for the direct "Zadzwoń" action.
 * Controlled via NEXT_PUBLIC_CALLBACK_CALL_NUMBER env variable, falling back to default +48914824190.
 */

import { normalizePhoneNumber } from './phone';

export const DEFAULT_OFFICE_CALL_NUMBER = '+48914824190'; // TEWU Sekretariat

export interface ResolvedCallNumber {
  raw: string;     // E.164 without prefix: '+48914824190'
  telUri: string;  // 'tel:+48914824190'
  display: string; // '91 48 24 190'
}

function formatPolishDisplay(e164: string): string {
  // e164 is like +48914824190 or +48501482555
  if (e164.startsWith('+48') && e164.length === 12) {
    const digits = e164.slice(3);
    // If Szczecin landline (91...): 91 48 24 190
    if (digits.startsWith('91')) {
      return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 9)}`;
    }
    // Mobile or other: 501 482 555
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  }
  return e164;
}

export function getCallNumber(envValue?: string): ResolvedCallNumber {
  const candidate = envValue !== undefined ? envValue : process.env.NEXT_PUBLIC_CALLBACK_CALL_NUMBER;

  if (candidate && typeof candidate === 'string' && candidate.trim() !== '') {
    const parsed = normalizePhoneNumber(candidate.trim());
    if (parsed.valid) {
      return {
        raw: parsed.normalized,
        telUri: `tel:${parsed.normalized}`,
        display: formatPolishDisplay(parsed.normalized),
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
    display: '91 48 24 190',
  };
}
