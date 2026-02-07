import React from 'react';
import { Metadata } from 'next';
import { Stack } from '@mantine/core';
import { Hero } from '@/components/home/Hero';
import { Services } from '@/components/home/Services';
import { WhyUs } from '@/components/home/WhyUs';

export const metadata: Metadata = {
    title: "Strona główna - Biuro Rachunkowe TEWU",
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
