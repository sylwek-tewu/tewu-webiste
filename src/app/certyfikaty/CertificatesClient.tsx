"use client";

import React, { useState } from 'react';
import { ShieldCheck, X, FileText, Download, ExternalLink } from 'lucide-react';
import { Box, Container, SimpleGrid, Stack, Title, Text, Group, ActionIcon, Modal, Paper, ThemeIcon, Badge, Image } from '@mantine/core';
import { PDFViewer } from '@/components/PDFViewer';

const CertificatesClient: React.FC = () => {
    const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

    const certs = [
        {
            url: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=1200&q=80',
            title: 'Certyfikat Księgowy I',
            desc: 'Wydany przez Ministra Finansów',
            pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
        },
        {
            url: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80',
            title: 'Certyfikat Księgowy II',
            desc: 'Uprawnienia do usługowego prowadzenia ksiąg',
            pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
        }
    ];

    const closeModal = () => setSelectedPdf(null);

    return (
        <Stack gap={0} bg="white">
            {/* Header */}
            <Box component="section" bg="slate.9" py={{ base: 64, md: 96 }} ta="center">
                <Container size="md" px="md">
                    <Title order={1} c="white" fw={900} mb="md" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', letterSpacing: '-0.025em' }}>
                        Nasze Certyfikaty
                    </Title>
                    <Text size="xl" c="slate.4">
                        Gwarancja najwyższych kompetencji potwierdzona państwowymi uprawnieniami.
                    </Text>
                </Container>
            </Box>

            {/* Main Content */}
            <Box component="section" py={96}>
                <Container size="xl" px="md">
                    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={64}>
                        <Stack gap="xl">
                            <Box>
                                <Badge size="lg" variant="filled" color="blue.0" c="blue.7" radius="lg" mb="sm">
                                    Ministerstwo Finansów
                                </Badge>
                                <Title order={2} fw={900} c="slate.9" lh={1.2} style={{ fontSize: 'clamp(1.875rem, 4vw, 2.25rem)' }} mb="md">
                                    Uprawnienia wydane przez Ministerstwo Finansów
                                </Title>
                                <Stack gap="md" c="slate.6" lh={1.6}>
                                    <Text>
                                        Działalność Biura Rachunkowego TEWU oparta jest na solidnych fundamentach prawnych i merytorycznych. Posiadamy <Text span fw={700}>Certyfikaty Księgowe wydane przez Ministra Finansów</Text>, które uprawniają nas do usługowego prowadzenia ksiąg rachunkowych.
                                    </Text>
                                    <Text>
                                        Uzyskanie takich certyfikatów wiąże się ze spełnieniem rygorystycznych wymogów dotyczących wykształcenia, praktyki zawodowej oraz nieposzlakowanej opinii. Dla naszych Klientów to pewność, że powierzają swoje finanse w ręce profesjonalistów, których wiedza została zweryfikowana na szczeblu państwowym.
                                    </Text>
                                </Stack>
                            </Box>

                            <Paper p="xl" radius="xl" withBorder bg="slate.0" style={{ borderColor: 'var(--mantine-color-slate-1)' }}>
                                <Group align="flex-start">
                                    <ThemeIcon variant="transparent" c="blue.6" size={32}>
                                        <ShieldCheck size={32} />
                                    </ThemeIcon>
                                    <Box style={{ flex: 1 }}>
                                        <Text fw={700} c="slate.9" size="lg" mb={4}>Pełne Bezpieczeństwo</Text>
                                        <Text c="slate.6" size="sm">Posiadane uprawnienia są uzupełnione wysoką polisą ubezpieczenia OC, co stanowi kompleksową ochronę dla obsługiwanych przez nas podmiotów.</Text>
                                    </Box>
                                </Group>
                            </Paper>
                        </Stack>

                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                            {certs.map((cert, index) => (
                                <CertificateCard key={index} cert={cert} onClick={() => setSelectedPdf(cert.pdfUrl)} />
                            ))}
                        </SimpleGrid>
                    </SimpleGrid>
                </Container>
            </Box>

            {/* PDF Preview Modal */}
            <Modal
                opened={!!selectedPdf}
                onClose={closeModal}
                fullScreen
                transitionProps={{ transition: 'fade', duration: 200 }}
                styles={{ body: { padding: 0, height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--mantine-color-slate-1)' } }}
                withCloseButton={false}
                zIndex={100}
            >
                <Paper p="md" radius={0} withBorder style={{ borderColor: 'var(--mantine-color-slate-2)', zIndex: 10 }}>
                    <Group justify="space-between">
                        <Group gap="xs">
                            <FileText color="var(--mantine-color-brandBlue-6)" size={24} />
                            <Text fw={700} tt="uppercase" size="xs" visibleFrom="xs">Podgląd PDF</Text>
                        </Group>

                        <Group gap="xs">
                            <ActionIcon
                                component="a"
                                href={selectedPdf || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="subtle"
                                color="slate.6"
                                size="lg"
                                aria-label="Otwórz w nowej karcie"
                            >
                                <ExternalLink size={20} />
                            </ActionIcon>
                            <ActionIcon
                                component="a"
                                href={selectedPdf || '#'}
                                download
                                variant="subtle"
                                color="slate.6"
                                size="lg"
                                aria-label="Pobierz PDF"
                            >
                                <Download size={20} />
                            </ActionIcon>
                            <ActionIcon
                                onClick={closeModal}
                                variant="subtle"
                                color="slate.9"
                                size="lg"
                                radius="xl"
                                aria-label="Zamknij podgląd PDF"
                            >
                                <X size={24} />
                            </ActionIcon>
                        </Group>
                    </Group>
                </Paper>

                <Box style={{ flex: 1, overflow: 'hidden' }}>
                    {selectedPdf && <PDFViewer url={selectedPdf} />}
                </Box>
            </Modal>
        </Stack>
    );
};

function CertificateCard({ cert, onClick }: { cert: { url: string; title: string; desc: string; pdfUrl: string }, onClick: () => void }) {
    const [hovered, setHovered] = useState(false);

    return (
        <Paper
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onClick}
            pos="relative"
            radius="lg"
            shadow={hovered ? 'xl' : 'lg'}
            withBorder
            style={{
                cursor: 'pointer',
                overflow: 'hidden',
                borderColor: 'var(--mantine-color-slate-1)',
                transition: 'all 0.5s',
                transform: hovered ? 'translateY(-4px)' : 'none'
            }}
        >
            <Box h="100%" w="100%" style={{ overflow: 'hidden', aspectRatio: '3/4' }}>
                <Image
                    src={cert.url}
                    alt={cert.title}
                    w="100%"
                    h="100%"
                    fit="cover"
                    style={{
                        transition: 'transform 0.7s',
                        transform: hovered ? 'scale(1.1)' : 'scale(1)'
                    }}
                />
            </Box>

            <Box
                pos="absolute"
                inset={0}
                bg="color-mix(in srgb, var(--mantine-color-slate-9) 40%, transparent)"
                style={{
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity 0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Paper
                    radius="xl"
                    p="md"
                    shadow="xl"
                    style={{
                        transform: hovered ? 'translateY(0)' : 'translateY(16px)',
                        transition: 'transform 0.3s'
                    }}
                >
                    <FileText size={32} color="var(--mantine-color-blue-6)" />
                </Paper>
                <Text
                    c="white"
                    fw={700}
                    mt="md"
                    style={{
                        opacity: hovered ? 1 : 0,
                        transform: hovered ? 'translateY(0)' : 'translateY(8px)',
                        transition: 'all 0.3s 0.075s'
                    }}
                >
                    Podgląd Dokumentu
                </Text>
            </Box>

            <Box
                pos="absolute"
                bottom={0}
                left={0}
                right={0}
                p={24}
                style={{ background: 'linear-gradient(to top, color-mix(in srgb, var(--mantine-color-slate-9) 90%, transparent), transparent)' }}
            >
                <Text c="white" fw={700}>{cert.title}</Text>
                <Text c="slate.3" size="xs">{cert.desc}</Text>
            </Box>
        </Paper>
    );
}

export default CertificatesClient;
