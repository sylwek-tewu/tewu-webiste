"use client";

import React from 'react';
import { FileText } from 'lucide-react';
import { Box, Paper, Image, Text, VisuallyHidden } from '@mantine/core';
import classes from './CertificateCard.module.css';
import { useLocale } from '@/i18n/LocaleContext';

interface CertificateCardProps {
    cert: {
        url: string;
        title: string;
        desc: string;
        pdfUrl: string;
    };
    onClick: () => void;
}

export default function CertificateCard({ cert, onClick }: CertificateCardProps) {
    const { t } = useLocale();
    const previewLabel = t.certificates.previewLabel;

    return (
        <Paper
            pos="relative"
            radius="lg"
            shadow="lg"
            withBorder
            className={classes.card}
        >
            <Box h="100%" w="100%" className={classes.imageWrapper}>
                <Image
                    src={cert.url}
                    // Decorative: the thumbnail is a stock photo, and the card text and button name the certificate.
                    alt=""
                    className={classes.image}
                />
            </Box>

            <Box
                pos="absolute"
                inset={0}
                className={classes.overlay}
            >
                <Paper
                    radius="xl"
                    p="md"
                    shadow="xl"
                    className={classes.icon}
                >
                    <FileText size={32} color="var(--mantine-color-blue-6)" />
                </Paper>
                <Text
                    c="white"
                    fw={700}
                    mt="md"
                    className={classes.label}
                >
                    {previewLabel}
                </Text>
            </Box>

            <Box
                pos="absolute"
                bottom={0}
                left={0}
                right={0}
                p={24}
                className={classes.details}
            >
                <Text c="white" fw={700}>{cert.title}</Text>
                <Text c="slate.3" size="xs">{cert.desc}</Text>
            </Box>

            {/* Covers the whole card, so a click anywhere opens the preview and the keyboard can reach it. */}
            <button type="button" onClick={onClick} className={classes.trigger}>
                <VisuallyHidden>{previewLabel}: {cert.title} – {cert.desc}</VisuallyHidden>
            </button>
        </Paper>
    );
}
