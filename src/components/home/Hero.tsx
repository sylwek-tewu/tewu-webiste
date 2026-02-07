"use client";

import React from 'react';
import Link from 'next/link';
import { Container, Title, Text, Button, Group, Badge, Grid, GridCol, Box, Stack, Image, SimpleGrid } from '@mantine/core';
import { ArrowRight } from 'lucide-react';
import classes from '@/components/layout/Layout.module.css';

export function Hero() {
    return (
        <>
            {/* Hero Section */}
            <Box component="section" bg="slate.0" pt={{ base: 64, md: 96 }} pb={{ base: 96, md: 128 }}>
                <Container>
                    <Grid gutter={{ base: 48, lg: 48 }} align="center">
                        <GridCol span={{ base: 12, md: 6 }}>
                            <Stack gap="xl">
                                <Badge>
                                    Ponad 25 lat na rynku
                                </Badge>

                                <Title
                                    order={1}
                                    c="slate.9"
                                    className={classes.heroTitle}
                                    style={{ letterSpacing: '-0.025em', lineHeight: 1.1 }}
                                >
                                    Księgowość <br />
                                    <span>bez stresu.</span>
                                </Title>

                                <Text size="xl" c="slate.6" lh={1.6} maw={512}>
                                    Zajmij się rozwojem swojej firmy, a weźmiemy na siebie formalności. Profesjonalne wsparcie księgowe dla biznesu w TEWU.
                                </Text>

                                <Group gap="md" pt="md">
                                    <Button
                                        component={Link}
                                        href="/kontakt"
                                        size="xl"
                                        radius={12}
                                        fw={700}
                                        rightSection={<ArrowRight size={20} />}
                                        className={classes.primaryButton}
                                        style={{ boxShadow: '0 25px 50px -12px var(--mantine-color-slate-2)' }}
                                    >
                                        Skontaktuj się z nami
                                    </Button>
                                    <Button
                                        component={Link}
                                        href="/uslugi"
                                        size="xl"
                                        radius={12}
                                        variant="default"
                                        fw={700}
                                        className={classes.outlineButton}
                                    >
                                        Poznaj ofertę
                                    </Button>
                                </Group>
                            </Stack>
                        </GridCol>

                        <GridCol span={{ base: 12, md: 6 }} visibleFrom="md">
                            <Box pos="relative">
                                <Box
                                    pos="absolute"
                                    top={-40}
                                    right={-40}
                                    w={160}
                                    h={160}
                                    bg="color-mix(in srgb, var(--mantine-color-brandBlue-6) 10%, transparent)"
                                    style={{ borderRadius: '9999px', filter: 'blur(48px)' }}
                                />
                                <Box
                                    pos="absolute"
                                    bottom={-40}
                                    left={-40}
                                    w={160}
                                    h={160}
                                    bg="color-mix(in srgb, var(--mantine-color-indigo-6) 10%, transparent)"
                                    style={{ borderRadius: '9999px', filter: 'blur(48px)' }}
                                />
                                <Image
                                    src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                                    alt="Biuro rachunkowe"
                                    radius="xl"
                                    style={{
                                        position: 'relative',
                                        zIndex: 10,
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                        aspectRatio: '1/1',
                                        objectFit: 'cover'
                                    }}
                                />
                            </Box>
                        </GridCol>
                    </Grid>
                </Container>
            </Box>

            {/* Stats Section */}
            <Box component="section" py={64} bg="white" style={{ borderTop: '1px solid var(--mantine-color-slate-1)', borderBottom: '1px solid var(--mantine-color-slate-1)' }}>
                <Container>
                    <SimpleGrid cols={{ base: 2, md: 4 }} spacing="lg">
                        <Box ta="center">
                            <Text c="slate.9" fw={900} style={{ fontSize: '2.25rem' }}>150+</Text>
                            <Text c="slate.5" fw={500}>Zadowolonych firm</Text>
                        </Box>
                        <Box ta="center">
                            <Text c="slate.9" fw={900} style={{ fontSize: '2.25rem' }}>25+</Text>
                            <Text c="slate.5" fw={500}>Lat doświadczenia</Text>
                        </Box>
                        <Box ta="center">
                            <Text c="slate.9" fw={900} style={{ fontSize: '2.25rem' }}>100%</Text>
                            <Text c="slate.5" fw={500}>Bezpieczeństwa</Text>
                        </Box>
                        <Box ta="center">
                            <Text c="slate.9" fw={900} style={{ fontSize: '2.25rem' }}>24h</Text>
                            <Text c="slate.5" fw={500}>Czas reakcji</Text>
                        </Box>
                    </SimpleGrid>
                </Container>
            </Box>
        </>
    );
}
