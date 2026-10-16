"use client";

import React from 'react';
import Link from 'next/link';
import { Award, Briefcase, Building2, CheckCircle2, Handshake, ShieldCheck } from 'lucide-react';
import { Anchor, Box, Container, Flex, List, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { RELATED_SERVICE_PAGES, SERVICE_PAGES, servicePagePath, type ServicePageSlug } from '@/lib/service-pages';
import { useLocale } from '@/i18n/LocaleContext';
import { FaqList } from '@/components/faq/FaqList';
import { QuoteActions } from '@/components/QuoteActions';
import type { ServicePageContent } from '@/content/service-pages/types';

function CheckList({ title, items }: { title: string; items: string[] }) {
  return (
    <Box>
      {/* Two lists side by side, so a step smaller than the section titles */}
      <Title order={2} size="h3" c="slate.9" mb="lg">
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

function SeeAlso({ slug }: { slug: ServicePageSlug }) {
  const { t, locale } = useLocale();

  return (
    <Box component="section" py={{ base: 64, md: 96 }}>
      <Container size="lg" px="md">
        <Title order={2} c="slate.9" mb="xl" ta="center">
          {t.servicePages.seeAlsoTitle}
        </Title>
        <SimpleGrid cols={{ base: 1, md: RELATED_SERVICE_PAGES[slug].length }} spacing="lg">
          {RELATED_SERVICE_PAGES[slug].map((related) => {
            // The same one-sentence description as on the /uslugi card, so the copy has one source.
            const description = t.servicesPage.items.find((item) => item.id === SERVICE_PAGES[related].serviceItemId)?.description;
            return (
              <Paper key={related} p="xl" radius="lg" withBorder>
                <Anchor component={Link} href={servicePagePath(locale, related)} c="brandBlue.7" fw={700} fz="lg" underline="hover">
                  {t.servicePages.seeAlsoNames[related]}
                </Anchor>
                {description && (
                  <Text c="slate.6" mt="xs">
                    {description}
                  </Text>
                )}
              </Paper>
            );
          })}
        </SimpleGrid>
      </Container>
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
          <Title order={1} c="white" mb="md" lts="-0.025em">
            {content.hero.title}
          </Title>
          <Text size="xl" c="slate.4" mb="xl">
            {content.hero.lead}
          </Text>
          <QuoteActions variant="primary" source="service" />
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
          <Text size="sm" c="slate.6" ta="center" mt="lg">
            {t.servicePages.trust.clients}
          </Text>
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
          <Title order={2} c="slate.9" mb="xl" ta="center">
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
          <Title order={2} c="slate.9" mb="xl" ta="center">
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
          <Title order={2} c="slate.9" mb="xl" ta="center">
            {content.faq.title}
          </Title>
          <FaqList items={content.faq.items} />
        </Container>
      </Box>

      <SeeAlso slug={content.slug} />

      <Box component="section" py={{ base: 64, md: 96 }} bg="brandBlue.6" ta="center">
        <Container size="md" px="md">
          <Title order={2} c="white" mb="md">
            {t.servicePages.finalCta.title}
          </Title>
          <Text c="brandBlue.0" size="lg" mb="xl">
            {t.servicePages.finalCta.description}
          </Text>
          <QuoteActions variant="white" source="service" />
        </Container>
      </Box>
    </Stack>
  );
}
