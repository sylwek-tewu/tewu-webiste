import React from 'react';
import { buildPageMetadata } from '@/lib/metadata';
import { PATHS } from '@/lib/paths';
import { Stack } from '@mantine/core';
import { Hero } from '@/components/home/Hero';
import { Services } from '@/components/home/Services';
import { WhyUs } from '@/components/home/WhyUs';

export const metadata = buildPageMetadata({
    locale: 'uk',
    path: PATHS.home,
    title: "Бухгалтерське бюро в Щецині – облік, кадри, зарплата | TEWU",
    description: "Бухгалтерське бюро в Щецині: повна бухгалтерія компаній, KPiR, ryczałt, кадри та зарплата, KSeF. Понад 25 років на ринку. Безкоштовна оцінка.",
});

export default function UkrainianHome() {
    return (
        <Stack gap={0} bg="white">
            <Hero />
            <Services />
            <WhyUs />
        </Stack>
    );
}
