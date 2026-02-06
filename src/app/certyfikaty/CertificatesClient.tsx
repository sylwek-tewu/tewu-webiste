
"use client";

import React, { useState, useRef } from 'react';
import { Award, ShieldCheck, X, FileText, ExternalLink, ChevronLeft, ChevronRight, Download, Loader2, ZoomIn, ZoomOut, RotateCcw, Hand } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Box, Container, SimpleGrid, Stack, Title, Text, Group, Button, ActionIcon, Modal, Loader, Paper, ThemeIcon, Badge, Image } from '@mantine/core';

// Konfiguracja workera PDF.js z CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const CertificatesClient: React.FC = () => {
    const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);

    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);

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

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setPageNumber(1);
        setScale(1.0);
    }

    const changePage = (offset: number) => {
        setPageNumber(prevPageNumber => prevPageNumber + offset);
    };

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3.0));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
    const handleResetZoom = () => setScale(1.0);

    // Grab-to-pan logic
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        setIsDragging(true);
        // e.pageX i e.pageY są względem całego dokumentu
        setStartX(e.pageX - containerRef.current.offsetLeft);
        setStartY(e.pageY - containerRef.current.offsetTop);
        setScrollLeft(containerRef.current.scrollLeft);
        setScrollTop(containerRef.current.scrollTop);
    };

    const handleMouseLeave = () => setIsDragging(false);
    const handleMouseUp = () => setIsDragging(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !containerRef.current) return;
        e.preventDefault();
        const x = e.pageX - containerRef.current.offsetLeft;
        const y = e.pageY - containerRef.current.offsetTop;
        const walkX = (x - startX);
        const walkY = (y - startY);
        containerRef.current.scrollLeft = scrollLeft - walkX;
        containerRef.current.scrollTop = scrollTop - walkY;
    };

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
                <Paper p="md" radius={0} withBorder className="border-b-slate-200" style={{ zIndex: 10 }}>
                    <Group justify="space-between">
                        <Group gap="xs">
                            <FileText className="text-blue-600" size={24} />
                            <Text fw={700} tt="uppercase" size="xs" visibleFrom="xs">Podgląd PDF</Text>
                        </Group>

                        <Group gap="md">
                            {numPages && numPages > 1 && (
                                <Group gap={0} bg="white" className="border border-slate-200 rounded-full shadow-sm overflow-hidden">
                                    <ActionIcon
                                        variant="subtle"
                                        color="slate.7"
                                        disabled={pageNumber <= 1}
                                        onClick={() => changePage(-1)}
                                    >
                                        <ChevronLeft size={18} />
                                    </ActionIcon>
                                    <Text size="xs" fw={700} c="slate.6" style={{ minWidth: 40, textAlign: 'center' }}>
                                        {pageNumber} / {numPages}
                                    </Text>
                                    <ActionIcon
                                        variant="subtle"
                                        color="slate.7"
                                        disabled={pageNumber >= (numPages || 0)}
                                        onClick={() => changePage(1)}
                                    >
                                        <ChevronRight size={18} />
                                    </ActionIcon>
                                </Group>
                            )}

                            <Group gap={0} bg="white" className="border border-slate-200 rounded-full shadow-sm overflow-hidden p-1">
                                <ActionIcon onClick={handleZoomOut} variant="subtle" color="slate.6">
                                    <ZoomOut size={18} />
                                </ActionIcon>
                                <Text size="xs" fw={900} c="slate.5" w={48} ta="center">
                                    {Math.round(scale * 100)}%
                                </Text>
                                <ActionIcon onClick={handleZoomIn} variant="subtle" color="slate.6">
                                    <ZoomIn size={18} />
                                </ActionIcon>
                                <Box w={1} h={16} bg="slate.2" mx={4} />
                                <ActionIcon onClick={handleResetZoom} variant="subtle" color="slate.6">
                                    <RotateCcw size={16} />
                                </ActionIcon>
                            </Group>
                        </Group>

                        <Group gap="xs">
                            <ActionIcon
                                component="a"
                                href={selectedPdf || '#'}
                                download
                                variant="subtle"
                                color="slate.6"
                                size="lg"
                            >
                                <Download size={20} />
                            </ActionIcon>
                            <ActionIcon
                                onClick={closeModal}
                                variant="subtle"
                                color="slate.9"
                                size="lg"
                                radius="xl"
                            >
                                <X size={24} />
                            </ActionIcon>
                        </Group>
                    </Group>
                </Paper>

                <Box
                    ref={containerRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    bg="slate.2"
                    style={{
                        flex: 1,
                        overflow: 'auto',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        userSelect: 'none',
                        position: 'relative'
                    }}
                >
                    <Box
                        py={64}
                        px={{ base: 16, md: 64 }}
                        style={{ minHeight: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}
                    >
                        <Document
                            file={selectedPdf}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={
                                <Stack align="center" justify="center" h={400} c="slate.5">
                                    <Loader color="blue" />
                                    <Text fw={700}>Wczytywanie...</Text>
                                </Stack>
                            }
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                className="shadow-2xl bg-white"
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                                loading={null}
                            />
                        </Document>
                    </Box>

                    {scale > 1.2 && (
                        <Paper
                            pos="absolute"
                            bottom={24}
                            left="50%"
                            style={{ transform: 'translateX(-50%)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }}
                            bg="rgba(15, 23, 42, 0.6)"
                            c="white"
                            px="md"
                            py="xs"
                            radius="xl"
                            shadow="xl"
                            withBorder
                        >
                            <Group gap="xs">
                                <Hand size={14} color="var(--mantine-color-blue-4)" />
                                <Text size="xs" fw={700} tt="uppercase" opacity={0.9} style={{ letterSpacing: '0.2em' }}>
                                    Przeciągnij, aby przesunąć widok
                                </Text>
                            </Group>
                        </Paper>
                    )}
                </Box>
            </Modal>
        </Stack >
    );
};

function CertificateCard({ cert, onClick }: { cert: any, onClick: () => void }) {
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
                bg="rgba(15, 23, 42, 0.4)"
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
                style={{ background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9), transparent)' }}
            >
                <Text c="white" fw={700}>{cert.title}</Text>
                <Text c="slate.3" size="xs">{cert.desc}</Text>
            </Box>
        </Paper>
    );
}

export default CertificatesClient;
