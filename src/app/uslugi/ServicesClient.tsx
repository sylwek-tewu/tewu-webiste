"use client";

import React from 'react';
import { SERVICES } from '@/constants';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Box, Container, SimpleGrid, Stack, Title, Text, Button, ThemeIcon, Group, Paper } from '@mantine/core';
import Link from 'next/link';
import classes from './ServicesClient.module.css';

export default function ServicesClient() {
    return (
        <Stack gap={0} bg="white">
            {/* Hero Section */}
            <Box component="section" bg="slate.9" py={{ base: 64, md: 96 }} ta="center">
                <Container size="md" px="md">
                    <Title order={1} c="white" fw={900} mb="md" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', letterSpacing: '-0.025em' }}>
                        Pełna oferta usług księgowych
                    </Title>
                    <Text size="xl" c="slate.4">
                        Dostarczamy kompleksowe rozwiązania dla biznesu, od prostych ewidencji po zaawansowane doradztwo podatkowe.
                    </Text>
                </Container>
            </Box>

            {/* Services Grid */}
            <Box component="section" py={96} bg="white">
                <Container size="xl" px={{ base: 'md', sm: 'xl' }}>
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
                        {SERVICES.map((service) => (
                            <Paper
                                key={service.id}
                                p="xl"
                                radius="xl"
                                bg="slate.0"
                                withBorder
                                className={classes.serviceCard}
                                style={{
                                    borderColor: 'var(--mantine-color-slate-1)'
                                }}
                            >
                                {/* Service Icon Container */}
                                <Box
                                    w={56}
                                    h={56}
                                    mb="lg"
                                    className={classes.iconContainer}
                                >
                                    {service.icon}
                                </Box>
                                <Title order={3} fw={700} c="slate.9" mb="sm" lh={1.3} fz="xl">
                                    {service.title}
                                </Title>
                                <Text size="sm" c="slate.6" lh={1.6}>
                                    {service.description}
                                </Text>
                            </Paper>
                        ))}
                    </SimpleGrid>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box component="section" py={96} bg="brandBlue.6">
                <Container size="md" px="md" ta="center">
                    <Title order={2} c="white" fw={900} mb="lg" fz={{ base: 'xl', md: '2.25rem' }}>
                        Nie wiesz, która forma rozliczenia będzie dla Ciebie najlepsza?
                    </Title>
                    <Text c="blue.1" size="lg" mb="xl" maw={600} mx="auto">
                        Skontaktuj się z nami. Przeanalizujemy Twoją sytuację i zaproponujemy optymalne rozwiązania podatkowe.
                    </Text>
                    <Button
                        component={Link}
                        href="/kontakt"
                        size="xl"
                        radius="lg"
                        fw={800}
                        px={40}
                        py={20}
                        rightSection={<ArrowRight size={20} />}
                        className={classes.ctaButton}
                        style={{ boxShadow: 'var(--mantine-shadow-xl)' }}
                    >
                        Umów się na konsultację
                    </Button>
                </Container>
            </Box>

            {/* Additional Values */}
            <Box component="section" py={96} bg="slate.0">
                <Container size="xl" px={{ base: 'md', sm: 'xl' }}>
                    <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
                        <Group gap="md" align="flex-start" wrap="nowrap">
                            <ThemeIcon size={32} variant="transparent" c="green.5">
                                <CheckCircle2 size={32} />
                            </ThemeIcon>
                            <Box>
                                <Title order={4} fw={700} c="slate.9" mb="xs" fz="lg">
                                    Bezpieczeństwo
                                </Title>
                                <Text size="sm" c="slate.6">
                                    Pełna odpowiedzialność cywilna i ubezpieczenie OC biura.
                                </Text>
                            </Box>
                        </Group>
                        <Group gap="md" align="flex-start" wrap="nowrap">
                            <ThemeIcon size={32} variant="transparent" c="green.5">
                                <CheckCircle2 size={32} />
                            </ThemeIcon>
                            <Box>
                                <Title order={4} fw={700} c="slate.9" mb="xs" fz="lg">
                                    Terminowość
                                </Title>
                                <Text size="sm" c="slate.6">
                                    Gwarantujemy dotrzymanie wszystkich terminów ustawowych.
                                </Text>
                            </Box>
                        </Group>
                        <Group gap="md" align="flex-start" wrap="nowrap">
                            <ThemeIcon size={32} variant="transparent" c="green.5">
                                <CheckCircle2 size={32} />
                            </ThemeIcon>
                            <Box>
                                <Title order={4} fw={700} c="slate.9" mb="xs" fz="lg">
                                    Nowoczesność
                                </Title>
                                <Text size="sm" c="slate.6">
                                    E-księgowość i elektroniczny obieg dokumentów.
                                </Text>
                            </Box>
                        </Group>
                    </SimpleGrid>
                </Container>
            </Box>
        </Stack>
    );
}
