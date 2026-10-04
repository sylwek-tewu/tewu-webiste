"use client";

import React, { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import {
  Modal,
  Button,
  TextInput,
  Radio,
  Group,
  Stack,
  Text,
  Alert,
  ThemeIcon,
  Select,
  Box,
} from '@mantine/core';
import { Phone, Clock, CheckCircle2, PhoneCall, AlertCircle, Send } from 'lucide-react';
import { useCallbackWidget } from './CallbackContext';
import { getConversionDelivery, pushCallbackRequestSubmit } from './analytics';
import { CALLBACK_SLOTS, CALLBACK_TOPICS, CallbackSlot, CallbackTopic } from '@/lib/callback/types';
import { normalizePhoneNumberForForm } from '@/lib/callback/phone-client';
import type { ResolvedCallNumber } from '@/lib/callback/call-number';
import { getCallbackCommitment } from '@/lib/calendar';
import { formatCallbackCommitment } from '@/i18n/format-commitment';
import { getSubmitDelayMs } from '@/lib/callback/time-trap';
import { useLocale } from '@/i18n/LocaleContext';
import { isPhoneErrorCode, phoneErrorMessage, submitErrorMessage } from './error-messages';
import classes from './CallbackWidget.module.css';

/**
 * The callback form dialog. Loaded lazily by CallbackWidget the first time the widget opens,
 * so Modal/Select/Radio and the phone metadata stay out of the initial page bundle.
 */
export default function CallbackFormModal({ callInfo }: { callInfo: ResolvedCallNumber }) {
  const { isOpen, source, closeWidget } = useCallbackWidget();
  const { t, locale } = useLocale();

  const [phone, setPhone] = useState('');
  const [slot, setSlot] = useState<CallbackSlot>('asap');
  const [topic, setTopic] = useState<CallbackTopic | ''>('');
  const [honeypot, setHoneypot] = useState('');
  const [formOpenedAt, setFormOpenedAt] = useState<number>(() => Date.now());

  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  // Set when the form closes, so a submission still held by the anti-bot delay is not sent.
  const cancelledRef = useRef(false);


  // Reset the time-trap start and errors whenever the widget opens
  useEffect(() => {
    if (!isOpen) {
      cancelledRef.current = true;
    }
    if (isOpen) {
      setFormOpenedAt(Date.now());
      setSubmitError(null);
      setPhoneError(null);
    }
  }, [isOpen]);

  const commitment = getCallbackCommitment(slot);
  const promisePreview = formatCallbackCommitment(commitment, t.callbackWidget, locale);
  const privacyPath = locale === 'uk' ? '/uk/polityka-prywatnosci' : '/polityka-prywatnosci';

  const resetForm = () => {
    setPhone('');
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
      setPhoneError(phoneErrorMessage(normalized.errorCode, t.callbackWidget));
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
          setPhoneError(phoneErrorMessage(data.code, t.callbackWidget));
        } else {
          setSubmitError(submitErrorMessage(data.code, t.callbackWidget));
        }
      } catch {
        setSubmitError(t.callbackWidget.errors.connection);
      }
    });
  };

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <PhoneCall size={20} color="var(--mantine-color-brandBlue-6)" />
          <Text fw={800} size="lg" c="slate.9">
            {submitSuccess ? t.callbackWidget.titleSuccess : t.callbackWidget.titleNormal}
          </Text>
        </Group>
      }
      centered
      radius="lg"
      size="md"
      padding="xl"
      zIndex={150}
      trapFocus
      closeOnEscape
    >
      {submitSuccess ? (
        <Stack gap="lg" py="md" align="center" ta="center">
          <ThemeIcon size={64} radius="xl" color="green.6" bg="green.0">
            <CheckCircle2 size={36} />
          </ThemeIcon>

          <div>
            <Text fw={800} size="xl" c="slate.9" mb="xs">
              {t.callbackWidget.successTitle}
            </Text>
            <Text size="sm" c="slate.6" maw={380} mx="auto">
              {t.callbackWidget.successDesc}
            </Text>
          </div>

          <Box className={classes.promiseBox} w="100%" ta="left">
            <Group gap="xs" align="flex-start" wrap="nowrap">
              <Clock size={18} style={{ flexShrink: 0, marginTop: 2 }} color="var(--mantine-color-brandBlue-6)" />
              <Text size="sm" fw={600} c="brandBlue.9">
                {promisePreview.message}
              </Text>
            </Group>
          </Box>

          <Button onClick={handleClose} fullWidth size="md" radius="md" mt="sm" bg="slate.8">
            {t.callbackWidget.closeButton}
          </Button>
        </Stack>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Text size="sm" c="slate.6">
              {t.callbackWidget.description}
            </Text>

            {/* Honeypot field for bot trapping */}
            <input
              type="text"
              name="b_field_address"
              tabIndex={-1}
              autoComplete="off"
              style={{ display: 'none' }}
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />

            {/* Phone Input */}
            <TextInput
              label={t.callbackWidget.phoneLabel}
              placeholder={t.callbackWidget.phonePlaceholder}
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              size="md"
              radius="md"
              leftSection={<Phone size={18} color="var(--mantine-color-slate-4)" />}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (phoneError) setPhoneError(null);
              }}
              error={phoneError}
            />

            {/* Time slot preference */}
            <div>
              <Radio.Group
                label={t.callbackWidget.slotTitle}
                labelProps={{ fw: 600, c: 'slate.8', mb: 6 }}
                value={slot}
                onChange={(val) => setSlot(val as CallbackSlot)}
              >
                <Stack gap="xs">
                  {CALLBACK_SLOTS.map((s) => (
                    <Radio
                      key={s.id}
                      value={s.id}
                      label={
                        <Group gap="xs">
                          <Text size="sm" fw={500}>
                            {t.callbackWidget.slots[s.id]}
                          </Text>
                        </Group>
                      }
                    />
                  ))}
                </Stack>
              </Radio.Group>
              {slot === '17-18' && (
                <Text size="xs" c="slate.5" mt={4} pl={28}>
                  {t.callbackWidget.dutyNote}
                </Text>
              )}
            </div>

            {/* Reactive Promise Message */}
            <Box className={classes.promiseBox} aria-live="polite">
              <Group gap="xs" align="flex-start" wrap="nowrap">
                <Clock size={16} style={{ flexShrink: 0, marginTop: 2 }} color="var(--mantine-color-brandBlue-6)" />
                <Text size="xs" fw={600} c="brandBlue.9">
                  {promisePreview.message}
                </Text>
              </Group>
            </Box>

            {/* Topic (optional) */}
            <Select
              label={t.callbackWidget.topicLabel}
              placeholder={t.callbackWidget.topicPlaceholder}
              size="sm"
              radius="md"
              clearable
              data={CALLBACK_TOPICS.map((topicItem) => ({
                value: topicItem.id,
                label: t.callbackWidget.topics[topicItem.id],
              }))}
              value={topic}
              onChange={(val) => setTopic((val as CallbackTopic) || '')}
            />

            {/* Error Alert */}
            {submitError && (
              <Alert
                color="red"
                icon={<AlertCircle size={18} />}
                title={t.callbackWidget.errorTitle}
                radius="md"
              >
                <Text size="sm" mb="xs">
                  {submitError}
                </Text>
                <Button
                  component="a"
                  href={callInfo.telUri}
                  size="xs"
                  color="red"
                  variant="light"
                  leftSection={<Phone size={14} />}
                >
                  {t.callbackWidget.callNow} {callInfo.display}
                </Button>
              </Alert>
            )}

            {/* Legal RODO information notice */}
            <Text className={classes.rodoDisclaimer}>
              {t.callbackWidget.rodoPrefix}
              <Link href={privacyPath} onClick={closeWidget} className={classes.rodoLink}>
                {t.callbackWidget.rodoLink}
              </Link>
              {t.callbackWidget.rodoSuffix}
            </Text>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              radius="md"
              loading={isPending}
              bg="brandBlue.6"
              rightSection={<Send size={18} />}
              mt="xs"
            >
              {t.callbackWidget.submitButton}
            </Button>
          </Stack>
        </form>
      )}
    </Modal>
  );
}
