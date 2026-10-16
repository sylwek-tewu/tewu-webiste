"use client";

import React from 'react';
import { ShieldCheck, Clock, Award, CheckCircle2 } from 'lucide-react';
import { Box, Container, SimpleGrid, Stack, Title, Text, ThemeIcon, Paper, Group } from '@mantine/core';
import { Eyebrow } from '@/components/Eyebrow';
import { PageHero } from '@/components/PageHero';
import { StatNumber } from '@/components/StatNumber';
import { useLocale } from '@/i18n/LocaleContext';
import { OfficePicture } from '@/components/OfficePicture';
import { OFFICE_PHOTOS } from '@/lib/office-photos';

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
            <PageHero title={t.about.header.title} lead={t.about.header.subtitle} />

            {/* Main Intro Section */}
            <Box component="section" py={96}>
                <Container size="xl" px="md">
                    {/* Centred: the 4:3 photo is shorter than the text next to it */}
                    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={80} style={{ alignItems: 'center' }}>
                        <Stack gap="xl">
                            <Title order={2} c="slate.9">
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
                            {/* One column on phones: two are too narrow for „Bezpieczeństwo” beside its icon.
                                nowrap keeps each label beside its icon. */}
                            <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md" mt="sm">
                                {t.about.intro.bullets.map((item, i) => (
                                    <Group key={i} gap="xs" align="center" wrap="nowrap">
                                        <ThemeIcon radius="xl" size="lg" bg="brandBlue.0" c="brandBlue.6">
                                            <CheckCircle2 size={20} />
                                        </ThemeIcon>
                                        <Text fw={700} c="slate.9">{item}</Text>
                                    </Group>
                                ))}
                            </SimpleGrid>
                        </Stack>
                        <Box pos="relative">
                            <OfficePicture photo={OFFICE_PHOTOS.team} alt={t.about.intro.imageAlt} />
                            {/* On the right: the Prezes sits on the left of the photo. Inside the photo's width, so it never overflows the page. */}
                            <Paper
                                pos="absolute"
                                bottom={-40}
                                right={32}
                                visibleFrom="md"
                                p="xl"
                                radius="lg"
                                shadow="xl"
                                withBorder
                                maw={280}
                                style={{ borderColor: 'var(--mantine-color-slate-1)' }}
                            >
                                <StatNumber c="brandBlue.6" lh={1} mb={4}>
                                    {t.about.intro.expNumber}
                                </StatNumber>
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
                        <Eyebrow>{t.about.values.label}</Eyebrow>
                        <Title order={2} c="slate.9">
                            {t.about.values.title}
                        </Title>
                    </Box>
                    <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
                        {t.about.values.items.map((item, i) => (
                            <Paper key={i} p={40} radius="xl" shadow="sm" withBorder style={{ borderColor: 'var(--mantine-color-slate-1)' }}>
                                <ThemeIcon size={56} radius="lg" bg="brandBlue.0" c="brandBlue.6" mb="lg">
                                    {VALUE_ICONS[i]}
                                </ThemeIcon>
                                <Title order={3} size="h4" c="slate.9" mb="md">{item.title}</Title>
                                <Text c="slate.6" lh={1.6}>{item.desc}</Text>
                            </Paper>
                        ))}
                    </SimpleGrid>
                </Container>
            </Box>

            {/* Mission Section */}
            <Box component="section" py={96}>
                <Container size="md" px="md" ta="center">
                    <Title order={2} c="slate.9" mb="xl">
                        {t.about.mission.title}
                    </Title>
                    <Text fz="1.5rem" c="slate.6" fs="italic" lh={1.6}>
                        {t.about.mission.quote}
                    </Text>
                </Container>
            </Box>
        </Stack>
    );
}
