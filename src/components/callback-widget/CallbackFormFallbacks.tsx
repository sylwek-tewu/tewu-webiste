"use client";

import React from 'react';
import { Modal, Loader, Group, Text, Button, Stack } from '@mantine/core';
import { Phone, RotateCw } from 'lucide-react';
import { useCallbackWidget } from './CallbackContext';
import type { ResolvedCallNumber } from '@/lib/callback/call-number';
import { reloadPage } from './reload';

/** Shown while the lazily loaded form chunk downloads. */
export function CallbackFormLoading() {
  const { isOpen, closeWidget } = useCallbackWidget();
  return (
    <Modal opened={isOpen} onClose={closeWidget} centered radius="lg" zIndex={150} withCloseButton={false}>
      <Group justify="center" gap="sm" py="md">
        <Loader size="sm" />
        <Text size="sm" c="slate.7">Ładowanie formularza…</Text>
      </Group>
    </Modal>
  );
}

function CallbackFormLoadError({ callInfo }: { callInfo: ResolvedCallNumber }) {
  const { isOpen, closeWidget } = useCallbackWidget();
  return (
    <Modal opened={isOpen} onClose={closeWidget} centered radius="lg" zIndex={150} title="Formularz chwilowo niedostępny">
      <Stack gap="md">
        <Text size="sm" c="slate.7">
          Nie udało się wczytać formularza. Zadzwoń do nas – chętnie przygotujemy wycenę przez telefon.
        </Text>
        <Button component="a" href={callInfo.telUri} leftSection={<Phone size={16} />}>
          Zadzwoń: {callInfo.display}
        </Button>
        {/* React.lazy caches the failed import; a reload fetches the current build's chunks. */}
        <Button variant="default" onClick={reloadPage} leftSection={<RotateCw size={16} />}>
          Odśwież stronę
        </Button>
      </Stack>
    </Modal>
  );
}

/** Catches a failed form chunk load (offline, stale tab after a deploy) and offers the phone number. */
export class CallbackFormErrorBoundary extends React.Component<
  { callInfo: ResolvedCallNumber; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <CallbackFormLoadError callInfo={this.props.callInfo} /> : this.props.children;
  }
}
