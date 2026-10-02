/**
 * Authoritative phone validation for the server, backed by libphonenumber-js "max" metadata,
 * which rejects unassigned prefixes (e.g. 0…, 1… in Poland). Output is E.164 (+48XXXXXXXXX).
 * Browser code should use phone-client.ts instead to keep the bundle small.
 */

import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import { createPhoneNormalizer } from './phone-core';

export type { PhoneValidationResult } from './phone-core';

export const normalizePhoneNumber = createPhoneNormalizer(parsePhoneNumberFromString);

export function isValidPhoneNumber(raw: string): boolean {
  return normalizePhoneNumber(raw).valid;
}
