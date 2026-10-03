"use client";

import React from 'react';
import { Container, Title, Text, Stack, Paper, Box, Group, ThemeIcon, Divider, Alert } from '@mantine/core';
import { Shield, Mail, Phone, MapPin, Building2, Lock, AlertTriangle } from 'lucide-react';
import { CONTACT_DETAILS } from '@/constants';
import { useLocale } from '@/i18n/LocaleContext';
import { Emphasis } from '@/i18n/Emphasis';

export default function PrivacyPolicyClient({ retentionHours }: { retentionHours: number }) {
  const { t, locale } = useLocale();
  const p = t.privacyPolicy;

  return (
    <Box component="section" py={{ base: 64, md: 96 }} bg="slate.0">
      <Container size="md" px="md">
        <Stack gap="xl">
          {/* Header */}
          <Box ta="center" mb="lg">
            <Group justify="center" mb="sm">
              <ThemeIcon size={52} radius="xl" bg="blue.0" c="brandBlue.6">
                <Shield size={28} />
              </ThemeIcon>
            </Group>
            <Title order={1} fw={900} c="slate.9" style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', letterSpacing: '-0.025em' }}>
              {p.headerTitle}
            </Title>
            <Text c="slate.5" size="sm" mt="xs">
              {p.headerSubtitle}
            </Text>
          </Box>

          {/* Legal Note for Ukrainian translation */}
          {locale === 'uk' && p.legalNoteUk && (
            <Alert
              color="blue"
              icon={<AlertTriangle size={18} />}
              radius="lg"
              title="Юридична примітка / Informacja prawna"
            >
              <Text size="sm">{p.legalNoteUk}</Text>
            </Alert>
          )}

          {/* Main Content Card */}
          <Paper p={{ base: 'xl', md: 40 }} radius="xl" shadow="sm" withBorder bg="white" style={{ borderColor: 'var(--mantine-color-slate-2)' }}>
            <Stack gap="xl">
              {/* Section 1 */}
              <div>
                <Title order={2} size="h3" fw={800} c="slate.9" mb="sm">
                  {p.s1Title}
                </Title>
                <Text size="sm" c="slate.7" lh={1.7} mb="md">
                  <Emphasis text={p.s1Content} />
                </Text>
                <Group gap="lg" wrap="wrap">
                  <Group gap="xs">
                    <Mail size={16} color="var(--mantine-color-brandBlue-6)" />
                    <Text size="xs" fw={600} c="slate.8">{CONTACT_DETAILS.email}</Text>
                  </Group>
                  <Group gap="xs">
                    <Phone size={16} color="var(--mantine-color-brandBlue-6)" />
                    <Text size="xs" fw={600} c="slate.8">{CONTACT_DETAILS.phone}</Text>
                  </Group>
                  <Group gap="xs">
                    <MapPin size={16} color="var(--mantine-color-brandBlue-6)" />
                    <Text size="xs" fw={600} c="slate.8">Szczecin, Polska</Text>
                  </Group>
                </Group>
              </div>

              <Divider color="slate.1" />

              {/* Section 2 */}
              <div>
                <Title order={2} size="h3" fw={800} c="slate.9" mb="sm">
                  {p.s2Title}
                </Title>
                <Text size="sm" c="slate.7" lh={1.7} mb="sm">
                  {p.s2Intro}
                </Text>
                <Stack gap="xs" pl="sm">
                  <Text size="sm" c="slate.7" lh={1.7}>
                    • <Emphasis text={p.s2Bullet1} />
                  </Text>
                  <Text size="sm" c="slate.7" lh={1.7}>
                    • <Emphasis text={p.s2Bullet2} />
                  </Text>
                  <Text size="sm" c="slate.7" lh={1.7}>
                    • <Emphasis text={p.s2Bullet3} />
                  </Text>
                </Stack>
              </div>

              <Divider color="slate.1" />

              {/* Section 3 */}
              <div>
                <Title order={2} size="h3" fw={800} c="slate.9" mb="sm">
                  {p.s3Title}
                </Title>
                <Text size="sm" c="slate.7" lh={1.7}>
                  {p.s3Intro}
                </Text>
                <Stack gap="xs" pl="sm" mt="xs">
                  {p.s3Bullets.map((bullet, i) => (
                    <Text key={i} size="sm" c="slate.7">• {bullet}</Text>
                  ))}
                </Stack>
                <Text size="xs" c="slate.5" mt="sm">
                  {p.s3Note}
                </Text>
              </div>

              <Divider color="slate.1" />

              {/* Section 4 */}
              <div>
                <Title order={2} size="h3" fw={800} c="slate.9" mb="sm">
                  {p.s4Title}
                </Title>
                <Text size="sm" c="slate.7" lh={1.7} mb="sm">
                  {p.s4Intro}
                </Text>
                <Stack gap="sm">
                  <Paper p="md" radius="md" withBorder bg="slate.0" style={{ borderColor: 'var(--mantine-color-slate-2)' }}>
                    <Group gap="xs" mb={4}>
                      <Mail size={16} color="var(--mantine-color-brandBlue-6)" />
                      <Text size="sm" fw={700} c="slate.9">{p.s4SmtpTitle}</Text>
                    </Group>
                    <Text size="xs" c="slate.6" lh={1.5}>
                      {p.s4SmtpDesc}
                    </Text>
                  </Paper>

                  <Paper p="md" radius="md" withBorder bg="slate.0" style={{ borderColor: 'var(--mantine-color-slate-2)' }}>
                    <Group gap="xs" mb={4}>
                      <Building2 size={16} color="var(--mantine-color-brandBlue-6)" />
                      <Text size="sm" fw={700} c="slate.9">{p.s4NetlifyTitle}</Text>
                    </Group>
                    <Text size="xs" c="slate.6" lh={1.5}>
                      {p.s4NetlifyDesc}
                    </Text>
                  </Paper>

                  <Paper p="md" radius="md" withBorder bg="slate.0" style={{ borderColor: 'var(--mantine-color-slate-2)' }}>
                    <Group gap="xs" mb={4}>
                      <Lock size={16} color="var(--mantine-color-brandBlue-6)" />
                      <Text size="sm" fw={700} c="slate.9">{p.s4BlobsTitle}</Text>
                    </Group>
                    <Text size="xs" c="slate.6" lh={1.5}>
                      {p.s4BlobsDesc(retentionHours)}
                    </Text>
                  </Paper>
                </Stack>
              </div>

              <Divider color="slate.1" />

              {/* Section 5 */}
              <div>
                <Title order={2} size="h3" fw={800} c="slate.9" mb="sm">
                  {p.s5Title}
                </Title>
                <Text size="sm" c="slate.7" lh={1.7}>
                  {p.s5Content}
                </Text>
                <Text size="sm" c="slate.7" lh={1.7} mt="xs">
                  <Emphasis text={p.s5Retention(retentionHours)} />
                </Text>
              </div>

              <Divider color="slate.1" />

              {/* Section 6 */}
              <div>
                <Title order={2} size="h3" fw={800} c="slate.9" mb="sm">
                  {p.s6Title}
                </Title>
                <Text size="sm" c="slate.7" lh={1.7} mb="sm">
                  {p.s6Intro}
                </Text>
                <Stack gap="xs" pl="sm">
                  {p.s6Bullets.map((bullet, i) => (
                    <Text key={i} size="sm" c="slate.7">• {bullet}</Text>
                  ))}
                </Stack>
                <Text size="sm" c="slate.7" lh={1.7} mt="md">
                  <Emphasis text={p.s6Contact} />
                </Text>
                <Text size="sm" c="slate.7" lh={1.7} mt="xs">
                  <Emphasis text={p.s6Puodo} />
                </Text>
              </div>

              <Divider color="slate.1" />

              {/* Section 7 */}
              <div>
                <Title order={2} size="h3" fw={800} c="slate.9" mb="sm">
                  {p.s7Title}
                </Title>
                <Text size="sm" c="slate.7" lh={1.7} mb="xs">
                  {p.s7Content}
                </Text>
              </div>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
