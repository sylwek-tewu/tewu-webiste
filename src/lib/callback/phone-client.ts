/**
 * Browser-side phone pre-check using the smaller libphonenumber-js "min" metadata.
 * It checks length and country patterns only, so a few numbers the server's stricter check
 * rejects can pass here; the API then answers 400 with the same error message.
 */

import { parsePhoneNumberFromString } from 'libphonenumber-js/min';
import { createPhoneNormalizer } from './phone-core';

export const normalizePhoneNumberForForm = createPhoneNormalizer(parsePhoneNumberFromString);
