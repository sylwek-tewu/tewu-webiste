"use client";

import { useState, useEffect, useRef, useTransition } from 'react';
import type React from 'react';
import type { CallbackSlot, CallbackSource, CallbackTopic } from '@/lib/callback/types';
import type { Translations, Locale } from '@/i18n';
import { normalizePhoneNumberForForm } from '@/lib/callback/phone-client';
import { getCallbackCommitment } from '@/lib/calendar';
import { formatCallbackCommitment } from '@/i18n/format-commitment';
import { getSubmitDelayMs } from '@/lib/callback/time-trap';
import { getConversionDelivery, pushCallbackRequestSubmit } from './analytics';
import { isPhoneErrorCode, phoneErrorMessage, submitErrorMessage } from './error-messages';

export interface UseCallbackFormOptions {
  isOpen: boolean;
  source: CallbackSource;
  closeWidget: () => void;
  t: Translations['callbackWidget'];
  locale: Locale;
}

export function useCallbackForm(options: UseCallbackFormOptions): {
  phone: string;
  slot: CallbackSlot;
  topic: CallbackTopic | '';
  honeypot: string;
  phoneError: string | null;
  submitError: string | null;
  submitSuccess: boolean;
  isPending: boolean;
  promiseMessage: string;
  setPhone: (val: string) => void;
  setSlot: (slot: CallbackSlot) => void;
  setTopic: (topic: CallbackTopic | '') => void;
  setHoneypot: (val: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleClose: () => void;
} {
  const { isOpen, source, closeWidget, t, locale } = options;

  const [phone, setPhoneState] = useState('');
  const [slot, setSlot] = useState<CallbackSlot>('asap');
  const [topic, setTopic] = useState<CallbackTopic | ''>('');
  const [honeypot, setHoneypot] = useState('');
  const [formOpenedAt, setFormOpenedAt] = useState<number>(() => Date.now());

  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Set when the form closes, so a submission still held by the anti-bot delay is not sent.
  // A request already sent is still handled: the server has the lead.
  const cancelledRef = useRef(false);

  // Reset the time-trap start and errors whenever the widget opens
  useEffect(() => {
    if (!isOpen) {
      cancelledRef.current = true;
    } else {
      setFormOpenedAt(Date.now());
      setSubmitError(null);
      setPhoneError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const commitment = getCallbackCommitment(slot);
  const promisePreview = formatCallbackCommitment(commitment, t, locale);
  const promiseMessage = promisePreview.message;

  const setPhone = (val: string) => {
    setPhoneState(val);
    setPhoneError((prev) => (prev ? null : prev));
  };

  const resetForm = () => {
    setPhoneState('');
    setSlot('asap');
    setTopic('');
    setHoneypot('');
    setPhoneError(null);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleClose = () => {
    cancelledRef.current = true;
    closeWidget();
    if (submitSuccess) {
      resetForm();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);
    setSubmitError(null);

    const normalized = normalizePhoneNumberForForm(phone);
    if (!normalized.valid) {
      setPhoneError(phoneErrorMessage(normalized.errorCode, t));
      return;
    }

    cancelledRef.current = false;
    startTransition(async () => {
      try {
        // Measured on the visitor's own clock, so clock skew vs. the server doesn't matter.
        // A very fast (e.g. autofilled) submission waits out the server's anti-bot minimum.
        const elapsed = Date.now() - formOpenedAt;
        const delay = getSubmitDelayMs(elapsed);
        if (delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          if (cancelledRef.current) return;
        }

        const response = await fetch('/api/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: normalized.normalized,
            slot,
            topic: topic || undefined,
            source,
            locale,
            honeypot,
            elapsedMs: elapsed + delay,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const delivery = getConversionDelivery(data);
          if (delivery) {
            pushCallbackRequestSubmit({
              source,
              topic: topic || undefined,
              time_slot: slot,
              delivery,
            });
          }
          setSubmitSuccess(true);
        } else if (isPhoneErrorCode(data.code)) {
          // A number the server's stricter check rejects
          setPhoneError(phoneErrorMessage(data.code, t));
        } else {
          setSubmitError(submitErrorMessage(data.code, t));
        }
      } catch {
        setSubmitError(t.errors.connection);
      }
    });
  };

  return {
    phone,
    slot,
    topic,
    honeypot,
    phoneError,
    submitError,
    submitSuccess,
    isPending,
    promiseMessage,
    setPhone,
    setSlot,
    setTopic,
    setHoneypot,
    handleSubmit,
    handleClose,
  };
}
