import React from 'react';
import { Metadata } from 'next';
import { Stack } from '@mantine/core';
import { Hero } from '@/components/home/Hero';
import { Services } from '@/components/home/Services';
import { WhyUs } from '@/components/home/WhyUs';

export const metadata: Metadata = {
    title: "Бухгалтерське бюро TEWU | Польща, Щецин",
    description: "Професійні бухгалтерські послуги, кадри, зарплата та податкові консультації для бізнесу в Польщі. Понад 25 років досвіду.",
    alternates: {
        canonical: '/uk',
        languages: {
            'pl': '/',
            'uk': '/uk',
        },
    },
};

export default function UkrainianHome() {
    return (
        <Stack gap={0} bg="white">
            <Hero />
            <Services />
            <WhyUs />
        </Stack>
    );
}
