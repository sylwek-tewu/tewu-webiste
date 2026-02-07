"use client";

import React, { useState } from 'react';
import { Box } from '@mantine/core';

export default function ContactMap() {
    const [isMapHovered, setIsMapHovered] = useState(false);

    return (
        <Box h={500} bg="slate.1" pos="relative" style={{ overflow: 'hidden' }}
            onMouseEnter={() => setIsMapHovered(true)}
            onMouseLeave={() => setIsMapHovered(false)}
        >
            <iframe
                title="Mapa lokalizacji biura TEWU w Szczecinie"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2377.9304323676235!2d14.536737377030806!3d53.40715377230495!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47aa0914a8b79b9b%3A0x6a0c5c6d3d6e5a6b!2sAleja%20Powsta%C5%84c%C3%B3w%20Wielkopolskich%2078A%2C%2070-110%20Szczecin!5e0!3m2!1spl!2spl!4v1715850000000!5m2!1spl!2spl"
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
