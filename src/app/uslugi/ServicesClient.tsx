
"use client";

import React from 'react';
import { SERVICES } from '@/constants';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Box, Container, SimpleGrid, Grid, Stack, Title, Text, Button, ThemeIcon, Group, Paper, List } from '@mantine/core';
import Link from 'next/link';

export default function ServicesClient() {
    return (
        <Stack gap={0} bg="white">
            {/* Header */}
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

            {/* Services List */}
            <Box component="section" py={96}>
                <Container size="xl" px="md">
                    <Stack gap={96}>
                        {SERVICES.map((service, index) => (
                            <Paper
                                key={index}
                                id={service.id}
                                radius="xl"
                                withBorder
                                bg="white"
                                style={{ borderColor: 'var(--mantine-color-slate-1)', overflow: 'hidden', scrollMarginTop: '6rem' }}
                            >
                                <Grid gutter={0}>
                                    <Grid.Col span={{ base: 12, lg: 6 }} order={{ base: 2, lg: index % 2 === 0 ? 1 : 2 }}>
                                        <Box
                                            p={{ base: 32, md: 64 }}
                                            bg={index % 2 === 0 ? 'white' : 'slate.0'}
                                            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
                                        >
                                            <Group mb="lg">
                                                <ThemeIcon size={56} radius="lg" bg="blue.0" c="blue.6">
                                                    <CheckCircle2 size={32} />
                                                </ThemeIcon>
                                            </Group>
                                            <Title order={2} fw={900} c="slate.9" mb="md" style={{ fontSize: '2rem' }}>
                                                {service.title}
                                            </Title>
                                            <Text size="lg" c="slate.6" lh={1.6} mb="xl">
                                                {service.description}
                                            </Text>

                                            <Box>
                                                <Text fw={700} c="slate.9" mb="md" tt="uppercase" size="sm" style={{ letterSpacing: '0.05em' }}>
                                                    Zakres usług:
                                                </Text>
                                                <List
                                                    spacing="sm"
                                                    size="md"
                                                    center
                                                    icon={
                                                        <ThemeIcon variant="transparent" c="blue.6" size={20}>
                                                            <CheckCircle2 size={20} />
                                                        </ThemeIcon>
                                                    }
                                                >
                                                    {service.features.map((feature, idx) => (
                                                        <List.Item key={idx}>
                                                            <Text span c="slate.7">{feature}</Text>
                                                        </List.Item>
                                                    ))}
                                                </List>
                                            </Box>
                                        </Box>
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, lg: 6 }} order={{ base: 1, lg: index % 2 === 0 ? 2 : 1 }}>
                                        <Box
                                            bg="slate.1"
                                            style={{
                                                backgroundImage: `url(${getServiceImage(index)})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                minHeight: '400px',
                                                height: '100%'
                                            }}
                                        />
                                    </Grid.Col>
                                </Grid>
                            </Paper>
                        ))}
                    </Stack>
                </Container>
            </Box>

            {/* CTA */}
            <Box component="section" py={96} bg="slate.0">
                <Container size="lg" px="md">
                    <Paper radius="2xl" p={{ base: 40, md: 80 }} bg="blue.6" c="white" ta="center" pos="relative" style={{ overflow: 'hidden' }}>
                        <Box
                            pos="absolute"
                            top={0}
                            left={0}
                            right={0}
                            h="100%"
                            bg="radial-gradient(circle at center, rgba(255,255,255,0.1), transparent 70%)"
                            style={{ pointerEvents: 'none' }}
                        />
                        <Stack align="center" gap="xl" pos="relative">
                            <Title order={2} fw={900} style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                                Nie wiesz co wybrać?
                            </Title>
                            <Text size="xl" c="blue.1" maw={600}>
                                Skontaktuj się z nami. Pomożemy Ci dobrać optymalny zakres usług dla Twojej firmy.
                            </Text>
                            <Button
                                component={Link}
                                href="/kontakt"
                                size="xl"
                                radius="md"
                                bg="white"
                                c="blue.6"
                                fw={800}
                                style={{ boxShadow: 'var(--mantine-shadow-xl)', transition: 'background-color 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--mantine-color-blue-0)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                                Umów konsultację
                            </Button>
                        </Stack>
                    </Paper>
                </Container>
            </Box>
        </Stack>
    );
}

function getServiceImage(index: number) {
    const images = [
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1590486803833-1c5c65d60d99?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1554224154-260312c60e48?auto=format&fit=crop&w=1200&q=80",
    ];
    return images[index % images.length];
}
