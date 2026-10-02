"use client";

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Box, Container, SimpleGrid, Stack, Title, Text, Group, Paper, ThemeIcon, Badge } from '@mantine/core';
import CertificatesList from '@/components/certificates/CertificatesList';
import { useLocale } from '@/i18n/LocaleContext';

const CertificatesClient: React.FC = () => {
    const { t } = useLocale();

    return (
        <Stack gap={0} bg="white">
            {/* Header */}
            <Box component="section" bg="slate.9" py={{ base: 64, md: 96 }} ta="center">
                <Container size="md" px="md">
                    <Title order={1} c="white" fw={900} mb="md" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', letterSpacing: '-0.025em' }}>
                        {t.certificates.header.title}
                    </Title>
                    <Text size="xl" c="slate.4">
                        {t.certificates.header.subtitle}
                    </Text>
                </Container>
            </Box>

            {/* Main Content */}
            <Box component="section" py={96}>
                <Container size="xl" px="md">
                    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={64}>
                        <Stack gap="xl">
                            <Box>
                                <Badge size="lg" variant="filled" color="blue.0" c="blue.7" radius="lg" mb="sm">
                                    {t.certificates.badge}
                                </Badge>
                                <Title order={2} fw={900} c="slate.9" lh={1.2} style={{ fontSize: 'clamp(1.875rem, 4vw, 2.25rem)' }} mb="md">
                                    {t.certificates.title}
                                </Title>
                                <Stack gap="md" c="slate.6" lh={1.6}>
                                    <Text>
                                        {t.certificates.p1Prefix}
                                        <Text span fw={700}>{t.certificates.p1Bold}</Text>
                                        {t.certificates.p1Suffix}
                                    </Text>
                                    <Text>
                                        {t.certificates.p2}
                                    </Text>
                                </Stack>
                            </Box>

                            <Paper p="xl" radius="xl" withBorder bg="slate.0" style={{ borderColor: 'var(--mantine-color-slate-1)' }}>
                                <Group align="flex-start">
                                    <ThemeIcon variant="transparent" c="blue.6" size={32}>
                                        <ShieldCheck size={32} />
                                    </ThemeIcon>
                                    <Box style={{ flex: 1 }}>
                                        <Text fw={700} c="slate.9" size="lg" mb={4}>{t.certificates.securityTitle}</Text>
                                        <Text c="slate.6" size="sm">{t.certificates.securityDesc}</Text>
                                    </Box>
                                </Group>
                            </Paper>
                        </Stack>

                        <CertificatesList certs={t.certificates.items} />
                    </SimpleGrid>
                </Container>
            </Box>
        </Stack>
    );
};

export default CertificatesClient;
