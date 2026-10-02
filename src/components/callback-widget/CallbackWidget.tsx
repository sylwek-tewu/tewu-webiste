"use client";

import React, { useState, useEffect, useTransition } from 'react';
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
import { pushCallbackRequestSubmit } from './analytics';
import { CALLBACK_SLOTS, CALLBACK_TOPICS, CallbackSlot, CallbackTopic } from '@/lib/callback/types';
import { normalizePhoneNumber } from '@/lib/callback/phone';
import { getCallNumber } from '@/lib/callback/call-number';
import { getCallbackMessage, isOfficeOpen } from '@/lib/callback/business-hours';
import classes from './CallbackWidget.module.css';

export default function CallbackWidget() {
  const { isOpen, source, openWidget, closeWidget } = useCallbackWidget();

  const [phone, setPhone] = useState('');
  const [slot, setSlot] = useState<CallbackSlot>('asap');
  const [topic, setTopic] = useState<CallbackTopic | ''>('');
  const [honeypot, setHoneypot] = useState('');
  const [formOpenedAt, setFormOpenedAt] = useState<number>(Date.now());

  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [officeOpen, setOfficeOpen] = useState(false);
  const callInfo = getCallNumber();

  // Update office open status and timestamp when widget opens
  useEffect(() => {
    if (isOpen) {
      setFormOpenedAt(Date.now());
      setSubmitError(null);
      setPhoneError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    setOfficeOpen(isOfficeOpen());
    const interval = setInterval(() => {
      setOfficeOpen(isOfficeOpen());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const promisePreview = getCallbackMessage(slot);

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
    closeWidget();
    if (submitSuccess) {
      resetForm();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);
    setSubmitError(null);

    const normalized = normalizePhoneNumber(phone);
    if (!normalized.valid) {
      setPhoneError(normalized.error || 'Wprowadź poprawny numer telefonu');
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: normalized.normalized,
            slot,
            topic: topic || undefined,
            source,
            honeypot,
            formOpenedAt,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          pushCallbackRequestSubmit({
            source,
            topic: topic || undefined,
            time_slot: slot,
            delivery: data.delivery || 'direct',
          });
          setSubmitSuccess(true);
        } else {
          setSubmitError(
            data.error || `Wystąpił problem z wysłaniem zgłoszenia. Zadzwoń do nas: ${callInfo.display}`
          );
        }
      } catch {
        setSubmitError(
          `Błąd połączenia z serwerem. Zadzwoń do biura: ${callInfo.display}`
        );
      }
    });
  };

  return (
    <>
      {/* Desktop Floating Button */}
      <Box
        component="button"
        type="button"
        onClick={() => openWidget('floating')}
        className={classes.floatingButton}
        visibleFrom="sm"
        aria-label="Zamów bezpłatną wycenę - oddzwonimy"
      >
        <PhoneCall size={20} />
        <Text fw={700} size="sm">
          Bezpłatna wycena
        </Text>
      </Box>

      {/* Mobile Fixed Bottom Action Bar */}
      <Box className={classes.mobileBar} hiddenFrom="sm">
        <div className={classes.mobileBarGrid}>
          {officeOpen ? (
            <Button
              component="a"
              href={callInfo.telUri}
              variant="default"
              size="md"
              radius="md"
              leftSection={<Phone size={18} color="var(--mantine-color-green-7)" />}
              fw={700}
            >
              Zadzwoń
            </Button>
          ) : (
            <Button
              variant="default"
              size="md"
              radius="md"
              disabled
              leftSection={<Clock size={16} />}
              title="Biuro czynne pn–pt 8:00–16:00"
            >
              8:00–16:00
            </Button>
          )}

          <Button
            onClick={() => openWidget('floating')}
            size="md"
            radius="md"
            fw={700}
            bg="brandBlue.6"
            leftSection={<PhoneCall size={18} />}
          >
            Oddzwońcie
          </Button>
        </div>
      </Box>

      {/* Callback Modal Dialog */}
      <Modal
        opened={isOpen}
        onClose={handleClose}
        title={
          <Group gap="xs">
            <PhoneCall size={20} color="var(--mantine-color-brandBlue-6)" />
            <Text fw={800} size="lg" c="slate.9">
              {submitSuccess ? 'Zgłoszenie przyjęte' : 'Bezpłatna wycena – oddzwonimy'}
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
                Dziękujemy! Otrzymaliśmy Twoją prośbę.
              </Text>
              <Text size="sm" c="slate.6" maw={380} mx="auto">
                Nasz doradca skontaktuje się z Tobą telefonicznie, aby omówić szczegóły i przedstawić ofertę.
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
              Zamknij
            </Button>
          </Stack>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <Text size="sm" c="slate.6">
                Wycena w TEWU jest indywidualna i powstaje w rozmowie. Zostaw numer telefonu – oddzwonimy w wybranym terminie.
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
                label="Numer telefonu"
                placeholder="np. 501 482 555"
                required
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
                <Text size="sm" fw={600} c="slate.8" mb={6}>
                  Kiedy możemy oddzwonić?
                </Text>
                <Radio.Group
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
                              {s.label}
                            </Text>
                          </Group>
                        }
                      />
                    ))}
                  </Stack>
                </Radio.Group>
                {slot === '17-18' && (
                  <Text size="xs" c="slate.5" mt={4} pl={28}>
                    Dyżur telefoniczny po standardowych godzinach pracy biura
                  </Text>
                )}
              </div>

              {/* Reactive Promise Message */}
              <Box className={classes.promiseBox}>
                <Group gap="xs" align="flex-start" wrap="nowrap">
                  <Clock size={16} style={{ flexShrink: 0, marginTop: 2 }} color="var(--mantine-color-brandBlue-6)" />
                  <Text size="xs" fw={600} c="brandBlue.9">
                    {promisePreview.message}
                  </Text>
                </Group>
              </Box>

              {/* Topic (optional) */}
              <Select
                label="Czego dotyczy rozmowa? (opcjonalnie)"
                placeholder="Wybierz rodzaj działalności"
                size="sm"
                radius="md"
                clearable
                data={CALLBACK_TOPICS.map((t) => ({ value: t.id, label: t.label }))}
                value={topic}
                onChange={(val) => setTopic((val as CallbackTopic) || '')}
              />

              {/* Error Alert */}
              {submitError && (
                <Alert
                  color="red"
                  icon={<AlertCircle size={18} />}
                  title="Nie udało się wysłać prośby"
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
                    Zadzwoń teraz: {callInfo.display}
                  </Button>
                </Alert>
              )}

              {/* Legal RODO disclaimer */}
              <Text className={classes.rodoDisclaimer}>
                Wysyłając formularz, zgadzasz się na kontakt telefoniczny w celu przedstawienia wyceny.
                Administratorem danych jest Biuro Rachunkowe TEWU Sp. z o.o. Szczegóły znajdziesz w naszej{' '}
                <Link href="/polityka-prywatnosci" onClick={closeWidget} className={classes.rodoLink}>
                  Polityce prywatności
                </Link>
                .
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
                Poproś o kontakt
              </Button>
            </Stack>
          </form>
        )}
      </Modal>
    </>
  );
}
