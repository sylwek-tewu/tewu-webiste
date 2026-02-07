
"use client";

import React from 'react';
import { ShieldCheck, Zap, Crosshair, Lock } from 'lucide-react';
import { Box, Container, SimpleGrid, Stack, Title, Text, ThemeIcon, List, Paper } from '@mantine/core';
import classes from './OutsourcingClient.module.css';

export default function OutsourcingClient() {
    return (
        <Stack gap={0} bg="white">
            {/* Header */}
            <Box component="section" bg="slate.9" py={{ base: 64, md: 96 }} ta="center">
                <Container size="md" px="md">
                    <Title order={1} c="white" fw={900} mb="md" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', letterSpacing: '-0.025em' }}>
                        Outsourcing Procesów Biznesowych (BPO)
                    </Title>
                    <Text size="xl" c="slate.4">
                        Zredukuj koszty operacyjne i skup się na kluczowych aspektach swojej działalności.
                        Przejmiemy Twoje procesy back-office z najwyższą dbałością o jakość i rzetelność.
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
                                    Dlaczego outsourcing z TEWU?
                                </Title>
                                <Text size="lg" c="slate.6" lh={1.6}>
                                    Zewnętrzna obsługa procesów finansowo-księgowych to nie tylko oszczędność na etatach.
                                    To dostęp do wyspecjalizowanej wiedzy naszych ekspertów oraz gwarancja pełnej zgodności z aktualnymi przepisami prawa.
                                </Text>
                            </Box>

                            <List
                                spacing="md"
                                size="md"
                                center
                                icon={
                                    <ThemeIcon variant="transparent" c="green.5" size={24}>
                                        <ShieldCheck size={20} />
                                    </ThemeIcon>
                                }
                            >
                                <List.Item>Obniżenie kosztów operacyjnych nawet o 40%</List.Item>
                                <List.Item>Dostęp do ekspertów bez konieczności rekrutacji</List.Item>
                                <List.Item>Gwarancja ciągłości procesów (brak problemów z urlopami)</List.Item>
                                <List.Item>Przeniesienie ryzyka prawnego i podatkowego na biuro</List.Item>
                            </List>
                        </Stack>

                        <SimpleGrid cols={2} spacing="lg">
                            {[
                                { title: "Szybkość", icon: <Zap color="var(--mantine-color-yellow-5)" />, desc: "Sprawne procesowanie dokumentacji" },
                                { title: "Optymalizacja", icon: <Crosshair color="var(--mantine-color-blue-5)" />, desc: "Usprawnienie procesów wewnętrznych" },
                                { title: "Poufność", icon: <Lock color="var(--mantine-color-indigo-5)" />, desc: "Ścisła ochrona danych biznesowych" },
                                { title: "Stabilność", icon: <ShieldCheck color="var(--mantine-color-grape-5)" />, desc: "Bezpieczeństwo i ciągłość operacji" }
                            ].map((box, i) => (
                                <Paper
                                    key={i}
                                    p="lg"
                                    radius="lg"
                                    withBorder
                                    bg="slate.0"
                                    className={classes.featureCard}
                                    style={{ borderColor: 'var(--mantine-color-slate-1)' }}
                                >
                                    <Box mb="md">{box.icon}</Box>
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
                            Jak zacząć?
                        </Title>
                        <Text c="slate.5">Wdrożenie procesu outsourcingu w 3 krokach</Text>
                    </Box>

                    <SimpleGrid cols={{ base: 1, md: 3 }} spacing={48}>
                        {[
                            { step: "01", title: "Analiza", desc: "Poznajemy Twoje procesy i identyfikujemy obszary do przejęcia." },
                            { step: "02", title: "Migracja", desc: "Przygotowujemy dokumentację i ustalamy zasady obiegu informacji." },
                            { step: "03", title: "Operacje", desc: "Przejmujemy pełną odpowiedzialność za wybrane procesy biznesowe." }
                        ].map((step, i) => (
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
