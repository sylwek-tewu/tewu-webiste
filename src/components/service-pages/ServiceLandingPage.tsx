"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Award, Briefcase, Building2, CheckCircle2, Handshake, Phone, ShieldCheck } from 'lucide-react';
import { Anchor, Box, Button, Container, Flex, Group, List, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { CONTACT_DETAILS } from '@/constants';
import { useLocale } from '@/i18n/LocaleContext';
import { useCallbackWidget } from '@/components/callback-widget';
import { wrappingButtonStyles } from '@/components/layout/wrappingButtonStyles';
import type { ServicePageContent } from '@/content/service-pages/types';
import classes from './ServiceLandingPage.module.css';

/** The quote button (opens the callback widget) and the office's mobile number, shown on dark backgrounds. */
function QuoteActions({ variant }: { variant: 'primary' | 'white' }) {
  const { t, locale } = useLocale();
  const { openWidget } = useCallbackWidget();
  const contactPath = locale === 'uk' ? '/uk/kontakt' : '/kontakt';

  return (
    <Group justify="center" gap="lg" wrap="wrap">
      <Button
        component={Link}
        href={contactPath}
        onClick={(e) => {
          e.preventDefault();
          openWidget('service');
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
      <Group gap={8} justify="center" c="white">
        <Phone size={20} aria-hidden="true" />
        <Text span c="slate.2" style={{ whiteSpace: 'nowrap' }}>{t.servicePages.phonePrompt}</Text>
        <Anchor href={`tel:${CONTACT_DETAILS.mobilePhoneE164}`} c="white" fw={800} fz="lg" underline="hover" style={{ whiteSpace: 'nowrap' }}>
          {CONTACT_DETAILS.mobilePhone}
        </Anchor>
      </Group>
    </Group>
  );
}

function CheckList({ title, items }: { title: string; items: string[] }) {
  return (
    <Box>
      <Title order={2} fw={900} c="slate.9" mb="lg" fz={{ base: 'xl', md: '1.75rem' }}>
        {title}
      </Title>
      <List
        spacing="sm"
        icon={
          <ThemeIcon size={22} variant="transparent" c="green.6">
            <CheckCircle2 size={20} />
          </ThemeIcon>
        }
      >
        {items.map((item) => (
          <List.Item key={item}>
            <Text c="slate.7">{item}</Text>
          </List.Item>
        ))}
      </List>
    </Box>
  );
}

function TrustItem({ icon, value, label }: { icon: React.ReactNode; value?: string; label: React.ReactNode }) {
  return (
    // Icon above the text on phones: next to it, long Ukrainian words („відповідальності”) do not fit a half-width column.
    <Flex gap="sm" direction={{ base: 'column', sm: 'row' }} align={{ base: 'flex-start', sm: 'center' }}>
      <ThemeIcon size={40} radius="xl" variant="light">
        {icon}
      </ThemeIcon>
      <Box miw={0}>
        {value && (
          <Text fw={900} c="slate.9" lh={1.1}>
            {value}
          </Text>
        )}
        <Text size="sm" c="slate.6" lh={1.3}>
          {label}
        </Text>
      </Box>
    </Flex>
  );
}

export default function ServiceLandingPage({ content }: { content: ServicePageContent }) {
  const { t, locale } = useLocale();
  const stats = t.home.hero.stats;
  const certificatesPath = locale === 'uk' ? '/uk/certyfikaty' : '/certyfikaty';

  return (
    <Stack gap={0} bg="white">
      <Box component="section" bg="slate.9" py={{ base: 64, md: 96 }} ta="center">
        <Container size="md" px="md">
          <Title order={1} c="white" fw={900} mb="md" style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', letterSpacing: '-0.025em' }}>
            {content.hero.title}
          </Title>
          <Text size="xl" c="slate.4" mb="xl">
            {content.hero.lead}
          </Text>
          <QuoteActions variant="primary" />
        </Container>
      </Box>

      <Box component="section" py="xl" bg="slate.0">
        <Container size="xl" px="md">
          {/* Narrower gap on phones: at 320 px „Zadowolonych firm” overflows its column with `lg` */}
          <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }} spacing={{ base: 'md', md: 'lg' }}>
            {/* TEWU's own answer to "what convinces clients most" (A9), so it goes first */}
            <TrustItem icon={<Handshake size={20} />} label={t.servicePages.trust.directContact} />
            <TrustItem icon={<Briefcase size={20} />} value={stats.yearsCount} label={stats.yearsLabel} />
            <TrustItem icon={<Building2 size={20} />} value={stats.companiesCount} label={stats.companiesLabel} />
            <TrustItem icon={<ShieldCheck size={20} />} label={t.servicePages.trust.insurance} />
            <TrustItem
              icon={<Award size={20} />}
              label={
                <Anchor component={Link} href={certificatesPath} c="brandBlue.7" underline="hover">
                  {t.servicePages.trust.certificates}
                </Anchor>
              }
            />
          </SimpleGrid>
        </Container>
      </Box>

      <Box component="section" py={{ base: 64, md: 96 }}>
        <Container size="xl" px="md">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={48}>
            <CheckList title={content.audience.title} items={content.audience.items} />
            <CheckList title={content.scope.title} items={content.scope.items} />
          </SimpleGrid>
        </Container>
      </Box>

      <Box component="section" py={{ base: 64, md: 96 }} bg="slate.0">
        <Container size="lg" px="md">
          <Title order={2} fw={900} c="slate.9" mb="xl" ta="center" fz={{ base: 'xl', md: '2rem' }}>
            {content.pricing.title}
          </Title>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Paper p="xl" radius="lg" withBorder>
              <Title order={3} fz="lg" c="slate.9" mb="md">
                {t.servicePages.pricing.factorsTitle}
              </Title>
              <List spacing="xs">
                {content.pricing.factors.map((factor) => (
                  <List.Item key={factor}>
                    <Text c="slate.7">{factor}</Text>
                  </List.Item>
                ))}
              </List>
            </Paper>
            <Paper p="xl" radius="lg" withBorder>
              <Title order={3} fz="lg" c="slate.9" mb="md">
                {t.servicePages.pricing.processTitle}
              </Title>
              <List type="ordered" spacing="xs">
                {content.pricing.process.map((step) => (
                  <List.Item key={step}>
                    <Text c="slate.7">{step}</Text>
                  </List.Item>
                ))}
              </List>
            </Paper>
          </SimpleGrid>
          {content.pricing.range && (
            <Paper p="xl" radius="lg" withBorder mt="xl" ta="center">
              <Title order={3} fz="lg" c="slate.9" mb="xs">
                {t.servicePages.pricing.rangeTitle}
              </Title>
              <Text fw={900} fz="xl" c="brandBlue.7">
                {content.pricing.range.amount}
              </Text>
              <Text size="sm" c="slate.6">
                {content.pricing.range.note}
              </Text>
            </Paper>
          )}
        </Container>
      </Box>

      <Box component="section" py={{ base: 64, md: 96 }}>
        <Container size="xl" px="md">
          <Title order={2} fw={900} c="slate.9" mb="xl" ta="center" fz={{ base: 'xl', md: '2rem' }}>
            {content.steps.title}
          </Title>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {content.steps.items.map((step, index) => (
              <Paper key={step.title} p="xl" radius="lg" withBorder>
                <ThemeIcon size={40} radius="xl" mb="md" fw={900}>
                  {index + 1}
                </ThemeIcon>
                <Title order={3} fz="lg" c="slate.9" mb="xs">
                  {step.title}
                </Title>
                <Text c="slate.6">{step.description}</Text>
              </Paper>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Box component="section" py={{ base: 64, md: 96 }} bg="slate.0">
        <Container size="md" px="md">
          <Title order={2} fw={900} c="slate.9" mb="xl" ta="center" fz={{ base: 'xl', md: '2rem' }}>
            {content.faq.title}
          </Title>
          <Stack gap="sm">
            {/* Native <details>: answers stay in the HTML for search engines and work without JavaScript */}
            {content.faq.items.map(({ question, answer }) => (
              <Paper key={question} component="details" p="lg" radius="md" withBorder className={classes.faqItem}>
                <summary>{question}</summary>
                <Text mt="sm" c="slate.7">
                  {answer}
                </Text>
              </Paper>
            ))}
          </Stack>
        </Container>
      </Box>

      <Box component="section" py={{ base: 64, md: 96 }} bg="brandBlue.6" ta="center">
        <Container size="md" px="md">
          <Title order={2} c="white" fw={900} mb="md" fz={{ base: 'xl', md: '2.25rem' }}>
            {t.servicePages.finalCta.title}
          </Title>
          <Text c="blue.1" size="lg" mb="xl">
            {t.servicePages.finalCta.description}
          </Text>
          <QuoteActions variant="white" />
        </Container>
      </Box>
    </Stack>
  );
}
