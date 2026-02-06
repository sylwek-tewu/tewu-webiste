import React from 'react';
import { Box, Container, SimpleGrid, Paper, ThemeIcon, Text, Title, Group, Button } from '@mantine/core';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { SERVICES } from '@/constants';

export function Services() {
    return (
        <Box component="section" py={96} bg="slate.0">
            <Container size="xl">
                <Box ta="center" mb={64}>
                    <Text fw={900} c="brandBlue" tt="uppercase" style={{ letterSpacing: '0.1em' }} size="sm" mb="xs">
                        Nasza Oferta
                    </Text>
                    <Title order={2} fw={900} c="slate.9" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }} mb="md">
                        Czym się zajmujemy?
                    </Title>
                    <Text c="slate.6" maw={700} mx="auto" size="lg">
                        Dopasowujemy zakres usług do specyfiki Twojej branży i wielkości przedsiębiorstwa.
                    </Text>
                </Box>

                <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing={50} verticalSpacing={50}>
                    {SERVICES.map((service) => (
                        <Paper
                            key={service.id}
                            p="xl"
                            radius="lg"
                            withBorder
                            style={{
                                borderColor: 'var(--mantine-color-slate-2)',
                                transition: 'all 0.2s',
                            }}
                        // CSS module would be better for hover but using standard style transition for now or just Mantine styles if possible.
                        // We'll rely on global theme or default props mostly.
                        >
                            <Group justify="space-between" mb="lg">
                                <ThemeIcon variant="light" size={48} radius="md" c="brandBlue" bg="brandBlue.0">
                                    {service.icon}
                                </ThemeIcon>
                            </Group>
                            <Title order={3} size="h4" fw={700} c="slate.9" mb="xs">
                                {service.title}
                            </Title>
                            <Text size="sm" c="slate.5" mb="md" lineClamp={3}>
                                {service.description}
                            </Text>
                            <Button variant="subtle" color="brandBlue" px={0} rightSection={<ArrowRight size={16} />}>
                                Dowiedz się więcej
                            </Button>
                        </Paper>
                    ))}
                </SimpleGrid>
            </Container>
        </Box>
    );
}
