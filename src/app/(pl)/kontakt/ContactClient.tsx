"use client";

import React from 'react';
import { Mail, Phone, MapPin, Clock, FileText, Landmark, Building2, Smartphone } from 'lucide-react';
import { COMPANY, telHref } from '@/lib/company';
import { Box, Container, SimpleGrid, Stack, Title, Text, Group, ThemeIcon, Paper, Anchor } from '@mantine/core';
import classes from './ContactClient.module.css';
import ContactMap from '@/components/contact/ContactMap';
import { OfficePicture } from '@/components/OfficePicture';
import { OFFICE_PHOTOS } from '@/lib/office-photos';
import { useLocale } from '@/i18n/LocaleContext';

export default function ContactClient() {
    const { t } = useLocale();

    return (
        <Stack gap={0} bg="white">
            <Box component="section" py={96} bg="slate.0">
                <Container size="xl" px="md">
                    <Box ta="center" mb={64}>
                        <Title order={1} c="slate.9" mb="md">
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
                                <Building2 color="var(--mantine-color-brandBlue-6)" size={28} />
                                <Title order={2} c="slate.9">
                                    {t.contact.contactDataTitle}
                                </Title>
                            </Group>

                            <Stack gap="md" style={{ flex: 1 }}>
                                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                                    <Paper p="lg" radius="lg" shadow="sm" withBorder style={{ borderColor: 'var(--mantine-color-slate-1)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <ThemeIcon size={44} radius="md" bg="brandBlue.0" c="brandBlue.6">
                                            <MapPin size={20} />
                                        </ThemeIcon>
                                        <Box>
                                            <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>
                                                {t.contact.addressLabel}
                                            </Text>
                                            <Text size="sm" fw={700} c="slate.9" lh={1.3}>
                                                {COMPANY.address.line.split(',').map((line, index) => (
                                                    <span key={index}>
                                                        {line}
                                                        {index < COMPANY.address.line.split(',').length - 1 && <br />}
                                                    </span>
                                                ))}
                                            </Text>
                                        </Box>
                                    </Paper>

                                    <Paper p="lg" radius="lg" shadow="sm" withBorder style={{ borderColor: 'var(--mantine-color-slate-1)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <ThemeIcon size={44} radius="md" bg="brandBlue.0" c="brandBlue.6">
                                            <Mail size={20} />
                                        </ThemeIcon>
                                        <Box>
                                            <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>
                                                {t.contact.emailLabel}
                                            </Text>
                                            {[COMPANY.emails.main, COMPANY.emails.second].map((email) => (
                                                <Anchor key={email} href={`mailto:${email}`} display="block" size="sm" fw={700} className={classes.contactLink}>
                                                    {email}
                                                </Anchor>
                                            ))}
                                        </Box>
                                    </Paper>

                                    <Paper p="lg" radius="lg" shadow="sm" withBorder style={{ borderColor: 'var(--mantine-color-slate-1)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <ThemeIcon size={44} radius="md" bg="brandBlue.0" c="brandBlue.6">
                                            <Phone size={20} />
                                        </ThemeIcon>
                                        <Box>
                                            <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>
                                                {t.contact.phoneOfficeLabel}
                                            </Text>
                                            {COMPANY.phones.office.map((phone) => (
                                                <Anchor key={phone.e164} href={telHref(phone)} display="block" size="sm" fw={700} className={classes.contactLink}>
                                                    {phone.display}
                                                </Anchor>
                                            ))}
                                        </Box>
                                    </Paper>

                                    <Paper p="lg" radius="lg" shadow="sm" withBorder style={{ borderColor: 'var(--mantine-color-slate-1)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <ThemeIcon size={44} radius="md" bg="brandBlue.0" c="brandBlue.6">
                                            <Smartphone size={20} />
                                        </ThemeIcon>
                                        <Box>
                                            <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>
                                                {t.contact.phoneMobileLabel}
                                            </Text>
                                            {COMPANY.phones.mobile.map((phone) => (
                                                <Anchor key={phone.e164} href={telHref(phone)} display="block" size="sm" fw={700} className={classes.contactLink}>
                                                    {phone.display}
                                                </Anchor>
                                            ))}
                                        </Box>
                                    </Paper>
                                </SimpleGrid>

                                <Paper
                                    p={32}
                                    radius="xl"
                                    bg="brandBlue.6"
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
                                        <Text c="white" size="sm" fw={700} tt="uppercase" style={{ letterSpacing: '0.05em' }} mb={8}>
                                            {t.contact.hoursLabel}
                                        </Text>
                                        <Text size="xl" fw={900} style={{ fontSize: '1.5rem' }}>{t.contact.hoursValue}</Text>
                                    </Box>
                                    <Clock size={48} color="var(--mantine-color-brandBlue-4)" style={{ opacity: 0.5 }} />
                                </Paper>
                            </Stack>
                        </Stack>

                        {/* Dane Rejestrowe i Bankowe (Prawa kolumna) */}
                        <Stack gap="xl">
                            <Group gap="sm">
                                <FileText color="var(--mantine-color-brandBlue-6)" size={28} />
                                <Title order={2} c="slate.9">
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
                                        <Text size="md" fw={700} c="slate.9">{COMPANY.registry.nip}</Text>
                                    </Box>
                                    <Box>
                                        <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>{t.contact.regonLabel}</Text>
                                        <Text size="md" fw={700} c="slate.9">{COMPANY.registry.regon}</Text>
                                    </Box>
                                    <Box>
                                        <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>{t.contact.krsLabel}</Text>
                                        <Text size="md" fw={700} c="slate.9">{COMPANY.registry.krs}</Text>
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
                                <Paper mt="auto" pt="md" p="lg" radius="lg" withBorder bg="slate.0" style={{ borderColor: 'var(--mantine-color-brandBlue-0)' }}>
                                    <Group gap="xs" mb="xs" c="brandBlue.6">
                                        <Landmark size={20} />
                                        <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: '0.1em' }}>
                                            {t.contact.bankAccountLabel}
                                        </Text>
                                    </Group>
                                    <Text size="lg" ff="monospace" fw={700} c="slate.8" style={{ wordBreak: 'break-all' }}>
                                        {COMPANY.bankAccount}
                                    </Text>
                                </Paper>
                            </Paper>
                        </Stack>
                    </SimpleGrid>
                </Container>
            </Box>

            {/* Map Section: the entrance photo shows which door is the office's, the map how to get there */}
            <Box component="section" py={96} bg="white">
                <Container size="xl" px="md">
                    <Box ta="center" mb={48}>
                        <Title order={2} c="slate.9">
                            {t.contact.mapTitle}
                        </Title>
                        <Text c="slate.5" mt="xs">{t.contact.mapSubtitle}</Text>
                    </Box>
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: 'xl', md: 48 }}>
                        <Box component="figure" m={0}>
                            <OfficePicture photo={OFFICE_PHOTOS.exterior} alt={t.contact.entrancePhotoAlt} />
                            <Text component="figcaption" c="slate.6" size="sm" mt="md">
                                {t.contact.entranceCaption}
                            </Text>
                        </Box>
                        <ContactMap />
                    </SimpleGrid>
                </Container>
            </Box>
        </Stack>
    );
}
