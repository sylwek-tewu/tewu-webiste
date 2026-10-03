"use client";

import React from 'react';
import { Mail, Phone, MapPin, Clock, FileText, Landmark, Building2, Smartphone } from 'lucide-react';
import { CONTACT_DETAILS } from '@/constants';
import { Box, Container, SimpleGrid, Stack, Title, Text, Group, ThemeIcon, Paper, Anchor } from '@mantine/core';
import classes from './ContactClient.module.css';
import ContactMap from '@/components/contact/ContactMap';
import { useLocale } from '@/i18n/LocaleContext';

export default function ContactClient() {
    const { t } = useLocale();

    return (
        <Stack gap={0} bg="white">
            <Box component="section" py={96} bg="slate.0">
                <Container size="xl" px="md">
                    <Box ta="center" mb={64}>
                        <Title order={1} fw={900} c="slate.9" mb="md" style={{ fontSize: 'clamp(2.25rem, 5vw, 3rem)', letterSpacing: '-0.025em' }}>
                            {t.contact.header.title}
                        </Title>
                        <Text size="xl" c="slate.6" maw={700} mx="auto">
                            {t.contact.header.subtitle}
                        </Text>
                    </Box>

                    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={48} style={{ alignItems: 'stretch' }}>
                        {/* Informacje Podstawowe (Lewa kolumna) */}
                        <Stack gap="xl">
                            <Group gap="sm">
                                <Building2 color="var(--mantine-color-blue-6)" size={28} />
                                <Title order={2} fw={700} c="slate.9" size="h2">
                                    {t.contact.contactDataTitle}
                                </Title>
                            </Group>

                            <Stack gap="md" style={{ flex: 1 }}>
                                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                                    <Paper p="lg" radius="lg" shadow="sm" withBorder style={{ borderColor: 'var(--mantine-color-slate-1)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <ThemeIcon size={44} radius="md" bg="blue.0" c="blue.6">
                                            <MapPin size={20} />
                                        </ThemeIcon>
                                        <Box>
                                            <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>
                                                {t.contact.addressLabel}
                                            </Text>
                                            <Text size="sm" fw={700} c="slate.9" lh={1.3}>
                                                {CONTACT_DETAILS.address.split(',').map((line, index) => (
                                                    <span key={index}>
                                                        {line}
                                                        {index < CONTACT_DETAILS.address.split(',').length - 1 && <br />}
                                                    </span>
                                                ))}
                                            </Text>
                                        </Box>
                                    </Paper>

                                    <Paper p="lg" radius="lg" shadow="sm" withBorder style={{ borderColor: 'var(--mantine-color-slate-1)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <ThemeIcon size={44} radius="md" bg="blue.0" c="blue.6">
                                            <Mail size={20} />
                                        </ThemeIcon>
                                        <Box>
                                            <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>
                                                {t.contact.emailLabel}
                                            </Text>
                                            <Anchor href={`mailto:${CONTACT_DETAILS.email}`} display="block" size="sm" fw={700} className={classes.contactLink}>
                                                {CONTACT_DETAILS.email}
                                            </Anchor>
                                            <Anchor href="mailto:sw@tewu.szczecin.pl" display="block" size="sm" fw={700} className={classes.contactLink}>
                                                sw@tewu.szczecin.pl
                                            </Anchor>
                                        </Box>
                                    </Paper>

                                    <Paper p="lg" radius="lg" shadow="sm" withBorder style={{ borderColor: 'var(--mantine-color-slate-1)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <ThemeIcon size={44} radius="md" bg="blue.0" c="blue.6">
                                            <Phone size={20} />
                                        </ThemeIcon>
                                        <Box>
                                            <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>
                                                {t.contact.phoneOfficeLabel}
                                            </Text>
                                            <Anchor href={`tel:${CONTACT_DETAILS.phoneE164 || '+48914824190'}`} display="block" size="sm" fw={700} className={classes.contactLink}>
                                                {CONTACT_DETAILS.phone}
                                            </Anchor>
                                            <Anchor href="tel:+48602235736" display="block" size="sm" fw={700} className={classes.contactLink}>
                                                602 235 736
                                            </Anchor>
                                        </Box>
                                    </Paper>

                                    <Paper p="lg" radius="lg" shadow="sm" withBorder style={{ borderColor: 'var(--mantine-color-slate-1)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <ThemeIcon size={44} radius="md" bg="blue.0" c="blue.6">
                                            <Smartphone size={20} />
                                        </ThemeIcon>
                                        <Box>
                                            <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>
                                                {t.contact.phoneMobileLabel}
                                            </Text>
                                            <Anchor href="tel:+48501482555" display="block" size="sm" fw={700} className={classes.contactLink}>
                                                501 482 555
                                            </Anchor>
                                            <Anchor href="tel:+48886543973" display="block" size="sm" fw={700} className={classes.contactLink}>
                                                886 543 973
                                            </Anchor>
                                        </Box>
                                    </Paper>
                                </SimpleGrid>

                                <Paper
                                    p={32}
                                    radius="xl"
                                    bg="blue.6"
                                    c="white"
                                    shadow="xl"
                                    style={{
                                        boxShadow: 'var(--mantine-shadow-xl), 0 20px 25px -5px rgba(59, 130, 246, 0.1)',
                                        flexGrow: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <Box>
                                        <Text c="blue.1" size="sm" fw={700} tt="uppercase" style={{ letterSpacing: '0.05em' }} mb={8}>
                                            {t.contact.hoursLabel}
                                        </Text>
                                        <Text size="xl" fw={900} style={{ fontSize: '1.5rem' }}>{t.contact.hoursValue}</Text>
                                    </Box>
                                    <Clock size={48} color="var(--mantine-color-blue-4)" style={{ opacity: 0.5 }} />
                                </Paper>
                            </Stack>
                        </Stack>

                        {/* Dane Rejestrowe i Bankowe (Prawa kolumna) */}
                        <Stack gap="xl">
                            <Group gap="sm">
                                <FileText color="var(--mantine-color-blue-6)" size={28} />
                                <Title order={2} fw={700} c="slate.9" size="h2">
                                    {t.contact.regAndBankTitle}
                                </Title>
                            </Group>

                            <Paper p={32} radius="xl" withBorder style={{ borderColor: 'var(--mantine-color-slate-2)', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <Box style={{ borderBottom: '1px solid var(--mantine-color-slate-1)' }} pb="md">
                                    <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>
                                        {t.contact.fullNameLabel}
                                    </Text>
                                    <Text size="lg" fw={700} c="slate.9">
                                        <span>Biuro Rachunkowe TEWU <br /></span>
                                        <span>Spółka z ograniczoną odpowiedzialnością</span>
                                    </Text>
                                </Box>

                                <SimpleGrid cols={2} spacing="md">
                                    <Box>
                                        <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>{t.contact.nipLabel}</Text>
                                        <Text size="md" fw={700} c="slate.9">9552249417</Text>
                                    </Box>
                                    <Box>
                                        <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>{t.contact.regonLabel}</Text>
                                        <Text size="md" fw={700} c="slate.9">320601499</Text>
                                    </Box>
                                    <Box>
                                        <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>{t.contact.krsLabel}</Text>
                                        <Text size="md" fw={700} c="slate.9">0000320281</Text>
                                    </Box>
                                    <Box>
                                        <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>{t.contact.capitalLabel}</Text>
                                        <Text size="md" fw={700} c="slate.9">{t.contact.capitalValue}</Text>
                                    </Box>
                                </SimpleGrid>
                                <Box>
                                    <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>{t.contact.courtLabel}</Text>
                                    <Text size="sm" fw={700} c="slate.9">{t.contact.courtValue}</Text>
                                </Box>
                                <Paper mt="auto" pt="md" p="lg" radius="lg" withBorder bg="slate.0" style={{ borderColor: 'var(--mantine-color-blue-0)' }}>
                                    <Group gap="xs" mb="xs" c="blue.6">
                                        <Landmark size={20} />
                                        <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: '0.1em' }}>
                                            {t.contact.bankAccountLabel}
                                        </Text>
                                    </Group>
                                    <Text size="lg" ff="monospace" fw={700} c="slate.8" style={{ wordBreak: 'break-all' }}>
                                        10 1020 4795 0000 9002 0180 2966
                                    </Text>
                                </Paper>
                            </Paper>
                        </Stack>
                    </SimpleGrid>
                </Container>
            </Box>

            {/* Map Section */}
            <Box component="section" py={96} bg="white">
                <Container size="xl" px="md" ta="center" mb={48}>
                    <Title order={2} fw={900} c="slate.9" style={{ fontSize: '1.875rem', letterSpacing: '-0.025em' }}>
                        {t.contact.mapTitle}
                    </Title>
                    <Text c="slate.5" mt="xs">{t.contact.mapSubtitle}</Text>
                </Container>
                <ContactMap />
            </Box>
        </Stack>
    );
}
