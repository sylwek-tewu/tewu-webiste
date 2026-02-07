"use client";

import React from 'react';
import { FileText } from 'lucide-react';
import { Box, Paper, Image, Text } from '@mantine/core';
import classes from './CertificateCard.module.css';

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
    return (
        <Paper
            onClick={onClick}
            pos="relative"
            radius="lg"
            shadow="lg"
            withBorder
            className={classes.card}
        >
            <Box h="100%" w="100%" className={classes.imageWrapper}>
                <Image
                    src={cert.url}
                    alt={cert.title}
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
                    Podgląd Dokumentu
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
        </Paper>
    );
}
