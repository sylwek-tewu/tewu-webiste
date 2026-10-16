"use client";

import React from 'react';
import Link from 'next/link';
import { Box, Button, Container, Text, Title } from '@mantine/core';
import { localizePath, useLocale } from '@/i18n/LocaleContext';
import { PATHS } from '@/lib/paths';

/** 404 body for both locales; rendered by src/app/global-not-found.tsx inside the locale's site shell. */
export default function NotFoundContent() {
  const { t, locale } = useLocale();

  return (
    <Box component="section" py={{ base: 64, md: 96 }} bg="slate.0">
      <Container size="sm" px="md" ta="center">
        <Text fw={900} c="brandBlue.6" fz="4rem" lh={1} mb="md">
          404
        </Text>
        <Title order={1} c="slate.9" mb="sm">
          {t.notFound.title}
        </Title>
        <Text c="slate.6" mb="xl">
          {t.notFound.description}
        </Text>
        <Button component={Link} href={localizePath(PATHS.home, locale)} radius="md" bg="brandBlue.6">
          {t.notFound.backHome}
        </Button>
      </Container>
    </Box>
  );
}
