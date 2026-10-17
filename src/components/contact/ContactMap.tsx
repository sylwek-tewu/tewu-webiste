"use client";

import React, { useState } from 'react';
import { Box } from '@mantine/core';
import { COMPANY } from '@/lib/company';
import { useLocale } from '@/i18n/LocaleContext';

export default function ContactMap() {
    const { t } = useLocale();
    const [isMapHovered, setIsMapHovered] = useState(false);

    return (
        // Next to the entrance photo from md up, so it takes that column's height there
        <Box h={{ base: 400, md: '100%' }} mih={400} bg="slate.1" pos="relative" style={{ overflow: 'hidden', borderRadius: 'var(--mantine-radius-xl)' }}
            onMouseEnter={() => setIsMapHovered(true)}
            onMouseLeave={() => setIsMapHovered(false)}
        >
            <iframe
                title={t.contact.mapIframeTitle}
                src={COMPANY.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, filter: isMapHovered ? 'grayscale(0)' : 'grayscale(1)', transition: 'filter 0.7s' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
        </Box>
    );
}
