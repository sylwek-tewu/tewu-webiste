import React from 'react';
import { Metadata } from 'next';
import { Stack } from '@mantine/core';
import { Hero } from '@/components/home/Hero';
import { Services } from '@/components/home/Services';
import { WhyUs } from '@/components/home/WhyUs';

export const metadata: Metadata = {
    title: "Strona główna - Biuro Rachunkowe TEWU",
    description: "Twój zaufany partner w biznesie. Profesjonalna księgowość, kadry i płace oraz doradztwo dla firm każdej wielkości. Biuro rachunkowe TEWU w Szczecinie.",
    alternates: {
        canonical: '/',
        languages: {
            'pl': '/',
            'x-default': '/',
            'uk': '/uk',
        },
    },
};

export default function Home() {
    return (
        <Stack gap={0} bg="white">
            <Hero />
            <Services />
            <WhyUs />
        </Stack>
    );
}
