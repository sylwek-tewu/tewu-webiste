"use client";

import React from 'react';
import { ShieldCheck, Clock, Award, CheckCircle2 } from 'lucide-react';
import { Box, Container, SimpleGrid, Stack, Title, Text, ThemeIcon, Paper, Image, Group } from '@mantine/core';
import { useLocale } from '@/i18n/LocaleContext';

const VALUE_ICONS = [
  <ShieldCheck key="0" size={32} />,
  <Clock key="1" size={32} />,
  <Award key="2" size={32} />,
];

export default function AboutClient() {
    const { t } = useLocale();

    return (
        <Stack gap={0} bg="white">
            {/* Header Section */}
            <Box component="section" bg="slate.9" py={{ base: 64, md: 96 }} ta="center">
                <Container size="md" px="md">
                    <Title order={1} c="white" fw={900} mb="md" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', letterSpacing: '-0.025em' }}>
                        {t.about.header.title}
                    </Title>
                    <Text size="xl" c="slate.4">
                        {t.about.header.subtitle}
                    </Text>
                </Container>
            </Box>

            {/* Main Intro Section */}
            <Box component="section" py={96}>
                <Container size="xl" px="md">
                    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={80}>
                        <Stack gap="xl">
                            <Title order={2} fw={900} c="slate.9" lh={1.2} style={{ fontSize: 'clamp(1.875rem, 4vw, 2.25rem)' }}>
                                {t.about.intro.title}
                            </Title>
                            <Stack gap="md" c="slate.6" lh={1.6}>
                                <Text>
                                    <Text span fw={700} c="slate.9">{t.about.intro.p1Bold}</Text>
                                    {t.about.intro.p1Suffix}
                                </Text>
                                <Text>
                                    {t.about.intro.p2}
                                </Text>
                            </Stack>
                            <SimpleGrid cols={2} spacing="md" mt="sm">
                                {t.about.intro.bullets.map((item, i) => (
                                    <Group key={i} gap="xs" align="center">
                                        <ThemeIcon radius="xl" size="lg" bg="blue.0" c="blue.6">
                                            <CheckCircle2 size={20} />
                                        </ThemeIcon>
                                        <Text fw={700} c="slate.9">{item}</Text>
                                    </Group>
                                ))}
                            </SimpleGrid>
                        </Stack>
                        <Box pos="relative">
                            <Box style={{ aspectRatio: '4/5', borderRadius: 'var(--mantine-radius-xl)', overflow: 'hidden', boxShadow: 'var(--mantine-shadow-2xl)' }}>
                                <Image
                                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                                    alt="Zespół TEWU"
                                    w="100%"
                                    h="100%"
                                    fit="cover"
                                />
                            </Box>
                            <Paper
                                pos="absolute"
                                bottom={-40}
                                left={-40}
                                visibleFrom="md"
                                p="xl"
                                radius="lg"
                                shadow="xl"
                                withBorder
                                maw={280}
                                style={{ borderColor: 'var(--mantine-color-slate-1)' }}
                            >
                                <Text c="blue.6" fw={900} style={{ fontSize: '2.25rem' }} lh={1} mb={4}>
                                    {t.about.intro.expNumber}
                                </Text>
                                <Text c="slate.9" fw={700} size="lg" mb="xs">
                                    {t.about.intro.expTitle}
                                </Text>
                                <Text c="slate.5" size="sm">
                                    {t.about.intro.expDesc}
                                </Text>
                            </Paper>
                        </Box>
                    </SimpleGrid>
                </Container>
            </Box>

            {/* Values Section */}
            <Box component="section" py={96} bg="slate.0">
                <Container size="xl" px="md">
                    <Box ta="center" mb={64}>
                        <Text fw={900} c="blue.6" tt="uppercase" style={{ letterSpacing: '0.1em' }} size="sm" mb="xs">
                            {t.about.values.label}
                        </Text>
                        <Title order={3} fw={900} c="slate.9" style={{ fontSize: 'clamp(1.875rem, 4vw, 2.25rem)', letterSpacing: '-0.025em' }}>
                            {t.about.values.title}
                        </Title>
                    </Box>
                    <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
                        {t.about.values.items.map((item, i) => (
                            <Paper key={i} p={40} radius="xl" shadow="sm" withBorder style={{ borderColor: 'var(--mantine-color-slate-1)' }}>
                                <ThemeIcon size={56} radius="lg" bg="blue.0" c="blue.6" mb="lg">
                                    {VALUE_ICONS[i]}
                                </ThemeIcon>
                                <Title order={4} fw={700} c="slate.9" mb="md" size="h4">{item.title}</Title>
                                <Text c="slate.6" lh={1.6}>{item.desc}</Text>
                            </Paper>
                        ))}
                    </SimpleGrid>
                </Container>
            </Box>

            {/* Mission Section */}
            <Box component="section" py={96}>
                <Container size="md" px="md" ta="center">
                    <Title order={2} fw={900} c="slate.9" mb="xl" size="h2">
                        {t.about.mission.title}
                    </Title>
                    <Text size="xl" c="slate.6" fs="italic" lh={1.6} style={{ fontSize: '1.5rem' }}>
                        {t.about.mission.quote}
                    </Text>
                </Container>
            </Box>
        </Stack>
    );
}
