"use client";

import React from 'react';
import { Box, Container, SimpleGrid, Paper, ThemeIcon, Text, Title, Anchor } from '@mantine/core';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { SERVICES } from '@/constants';
import classes from '@/components/layout/Layout.module.css';

export function Services() {
    return (
        <Box component="section" py={96} bg="slate.0">
            <Container ta="center" mb={64}>
                <Text fw={900} c="brandBlue" tt="uppercase" style={{ letterSpacing: '0.1em' }} size="sm" mb="xs">
                    Nasza Oferta
                </Text>
                <Title order={2} fw={900} c="slate.9" style={{ letterSpacing: '-0.025em' }}>
                    Czym się zajmujemy?
                </Title>
            </Container>
            <Container>
                <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="lg">
                    {SERVICES.slice(0, 4).map((service) => (
                        <Paper
                            key={service.id}
                            p="xl"
                            radius="lg"
                            withBorder
                            bg="white"
                            className={classes.serviceCard}
                            style={{
                                borderColor: 'var(--mantine-color-slate-1)',
                            }}
                        >
                            <ThemeIcon
                                variant="transparent"
                                size={48}
                                radius="xl"
                                mb="lg"
                                className={classes.hoverIcon}
                            >
                                {service.icon}
                            </ThemeIcon>
                            <Title order={4} fw={700} c="slate.9" mb="sm" lh={1.3}>
                                {service.title}
                            </Title>
                            <Text size="sm" c="slate.6" lh={1.6} mb="lg" lineClamp={2}>
                                {service.description}
                            </Text>
                            <Anchor
                                component={Link}
                                href="/uslugi"
                                fw={700}
                                size="sm"
                                underline="never"
                                className={classes.moreLink}
                            >
                                Więcej <ArrowRight size={16} />
                            </Anchor>
                        </Paper>
                    ))}
                </SimpleGrid>
                <Box mt={64} ta="center">
                    <Anchor
                        component={Link}
                        href="/uslugi"
                        fw={900}
                        underline="never"
                        className={classes.textLink}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                    >
                        Zobacz pełną ofertę ({SERVICES.length} pozycji) <ArrowRight size={20} />
                    </Anchor>
                </Box>
            </Container>
        </Box>
    );
}
