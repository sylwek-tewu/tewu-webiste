import type { Translations } from '@/i18n/types';
import type { CallbackErrorCode } from '@/lib/callback/types';
import type { PhoneErrorCode } from '@/lib/callback/phone-core';

type WidgetTexts = Translations['callbackWidget'];

/** The phone field's error in the visitor's language. */
export function phoneErrorMessage(code: PhoneErrorCode | undefined, t: WidgetTexts): string {
  return code === 'phone_required' ? t.phoneErrorRequired : t.phoneErrorInvalid;
}

export function isPhoneErrorCode(code: unknown): code is PhoneErrorCode {
  return code === 'phone_required' || code === 'phone_invalid';
}

/**
 * The error alert's text for an API error code. The API also sends a Polish `error` message;
 * it is not shown, so a Ukrainian visitor never gets Polish text and unknown codes stay generic.
 */
export function submitErrorMessage(code: unknown, t: WidgetTexts): string {
  switch (code as CallbackErrorCode) {
    case 'invalid_request':
      return t.errors.invalidRequest;
    case 'slot_invalid':
      return t.errors.slotInvalid;
    case 'unavailable':
      return t.errors.unavailable;
    case 'delivery_failed':
      return t.errors.deliveryFailed;
    default:
      return t.errors.unexpected;
  }
}
