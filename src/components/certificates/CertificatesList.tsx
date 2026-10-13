"use client";

import React, { useState } from 'react';
import { FileText, Download, ExternalLink, X } from 'lucide-react';
import { Box, SimpleGrid, Group, ActionIcon, Modal, Paper, Text } from '@mantine/core';
import { PDFViewer } from '@/components/PDFViewer';
import CertificateCard from './CertificateCard';
import { useLocale } from '@/i18n/LocaleContext';

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
    const { locale } = useLocale();

    const closeModal = () => setSelectedPdf(null);

    const isUk = locale === 'uk';
    const previewLabel = isUk ? 'Перегляд PDF' : 'Podgląd PDF';
    const openNewTabLabel = isUk ? 'Відкрити в новій вкладці' : 'Otwórz w nowej karcie';
    const downloadLabel = isUk ? 'Завантажити PDF' : 'Pobierz PDF';
    const closeLabel = isUk ? 'Закрити' : 'Zamknij';

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
                            <Text fw={700} tt="uppercase" size="xs" visibleFrom="xs">{previewLabel}</Text>
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
                                aria-label={openNewTabLabel}
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
                                aria-label={downloadLabel}
                            >
                                <Download size={20} />
                            </ActionIcon>
                            <ActionIcon
                                onClick={closeModal}
                                variant="subtle"
                                color="slate.9"
                                size="lg"
                                radius="xl"
                                aria-label={closeLabel}
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
