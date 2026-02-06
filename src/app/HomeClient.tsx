
"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Box, Container, SimpleGrid, Stack, Title, Text, Button, Group, Badge, Paper, Image, ThemeIcon, Grid } from '@mantine/core';
import { CheckCircle2, ShieldCheck, Zap, Receipt, Users, PieChart, TrendingUp, BookOpen, Clock } from 'lucide-react';

export default function HomeClient() {
    return (
        <Stack gap={0} bg="white">
            {/* Hero Section */}
            <Box
                component="section"
                bg="slate.9"
                pos="relative"
                style={{ overflow: 'hidden' }}
                pt={{ base: 80, md: 128 }}
                pb={{ base: 80, md: 160 }}
            >
                {/* Background Pattern */}
                <Box
                    pos="absolute"
                    top={0}
                    left={0}
                    right={0}
                    h="100%"
                    bg="radial-gradient(circle at top right, rgba(37, 99, 235, 0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(37, 99, 235, 0.05), transparent 40%)"
                    style={{ pointerEvents: 'none' }}
                />

                <Container size="xl" px="md" pos="relative">
                    <Grid gutter={64} align="center">
                        <Grid.Col span={{ base: 12, lg: 6 }}>
                            <Stack gap="xl">
                                <Badge
                                    variant="filled"
                                    color="blue.9"
                                    c="blue.1"
                                    size="lg"
                                    radius="md"
                                    py="xs"
                                    tt="uppercase"
                                    fw={700}
                                    style={{ letterSpacing: '0.05em' }}
                                    leftSection={<ShieldCheck size={16} />}
                                >
                                    Zaufany Partner w Biznesie
                                </Badge>

                                <Title
                                    order={1}
                                    c="white"
                                    fw={900}
                                    lh={1.1}
                                    style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.025em' }}
                                >
                                    Profesjonalna księgowość dla <Text span c="blue.4" inherit>Twojej firmy</Text>
                                </Title>

                                <Text size="xl" c="slate.3" lh={1.6} maw={600}>
                                    Ponad 25 lat doświadczenia w zapewnianiu bezpieczeństwa finansowego i wspieraniu rozwoju polskich przedsiębiorstw. Skup się na biznesie, my zajmiemy się resztą.
                                </Text>

                                <Group gap="md">
                                    <Button
                                        component={Link}
                                        href="/kontakt"
                                        size="xl"
                                        radius="md"
                                        color="blue"
                                        fw={700}
                                        rightSection={<ArrowRight size={20} />}
                                        style={{ transition: 'transform 0.2s', boxShadow: '0 20px 25px -5px rgba(30, 58, 138, 0.2)' }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        Darmowa Wycena
                                    </Button>
                                    <Button
                                        component={Link}
                                        href="/uslugi"
                                        size="xl"
                                        radius="md"
                                        variant="outline"
                                        color="white"
                                        fw={700}
                                        bg="transparent"
                                        style={{ transition: 'background-color 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        Poznaj Usługi
                                    </Button>
                                </Group>

                                <Group gap="xl" mt="xl">
                                    <Box>
                                        <Text c="white" fw={900} size="xl" style={{ fontSize: '2rem' }}>25+</Text>
                                        <Text c="slate.4" size="sm" fw={600}>Lat doświadczenia</Text>
                                    </Box>
                                    <Box w={1} h={40} bg="slate.7" />
                                    <Box>
                                        <Text c="white" fw={900} size="xl" style={{ fontSize: '2rem' }}>500+</Text>
                                        <Text c="slate.4" size="sm" fw={600}>Zadowolonych firm</Text>
                                    </Box>
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
                </Container>
            </Box>

            {/* Features Section */}
            <Box component="section" py={90} bg="slate.0">
                <Container size="xl" px="md">
                    <SimpleGrid cols={{ base: 1, md: 3 }} spacing={40}>
                        {[
                            {
                                icon: <ShieldCheck size={32} />,
                                title: "Pełne Bezpieczeństwo",
                                desc: "Posiadamy ubezpieczenie OC oraz certyfikaty Ministerstwa Finansów. Twoje finanse są bezpieczne."
                            },
                            {
                                icon: <Clock size={32} />,
                                title: "Oszczędność Czasu",
                                desc: "Przejmujemy kontakty z urzędami i formalności. Ty zyskujesz czas na rozwój firmy."
                            },
                            {
                                icon: <TrendingUp size={32} />,
                                title: "Wsparcie Rozwoju",
                                desc: "Nie tylko księgujemy - doradzamy i optymalizujemy, by Twój biznes rósł szybciej."
                            }
                        ].map((feature, index) => (
                            <Paper
                                key={index}
                                p="xl"
                                radius="lg"
                                shadow="sm"
                                withBorder
                                style={{ borderColor: 'var(--mantine-color-slate-1)', transition: 'border-color 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--mantine-color-blue-2)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--mantine-color-slate-1)'}
                            >
                                <ThemeIcon
                                    size={60}
                                    radius="md"
                                    bg="white"
                                    c="blue.6"
                                    style={{ border: '1px solid var(--mantine-color-slate-1)', boxShadow: 'var(--mantine-shadow-sm)', transition: 'transform 0.2s' }}
                                    mb="md"
                                >
                                    {feature.icon}
                                </ThemeIcon>
                                <Title order={3} fw={700} size="h4" mb="sm" c="slate.9">{feature.title}</Title>
                                <Text c="slate.6" lh={1.6}>{feature.desc}</Text>
                            </Paper>
                        ))}
                    </SimpleGrid>
                </Container>
            </Box>

            {/* Services Preview */}
            <Box component="section" py={96}>
                <Container size="xl" px="md">
                    <Box ta="center" mb={64}>
                        <Text fw={900} c="blue.6" tt="uppercase" style={{ letterSpacing: '0.1em' }} size="sm" mb="xs">Oferta</Text>
                        <Title order={2} fw={900} c="slate.9" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }} mb="md">
                            Kompleksowa obsługa Twojej firmy
                        </Title>
                        <Text c="slate.6" maw={700} mx="auto" size="lg">
                            Dopasowujemy zakres usług do specyfiki Twojej branży i wielkości przedsiębiorstwa.
                        </Text>
                    </Box>

                    <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
                        {[
                            { title: "Księgi Handlowe", icon: <BookOpen />, href: "/uslugi" },
                            { title: "Księga Przychodów i Rozchodów", icon: <PieChart />, href: "/uslugi" },
                            { title: "Kadry i Płace", icon: <Users />, href: "/uslugi" },
                            { title: "Ryczałt", icon: <Receipt />, href: "/uslugi" },
                            { title: "Zakładanie Spółek", icon: <BuildingIcon />, href: "/uslugi" },
                            { title: "Doradztwo Podatkowe", icon: <Zap />, href: "/uslugi" }
                        ].map((service, i) => (
                            <Paper
                                key={i}
                                component={Link}
                                href={service.href}
                                p="xl"
                                radius="lg"
                                withBorder
                                style={{
                                    borderColor: 'var(--mantine-color-slate-1)',
                                    transition: 'all 0.2s',
                                    textDecoration: 'none'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--mantine-color-slate-1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <Group justify="space-between" mb="lg">
                                    <ThemeIcon variant="light" size="xl" radius="md" c="blue.6" bg="blue.0">
                                        {service.icon}
                                    </ThemeIcon>
                                    <ArrowRight size={20} color="var(--mantine-color-slate-3)" />
                                </Group>
                                <Text fw={700} size="lg" c="slate.9" mb="xs">{service.title}</Text>
                                <Text size="sm" c="slate.5">Dowiedz się więcej</Text>
                            </Paper>
                        ))}
                    </SimpleGrid>

                    <Group justify="center" mt={64}>
                        <Button
                            component={Link}
                            href="/uslugi"
                            size="lg"
                            variant="default"
                            radius="md"
                            fw={700}
                        >
                            Zobacz pełną ofertę
                        </Button>
                    </Group>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box component="section" py={96} bg="blue.6" c="white" pos="relative" style={{ overflow: 'hidden' }}>
                <Box
                    pos="absolute"
                    inset={0}
                    bg="linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)"
                    style={{ pointerEvents: 'none' }}
                />
                <Container size="lg" px="md" pos="relative" ta="center">
                    <Title order={2} fw={900} mb="xl" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
                        Skup się na rozwoju biznesu,<br />
                        <Text span c="blue.1" inherit>my zajmiemy się papierologią.</Text>
                    </Title>
                    <Text size="xl" c="blue.0" mb={48} maw={700} mx="auto">
                        Dołącz do grona zadowolonych klientów TEWU i zyskaj spokój oraz bezpieczeństwo.
                    </Text>
                    <Group justify="center" gap="md">
                        <Button
                            component={Link}
                            href="/kontakt"
                            size="xl"
                            radius="md"
                            bg="white"
                            c="blue.6"
                            fw={800}
                            style={{ transition: 'transform 0.2s', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.backgroundColor = 'var(--mantine-color-blue-0)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.backgroundColor = 'white';
                            }}
                        >
                            Skontaktuj się z nami
                        </Button>
                    </Group>
                </Container>
            </Box>
        </Stack>
    );
}

function BuildingIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
            <path d="M9 22v-4h6v4" />
            <path d="M8 6h.01" />
            <path d="M16 6h.01" />
            <path d="M8 10h.01" />
            <path d="M16 10h.01" />
            <path d="M8 14h.01" />
            <path d="M16 14h.01" />
            <path d="M8 18h.01" />
            <path d="M16 18h.01" />
        </svg>
    )
}
