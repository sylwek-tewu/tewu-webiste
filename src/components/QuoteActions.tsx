"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import { Anchor, Button, Group, Stack, Text } from '@mantine/core';
import { COMPANY, telHref } from '@/lib/company';
import type { CallbackSource } from '@/lib/callback/types';
import { localizePath, useLocale } from '@/i18n/LocaleContext';
import { useCallbackWidget } from '@/components/callback-widget';
import { wrappingButtonStyles } from '@/components/layout/wrappingButtonStyles';
import classes from './QuoteActions.module.css';

interface QuoteActionsProps {
  variant: 'primary' | 'white';
  /** Recorded with the callback lead: which button the visitor clicked. */
  source: CallbackSource;
  justify?: 'center' | 'flex-start';
}

/** The quote button (opens the callback widget) and the office's mobile number, shown on dark backgrounds. */
export function QuoteActions({ variant, source, justify = 'center' }: QuoteActionsProps) {
  const { t, locale } = useLocale();
  const { openWidget } = useCallbackWidget();
  const contactPath = localizePath('/kontakt', locale);

  return (
    <Group justify={justify} gap="lg" wrap="wrap">
      <Button
        component={Link}
        href={contactPath}
        onClick={(e) => {
          e.preventDefault();
          openWidget(source);
        }}
        size="lg"
        radius="md"
        fw={800}
        // An explicit variant overrides the theme's default slate-9: `filled` gives the primary blue
        // with its hover colour (a `bg` prop would set the background inline and kill the hover).
        variant={variant === 'white' ? 'white' : 'filled'}
        py={10}
        styles={wrappingButtonStyles}
        rightSection={<ArrowRight size={18} />}
      >
        {t.servicePages.ctaButton}
      </Button>
      <Stack gap={4} align={justify}>
        <Group gap={8} justify={justify} c="white">
          <Phone size={20} aria-hidden="true" />
          <Text span c="brandBlue.0" className={classes.nowrap}>{t.servicePages.phonePrompt}</Text>
          <Anchor href={telHref(COMPANY.phones.mobile[0])} c="white" fw={800} fz="lg" underline="hover" className={classes.nowrap}>
            {COMPANY.phones.mobile[0].display}
          </Anchor>
        </Group>
        <Text size="sm" c="brandBlue.0" ta={justify === 'center' ? 'center' : 'left'}>{t.servicePages.phoneAnswer}</Text>
      </Stack>
    </Group>
  );
}
