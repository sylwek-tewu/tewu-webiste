"use client";

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Button, Text, Box } from '@mantine/core';
import { Phone, Clock, PhoneCall } from 'lucide-react';
import { useCallbackWidget } from './CallbackContext';
import type { ResolvedCallNumber } from '@/lib/callback/call-number';
import { isOfficeOpen } from '@/lib/callback/business-hours';
import { CallbackFormErrorBoundary, CallbackFormLoading } from './CallbackFormFallbacks';
import { useLocale } from '@/i18n/LocaleContext';
import classes from './CallbackWidget.module.css';

// Separate chunk: Modal/Select/Radio and the phone-number metadata download on first open only.
const CallbackFormModal = lazy(() => import('./CallbackFormModal'));

export default function CallbackWidget({ callInfo }: { callInfo: ResolvedCallNumber }) {
  const { isOpen, openWidget } = useCallbackWidget();
  const { t } = useLocale();

  // Mount (and download) the form only after the first open; keep it mounted afterwards
  // so the modal's close animation and the entered values survive.
  const [hasOpened, setHasOpened] = useState(false);
  if (isOpen && !hasOpened) {
    setHasOpened(true);
  }

  const [officeOpen, setOfficeOpen] = useState(false);

  useEffect(() => {
    setOfficeOpen(isOfficeOpen());
    const interval = setInterval(() => {
      setOfficeOpen(isOfficeOpen());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Desktop Floating Button */}
      <Box
        component="button"
        type="button"
        onClick={() => openWidget('floating')}
        className={classes.floatingButton}
        visibleFrom="sm"
        aria-label={t.callbackWidget.titleNormal}
      >
        <PhoneCall size={20} />
        <Text fw={700} size="sm">
          {t.callbackWidget.floatingButton}
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
              {t.callbackWidget.mobileCall}
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
              {t.callbackWidget.mobileCallHours}
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
            {t.callbackWidget.mobileRequest}
          </Button>
        </div>
      </Box>

      {hasOpened && (
        <CallbackFormErrorBoundary callInfo={callInfo}>
          <Suspense fallback={<CallbackFormLoading />}>
            <CallbackFormModal callInfo={callInfo} />
          </Suspense>
        </CallbackFormErrorBoundary>
      )}
    </>
  );
}
