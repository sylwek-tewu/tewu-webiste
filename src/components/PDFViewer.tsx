"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Box, Stack, Text, Group, ActionIcon, Paper, Loader } from '@mantine/core';

export interface PDFViewerProps {
    /** URL of the PDF to display */
    url: string;
    /** Initial scale (default: 1.5 = 100%) */
    initialScale?: number;
    /** Maximum scale limit (default: 4.5 = 300%) */
    maxScale?: number;
    /** Minimum scale limit (default: 0.5) */
    minScale?: number;
}

export function PDFViewer({
    url,
    initialScale = 1.5,
    maxScale = 4.5,
    minScale = 0.5
}: PDFViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [pageNum, setPageNum] = useState(1);
    const [numPages, setNumPages] = useState(0);
    const [scale, setScale] = useState(initialScale);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pdfjsLib, setPdfjsLib] = useState<any>(null);

    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });

    // Load PDF.js library on client side only
    useEffect(() => {
        async function loadPdfjs() {
            const pdfjs = await import('pdfjs-dist');
            pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
            setPdfjsLib(pdfjs);
        }
        loadPdfjs();
    }, []);

    // Load PDF document
    useEffect(() => {
        if (!pdfjsLib) return;

        let cancelled = false;

        async function loadPdf() {
            try {
                setLoading(true);
                setError(null);
                const loadingTask = pdfjsLib.getDocument(url);
                const pdf = await loadingTask.promise;
                if (!cancelled) {
                    setPdfDoc(pdf);
                    setNumPages(pdf.numPages);
                    setPageNum(1);
                }
            } catch (err) {
                if (!cancelled) {
                    setError('Nie udało się załadować dokumentu PDF');
                    console.error('PDF loading error:', err);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadPdf();
        return () => { cancelled = true; };
    }, [url, pdfjsLib]);

    // Render page - runs when pageNum or scale changes
    useEffect(() => {
        if (!pdfDoc || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        let isCancelled = false;

        async function render() {
            try {
                const page = await pdfDoc.getPage(pageNum);
                if (isCancelled) return;

                const viewport = page.getViewport({ scale });

                // Set canvas dimensions
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Clear canvas before rendering
                context!.clearRect(0, 0, canvas.width, canvas.height);

                const renderTask = page.render({
                    canvasContext: context!,
                    viewport: viewport,
                    canvas: canvas,
                });

                await renderTask.promise;
            } catch (err: any) {
                // Ignore cancellation errors
                if (err?.name !== 'RenderingCancelledException') {
                    console.error('Page rendering error:', err);
                }
            }
        }

        render();

        return () => {
            isCancelled = true;
        };
    }, [pdfDoc, pageNum, scale]);

    const handlePrevPage = () => setPageNum(prev => Math.max(prev - 1, 1));
    const handleNextPage = () => setPageNum(prev => Math.min(prev + 1, numPages));
    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, maxScale));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, minScale));
    const handleResetZoom = () => setScale(initialScale);

    // Drag handlers for panning
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setScrollStart({
            x: containerRef.current.scrollLeft,
            y: containerRef.current.scrollTop
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !containerRef.current) return;
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        containerRef.current.scrollLeft = scrollStart.x - dx;
        containerRef.current.scrollTop = scrollStart.y - dy;
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleMouseLeave = () => setIsDragging(false);

    if (loading || !pdfjsLib) {
        return (
            <Stack align="center" justify="center" h="100%" c="slate.5">
                <Loader color="blue" size="lg" />
                <Text fw={700}>Wczytywanie dokumentu...</Text>
            </Stack>
        );
    }

    if (error) {
        return (
            <Stack align="center" justify="center" h="100%" c="red.6">
                <Text fw={700}>{error}</Text>
            </Stack>
        );
    }

    return (
        <Stack h="100%" gap={0}>
            {/* Controls */}
            <Paper p="sm" radius={0} withBorder style={{ borderColor: 'var(--mantine-color-slate-2)', borderLeft: 0, borderRight: 0, borderTop: 0 }}>
                <Group justify="center" gap="md">
                    {numPages > 1 && (
                        <Group gap={0} bg="white" style={{ border: '1px solid var(--mantine-color-slate-2)', borderRadius: '9999px', overflow: 'hidden' }}>
                            <ActionIcon variant="subtle" color="slate.7" disabled={pageNum <= 1} onClick={handlePrevPage} aria-label="Poprzednia strona">
                                <ChevronLeft size={18} />
                            </ActionIcon>
                            <Text size="xs" fw={700} c="slate.6" style={{ minWidth: 60, textAlign: 'center' }}>
                                {pageNum} / {numPages}
                            </Text>
                            <ActionIcon variant="subtle" color="slate.7" disabled={pageNum >= numPages} onClick={handleNextPage} aria-label="Następna strona">
                                <ChevronRight size={18} />
                            </ActionIcon>
                        </Group>
                    )}

                    <Group gap={0} bg="white" p={4} style={{ border: '1px solid var(--mantine-color-slate-2)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <ActionIcon onClick={handleZoomOut} variant="subtle" color="slate.6" aria-label="Pomniejsz">
                            <ZoomOut size={18} />
                        </ActionIcon>
                        <Text size="xs" fw={900} c="slate.5" w={48} ta="center">
                            {Math.round(scale * 100 / initialScale)}%
                        </Text>
                        <ActionIcon onClick={handleZoomIn} variant="subtle" color="slate.6" aria-label="Powiększ">
                            <ZoomIn size={18} />
                        </ActionIcon>
                        <Box w={1} h={16} bg="slate.2" mx={4} />
                        <ActionIcon onClick={handleResetZoom} variant="subtle" color="slate.6" aria-label="Resetuj powiększenie">
                            <RotateCcw size={16} />
                        </ActionIcon>
                    </Group>
                </Group>
            </Paper>

            {/* Canvas container - scrollable with drag-to-pan */}
            <Box
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                style={{
                    flex: 1,
                    overflow: 'auto',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    padding: '24px',
                    cursor: isDragging ? 'grabbing' : 'grab'
                }}
                bg="slate.2"
            >
                <canvas
                    ref={canvasRef}
                    style={{
                        boxShadow: 'var(--mantine-shadow-xl)',
                        background: 'white',
                        pointerEvents: 'none'
                    }}
                />
            </Box>
        </Stack>
    );
}

export default PDFViewer;
