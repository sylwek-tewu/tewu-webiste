import React from 'react';
import Link from 'next/link';
import { Container, Title, Text, Button, Group, Badge, Grid, Box, Stack, Image } from '@mantine/core';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export function Hero() {
    return (
        <Box component="section" pt="var(--mantine-hero-padding-top)" pb="var(--mantine-hero-padding-bottom)">
            <Container size="xl">
                <Grid gutter={64} align="center">
                    <Grid.Col span={{ base: 12, lg: 6 }}>
                        <Stack gap="xl">
                            <Group>
                                <Badge
                                    variant="light"
                                    color="brandBlue"
                                    size="lg"
                                    radius="xl"
                                    py="md"
                                    px="lg"
                                    tt="uppercase"
                                    fw={700}
                                >
                                    PONAD 25 LAT NA RYNKU
                                </Badge>
                            </Group>

                            <Title
                                order={1}
                                c="slate.9"
                                style={{ fontSize: 'var(--mantine-h1-font-size)', lineHeight: 'var(--mantine-h1-line-height)' }}
                            >
                                Księgowość{' '}
                                <Text span c="brandBlue" fs="italic" inherit>
                                    bez stresu.
                                </Text>
                            </Title>

                            <Text size="xl" c="slate.6" lh={1.6} maw={600}>
                                Zajmij się rozwojem swojej firmy, a weźmiemy na siebie formalności. Profesjonalne wsparcie księgowe dla biznesu w TEWU.
                            </Text>

                            <Group gap="md">
                                <Button
                                    component={Link}
                                    href="/kontakt"
                                    size="xl"
                                    radius="md"
                                    bg="slate.9"
                                    c="white"
                                    fw={700}
                                    rightSection={<ArrowRight size={20} />}
                                >
                                    Skontaktuj się z nami
                                </Button>
                                <Button
                                    component={Link}
                                    href="/uslugi"
                                    size="xl"
                                    radius="md"
                                    variant="outline"
                                    color="slate.9"
                                    fw={700}
                                >
                                    Poznaj ofertę
                                </Button>
                            </Group>
                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, lg: 6 }} visibleFrom="lg">
                        <Box pos="relative">
                            <Box
                                pos="absolute"
                                inset="-16px"
                                bg="rgba(37, 99, 235, 0.2)"
                                style={{ zIndex: 0, filter: 'blur(40px)', borderRadius: '9999px' }}
                            />
                            <Image
                                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                                alt="Księgowość"
                                radius="xl"
                                style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(51, 65, 85, 0.5)', position: 'relative', zIndex: 10 }}
                            />
                        </Box>
                    </Grid.Col>
                </Grid>

                <Group gap={64} mt={80} justify="center" wrap="wrap">
                    <Box ta="center">
                        <Text c="slate.9" fw={900} size="xl" style={{ fontSize: '2rem' }}>150+</Text>
                        <Text c="slate.5" size="sm" fw={600}>Zadowolonych firm</Text>
                    </Box>
                    <Box ta="center">
                        <Text c="slate.9" fw={900} size="xl" style={{ fontSize: '2rem' }}>25+</Text>
                        <Text c="slate.5" size="sm" fw={600}>Lat doświadczenia</Text>
                    </Box>
                    <Box ta="center">
                        <Text c="slate.9" fw={900} size="xl" style={{ fontSize: '2rem' }}>100%</Text>
                        <Text c="slate.5" size="sm" fw={600}>Bezpieczeństwa</Text>
                    </Box>
                    <Box ta="center">
                        <Text c="slate.9" fw={900} size="xl" style={{ fontSize: '2rem' }}>24h</Text>
                        <Text c="slate.5" size="sm" fw={600}>Czas reakcji</Text>
                    </Box>
                </Group>
            </Container>
        </Box>
    );
}
