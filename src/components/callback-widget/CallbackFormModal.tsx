"use client";

import React from 'react';
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
import { CALLBACK_SLOTS, CALLBACK_TOPICS, type CallbackSlot, type CallbackTopic } from '@/lib/callback/types';
import type { ResolvedCallNumber } from '@/lib/callback/call-number';
import { useLocale } from '@/i18n/LocaleContext';
import { useCallbackForm } from './useCallbackForm';
import classes from './CallbackWidget.module.css';

/**
 * The callback form dialog. Loaded lazily by CallbackWidget the first time the widget opens,
 * so Modal/Select/Radio and the phone metadata stay out of the initial page bundle.
 */
export default function CallbackFormModal({ callInfo }: { callInfo: ResolvedCallNumber }) {
  const { isOpen, source, closeWidget } = useCallbackWidget();
  const { t, locale } = useLocale();

  const {
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
  } = useCallbackForm({
    callInfo,
    isOpen,
    source,
    closeWidget,
    t: t.callbackWidget,
    locale,
  });

  const privacyPath = locale === 'uk' ? '/uk/polityka-prywatnosci' : '/polityka-prywatnosci';

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
                {promiseMessage}
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
              onChange={(e) => setPhone(e.target.value)}
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
                  {promiseMessage}
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
