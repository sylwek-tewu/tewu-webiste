"use client";

import React from 'react';
import { Mail, Phone, MapPin, Clock, FileText, Landmark, Building2, Smartphone } from 'lucide-react';
import { CONTACT_DETAILS } from '@/constants';
import { Box, Container, SimpleGrid, Stack, Title, Text, Group, ThemeIcon, Paper, Anchor } from '@mantine/core';

export default function ContactClient() {
    return (
        <Stack gap={0} bg="white">
            <Box component="section" py={96} bg="slate.0">
                <Container size="xl" px="md">
                    <Box ta="center" mb={64}>
                        <Title order={1} fw={900} c="slate.9" mb="md" style={{ fontSize: 'clamp(2.25rem, 5vw, 3rem)', letterSpacing: '-0.025em' }}>Kontakt</Title>
                        <Text size="xl" c="slate.6" maw={700} mx="auto">
                            Zapraszamy do kontaktu telefonicznego, mailowego lub osobistej wizyty w naszym biurze w Szczecinie.
                        </Text>
                    </Box>

                    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={48} style={{ alignItems: 'stretch' }}>
                        {/* Informacje Podstawowe (Lewa kolumna) */}
                        <Stack gap="xl">
                            <Group gap="sm">
                                <Building2 color="var(--mantine-color-blue-6)" size={28} />
                                <Title order={2} fw={700} c="slate.9" size="h2">Dane kontaktowe</Title>
                            </Group>

                            <Stack gap="md" style={{ flex: 1 }}>
                                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                                    <Paper p="lg" radius="lg" shadow="sm" withBorder style={{ borderColor: 'var(--mantine-color-slate-1)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <ThemeIcon size={44} radius="md" bg="blue.0" c="blue.6">
                                            <MapPin size={20} />
                                        </ThemeIcon>
                                        <Box>
                                            <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>Adres</Text>
                                            <Text size="sm" fw={700} c="slate.9" lh={1.3}>{CONTACT_DETAILS.address}</Text>
                                        </Box>
                                    </Paper>

                                    <Paper p="lg" radius="lg" shadow="sm" withBorder style={{ borderColor: 'var(--mantine-color-slate-1)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <ThemeIcon size={44} radius="md" bg="blue.0" c="blue.6">
                                            <Mail size={20} />
                                        </ThemeIcon>
                                        <Box>
                                            <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>Email</Text>
                                            <Anchor href={`mailto:${CONTACT_DETAILS.email}`} display="block" size="sm" fw={700} c="slate.9" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--mantine-color-blue-6)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--mantine-color-slate-9)'}>
                                                {CONTACT_DETAILS.email}
                                            </Anchor>
                                            <Anchor href="mailto:sw@tewu.szczecin.pl" display="block" size="sm" fw={700} c="slate.9" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--mantine-color-blue-6)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--mantine-color-slate-9)'}>
                                                sw@tewu.szczecin.pl
                                            </Anchor>
                                        </Box>
                                    </Paper>

                                    <Paper p="lg" radius="lg" shadow="sm" withBorder style={{ borderColor: 'var(--mantine-color-slate-1)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <ThemeIcon size={44} radius="md" bg="blue.0" c="blue.6">
                                            <Phone size={20} />
                                        </ThemeIcon>
                                        <Box>
                                            <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>Tel. sekretariat</Text>
                                            <Anchor href={`tel:${CONTACT_DETAILS.phone.replace(/\s/g, '')}`} display="block" size="sm" fw={700} c="slate.9" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--mantine-color-blue-6)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--mantine-color-slate-9)'}>
                                                {CONTACT_DETAILS.phone}
                                            </Anchor>
                                            <Anchor href="tel:+48602235736" display="block" size="sm" fw={700} c="slate.9" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--mantine-color-blue-6)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--mantine-color-slate-9)'}>
                                                602 235 736
                                            </Anchor>
                                        </Box>
                                    </Paper>

                                    <Paper p="lg" radius="lg" shadow="sm" withBorder style={{ borderColor: 'var(--mantine-color-slate-1)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <ThemeIcon size={44} radius="md" bg="blue.0" c="blue.6">
                                            <Smartphone size={20} />
                                        </ThemeIcon>
                                        <Box>
                                            <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>Tel. komórkowy</Text>
                                            <Anchor href="tel:+48501482555" display="block" size="sm" fw={700} c="slate.9" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--mantine-color-blue-6)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--mantine-color-slate-9)'}>
                                                501 482 555
                                            </Anchor>
                                            <Anchor href="tel:+48886543973" display="block" size="sm" fw={700} c="slate.9" style={{ transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--mantine-color-blue-6)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--mantine-color-slate-9)'}>
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
                                        boxShadow: 'var(--mantine-shadow-xl), 0 20px 25px -5px rgba(59, 130, 246, 0.1)', // approximations for shadow-blue-100
                                        flexGrow: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <Box>
                                        <Text c="blue.1" size="sm" fw={700} tt="uppercase" style={{ letterSpacing: '0.05em' }} mb={8}>Godziny otwarcia</Text>
                                        <Text size="xl" fw={900} style={{ fontSize: '1.5rem' }}>{CONTACT_DETAILS.hours}</Text>
                                    </Box>
                                    <Clock size={48} color="var(--mantine-color-blue-4)" style={{ opacity: 0.5 }} />
                                </Paper>
                            </Stack>
                        </Stack>

                        {/* Dane Rejestrowe i Bankowe (Prawa kolumna) */}
                        <Stack gap="xl">
                            <Group gap="sm">
                                <FileText color="var(--mantine-color-blue-6)" size={28} />
                                <Title order={2} fw={700} c="slate.9" size="h2">Dane rejestrowe i bankowe</Title>
                            </Group>

                            <Paper p={32} radius="xl" withBorder style={{ borderColor: 'var(--mantine-color-slate-2)', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <Box style={{ borderBottom: '1px solid var(--mantine-color-slate-1)' }} pb="md">
                                    <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>Nazwa pełna</Text>
                                    <Text size="lg" fw={700} c="slate.9">Biuro Rachunkowe TEWU Sp z o.o.</Text>
                                </Box>

                                <SimpleGrid cols={2} spacing="md">
                                    <Box>
                                        <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>NIP</Text>
                                        <Text size="md" fw={700} c="slate.9">9552249417</Text>
                                    </Box>
                                    <Box>
                                        <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>REGON</Text>
                                        <Text size="md" fw={700} c="slate.9">320601499</Text>
                                    </Box>
                                    <Box>
                                        <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>KRS</Text>
                                        <Text size="md" fw={700} c="slate.9">0000320281</Text>
                                    </Box>
                                    <Box>
                                        <Text size="xs" fw={700} c="slate.4" tt="uppercase" mb={4}>Kapitał zakładowy</Text>
                                        <Text size="md" fw={700} c="slate.9">50 000,00 ZŁ</Text>
                                    </Box>
                                </SimpleGrid>

                                <Paper mt="auto" pt="md" p="lg" radius="lg" withBorder bg="slate.0" style={{ borderColor: 'var(--mantine-color-blue-0)' }}>
                                    <Group gap="xs" mb="xs" c="blue.6">
                                        <Landmark size={20} />
                                        <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: '0.1em' }}>Numer rachunku bankowego</Text>
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
                    <Title order={2} fw={900} c="slate.9" style={{ fontSize: '1.875rem', letterSpacing: '-0.025em' }}>Nasza lokalizacja w Szczecinie</Title>
                    <Text c="slate.5" mt="xs">Al. Powstańców Wielkopolskich 78A LU2</Text>
                </Container>
                <Box h={500} bg="slate.1" pos="relative" style={{ overflow: 'hidden' }}
                    onMouseEnter={(e) => {
                        const iframe = e.currentTarget.querySelector('iframe');
                        if (iframe) iframe.style.filter = 'grayscale(0)';
                    }}
                    onMouseLeave={(e) => {
                        const iframe = e.currentTarget.querySelector('iframe');
                        if (iframe) iframe.style.filter = 'grayscale(1)';
                    }}
                >
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2377.9304323676235!2d14.536737377030806!3d53.40715377230495!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47aa0914a8b79b9b%3A0x6a0c5c6d3d6e5a6b!2sAleja%20Powsta%C5%84c%C3%B3w%20Wielkopolskich%2078A%2C%2070-110%20Szczecin!5e0!3m2!1spl!2spl!4v1715850000000!5m2!1spl!2spl"
                        width="100%"
                        height="100%"
                        style={{ border: 0, filter: 'grayscale(1)', transition: 'filter 0.7s' }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </Box>
            </Box>
        </Stack>
    );
}
