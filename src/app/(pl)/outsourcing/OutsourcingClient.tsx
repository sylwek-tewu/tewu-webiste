"use client";

import React from 'react';
import { ShieldCheck, Zap, Crosshair, Lock } from 'lucide-react';
import { Box, Container, SimpleGrid, Stack, Title, Text, ThemeIcon, Paper, Group } from '@mantine/core';
import classes from './OutsourcingClient.module.css';
import { useLocale } from '@/i18n/LocaleContext';

const FEATURE_ICONS = [
  <Zap key="0" color="var(--mantine-color-yellow-5)" />,
  <Crosshair key="1" color="var(--mantine-color-blue-5)" />,
  <Lock key="2" color="var(--mantine-color-indigo-5)" />,
  <ShieldCheck key="3" color="var(--mantine-color-grape-5)" />,
];

export default function OutsourcingClient() {
    const { t } = useLocale();

    return (
        <Stack gap={0} bg="white">
            {/* Header */}
            <Box component="section" bg="slate.9" py={{ base: 64, md: 96 }} ta="center">
                <Container size="md" px="md">
                    <Title order={1} c="white" fw={900} mb="md" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', letterSpacing: '-0.025em' }}>
                        {t.outsourcing.header.title}
                    </Title>
                    <Text size="xl" c="slate.4">
                        {t.outsourcing.header.subtitle}
                    </Text>
                </Container>
            </Box>

            {/* Main Content */}
            <Box component="section" py={96}>
                <Container size="xl" px="md">
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing={64} verticalSpacing={64}>
                        <Stack gap="xl">
                            <Box>
                                <Title order={2} fw={900} c="slate.9" style={{ fontSize: 'clamp(1.875rem, 4vw, 2.25rem)', letterSpacing: '-0.025em' }} mb="md">
                                    {t.outsourcing.intro.title}
                                </Title>
                                <Text size="lg" c="slate.6" lh={1.6}>
                                    {t.outsourcing.intro.description}
                                </Text>
                            </Box>

                            <Stack gap="md">
                                {t.outsourcing.intro.bullets.map((item, index) => (
                                    <Group key={index} gap="md" align="center" wrap="nowrap">
                                        <ThemeIcon variant="transparent" c="green.5" size={24} style={{ flexShrink: 0 }}>
                                            <ShieldCheck size={20} />
                                        </ThemeIcon>
                                        <Text size="md" c="slate.7" lh={1.5}>{item}</Text>
                                    </Group>
                                ))}
                            </Stack>
                        </Stack>

                        <SimpleGrid cols={2} spacing="lg">
                            {t.outsourcing.features.map((box, i) => (
                                <Paper
                                    key={i}
                                    p="lg"
                                    radius="lg"
                                    withBorder
                                    bg="slate.0"
                                    className={classes.featureCard}
                                    style={{ borderColor: 'var(--mantine-color-slate-1)' }}
                                >
                                    <Box mb="md">{FEATURE_ICONS[i]}</Box>
                                    <Text fw={700} c="slate.9" mb="xs">{box.title}</Text>
                                    <Text size="xs" c="slate.5" lh={1.4}>{box.desc}</Text>
                                </Paper>
                            ))}
                        </SimpleGrid>
                    </SimpleGrid>
                </Container>
            </Box>

            {/* Steps Section */}
            <Box component="section" py={96} bg="slate.0">
                <Container size="xl" px="md">
                    <Box ta="center" mb={64}>
                        <Title order={2} fw={900} c="slate.9" style={{ fontSize: 'clamp(1.875rem, 4vw, 2.25rem)', letterSpacing: '-0.025em' }} mb="xs">
                            {t.outsourcing.steps.title}
                        </Title>
                        <Text c="slate.5">{t.outsourcing.steps.subtitle}</Text>
                    </Box>

                    <SimpleGrid cols={{ base: 1, md: 3 }} spacing={48}>
                        {t.outsourcing.steps.items.map((step, i) => (
                            <Paper
                                key={i}
                                p="xl"
                                radius="xl"
                                shadow="sm"
                                withBorder
                                style={{ borderColor: 'var(--mantine-color-slate-1)', position: 'relative' }}
                            >
                                <Text
                                    fw={900}
                                    style={{ fontSize: '3.75rem', position: 'absolute', top: '1rem', right: '2rem', color: 'var(--mantine-color-blue-6)', opacity: 0.1 }}
                                >
                                    {step.step}
                                </Text>
                                <Title order={4} fw={700} c="slate.9" mb="md" size="h4">{step.title}</Title>
                                <Text c="slate.6" lh={1.6}>{step.desc}</Text>
                            </Paper>
                        ))}
                    </SimpleGrid>
                </Container>
            </Box>
        </Stack>
    );
}
