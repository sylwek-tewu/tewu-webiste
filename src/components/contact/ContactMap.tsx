"use client";

import React, { useState } from 'react';
import { Box } from '@mantine/core';
import { COMPANY } from '@/lib/company';
import { useLocale } from '@/i18n/LocaleContext';

export default function ContactMap() {
    const { t } = useLocale();
    const [isMapHovered, setIsMapHovered] = useState(false);

    return (
        <Box h={500} bg="slate.1" pos="relative" style={{ overflow: 'hidden' }}
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
