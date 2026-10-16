import React from 'react';
import { buildPageMetadata } from '@/lib/metadata';
import { PATHS } from '@/lib/paths';
import { Stack } from '@mantine/core';
import { Hero } from '@/components/home/Hero';
import { Services } from '@/components/home/Services';
import { WhyUs } from '@/components/home/WhyUs';

export const metadata = buildPageMetadata({
    locale: 'pl',
    path: PATHS.home,
    title: "Biuro rachunkowe Szczecin – księgowość, kadry i płace | TEWU",
    description: "Biuro rachunkowe w Szczecinie: pełna księgowość spółek, KPiR, ryczałt, kadry i płace, KSeF. Ponad 25 lat na rynku. Bezpłatna wycena – oddzwonimy.",
});

export default function Home() {
    return (
        <Stack gap={0} bg="white">
            <Hero />
            <Services />
            <WhyUs />
        </Stack>
    );
}
