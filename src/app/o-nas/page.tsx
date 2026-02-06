
import React from 'react';
import { ShieldCheck, Clock, Award, Users, CheckCircle2 } from 'lucide-react';
import { Metadata } from 'next';
import { Box, Container, SimpleGrid, Stack, Title, Text, ThemeIcon, Paper, Image, Group } from '@mantine/core';

export const metadata: Metadata = {
    title: "O nas - Biuro Rachunkowe TEWU",
};

export default function About() {
    return (
        <Stack gap={0} bg="white">
            {/* Header Section */}
            <Box component="section" bg="slate.9" py={{ base: 64, md: 96 }} ta="center">
                <Container size="md" px="md">
                    <Title order={1} c="white" fw={900} mb="md" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', letterSpacing: '-0.025em' }}>
                        Poznaj TEWU
                    </Title>
                    <Text size="xl" c="slate.4">
                        Ponad 25 lat doświadczenia w budowaniu stabilnych fundamentów finansowych dla polskiego biznesu.
                    </Text>
                </Container>
            </Box>

            {/* Main Intro Section */}
            <Box component="section" py={96}>
                <Container size="xl" px="md">
                    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={80}>
                        <Stack gap="xl">
                            <Title order={2} fw={900} c="slate.9" lh={1.2} style={{ fontSize: 'clamp(1.875rem, 4vw, 2.25rem)' }}>
                                Szukasz rzetelnego i godnego zaufania biura rachunkowego, które kompleksowo zajmie się księgowością Twojej firmy?
                            </Title>
                            <Stack gap="md" c="slate.6" lh={1.6}>
                                <Text>
                                    <Text span fw={700} c="slate.9">Biuro Rachunkowe TEWU Sp. z o.o.</Text> to idealny wybór dla przedsiębiorców, którzy cenią profesjonalizm, terminowość i bezpieczeństwo.
                                </Text>
                                <Text>
                                    Posiadamy wieloletnie doświadczenie w prowadzeniu księgowości dla firm o różnym profilu działalności. Nasz zespół wykwalifikowanych księgowych stale dba o aktualizację swojej wiedzy i umiejętności, aby zapewnić naszym klientom usługi na najwyższym poziomie.
                                </Text>
                            </Stack>
                            <SimpleGrid cols={2} spacing="md" mt="sm">
                                {[
                                    "Profesjonalizm",
                                    "Terminowość",
                                    "Bezpieczeństwo",
                                    "Doświadczenie"
                                ].map((item, i) => (
                                    <Group key={i} gap="xs" align="center">
                                        <ThemeIcon radius="xl" size="lg" bg="blue.0" c="blue.6">
                                            <CheckCircle2 size={20} />
                                        </ThemeIcon>
                                        <Text fw={700} c="slate.9">{item}</Text>
                                    </Group>
                                ))}
                            </SimpleGrid>
                        </Stack>
                        <Box pos="relative">
                            <Box style={{ aspectRatio: '4/5', borderRadius: 'var(--mantine-radius-xl)', overflow: 'hidden', boxShadow: 'var(--mantine-shadow-2xl)' }}>
                                <Image
                                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                                    alt="Zespół TEWU"
                                    w="100%"
                                    h="100%"
                                    fit="cover"
                                />
                            </Box>
                            <Paper
                                pos="absolute"
                                bottom={-40}
                                left={-40}
                                visibleFrom="md"
                                p="xl"
                                radius="lg"
                                shadow="xl"
                                withBorder
                                maw={280}
                                style={{ borderColor: 'var(--mantine-color-slate-1)' }}
                            >
                                <Text c="blue.6" fw={900} style={{ fontSize: '2.25rem' }} lh={1} mb={4}>25+</Text>
                                <Text c="slate.9" fw={700} size="lg" mb="xs">Lat na rynku</Text>
                                <Text c="slate.5" size="sm">Znamy przepisy od podszewki i wiemy, jak chronić Twój biznes.</Text>
                            </Paper>
                        </Box>
                    </SimpleGrid>
                </Container>
            </Box>

            {/* Values Section */}
            <Box component="section" py={96} bg="slate.0">
                <Container size="xl" px="md">
                    <Box ta="center" mb={64}>
                        <Text fw={900} c="blue.6" tt="uppercase" style={{ letterSpacing: '0.1em' }} size="sm" mb="xs">Nasze wartości</Text>
                        <Title order={3} fw={900} c="slate.9" style={{ fontSize: 'clamp(1.875rem, 4vw, 2.25rem)', letterSpacing: '-0.025em' }}>Dlaczego my?</Title>
                    </Box>
                    <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
                        {[
                            { title: "Bezpieczeństwo", icon: <ShieldCheck size={32} />, desc: "Stosujemy najwyższe standardy ochrony danych i posiadamy pełne ubezpieczenie OC, dając Ci spokój ducha." },
                            { title: "Terminowość", icon: <Clock size={32} />, desc: "Szanujemy Twój czas. Gwarantujemy, że wszystkie rozliczenia i deklaracje zostaną złożone w ustawowych terminach." },
                            { title: "Ekspertyza", icon: <Award size={32} />, desc: "Nasz zespół to specjaliści, którzy nieustannie podnoszą swoje kwalifikacje, śledząc dynamiczne zmiany w prawie." }
                        ].map((item, i) => (
                            <Paper key={i} p={40} radius="xl" shadow="sm" withBorder style={{ borderColor: 'var(--mantine-color-slate-1)' }}>
                                <ThemeIcon size={56} radius="lg" bg="blue.0" c="blue.6" mb="lg">
                                    {item.icon}
                                </ThemeIcon>
                                <Title order={4} fw={700} c="slate.9" mb="md" size="h4">{item.title}</Title>
                                <Text c="slate.6" lh={1.6}>{item.desc}</Text>
                            </Paper>
                        ))}
                    </SimpleGrid>
                </Container>
            </Box>

            {/* Mission Section */}
            <Box component="section" py={96}>
                <Container size="md" px="md" ta="center">
                    <Title order={2} fw={900} c="slate.9" mb="xl" size="h2">Nasza misja</Title>
                    <Text size="xl" c="slate.6" fs="italic" lh={1.6} style={{ fontSize: '1.5rem' }}>
                        "Naszym celem jest odciążenie przedsiębiorców z biurokracji, aby mogli w pełni skupić się na rozwoju swoich firm, mając pewność, że ich finanse są w najlepszych rękach."
                    </Text>
                </Container>
            </Box>
        </Stack>
    );
}
