"use client";

import React, { useState } from 'react';
import { FileText, Download, ExternalLink, X } from 'lucide-react';
import { Box, SimpleGrid, Group, ActionIcon, Modal, Paper, Text } from '@mantine/core';
import { PDFViewer } from '@/components/PDFViewer';
import CertificateCard from './CertificateCard';

interface Certificate {
    url: string;
    title: string;
    desc: string;
    pdfUrl: string;
}

interface CertificatesListProps {
    certs: Certificate[];
}

export default function CertificatesList({ certs }: CertificatesListProps) {
    const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

    const closeModal = () => setSelectedPdf(null);

    return (
        <>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                {certs.map((cert, index) => (
                    <CertificateCard key={index} cert={cert} onClick={() => setSelectedPdf(cert.pdfUrl)} />
                ))}
            </SimpleGrid>

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
        </>
    );
}
