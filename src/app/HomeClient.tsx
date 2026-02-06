"use client";

import React from 'react';
import { Stack } from '@mantine/core';
import { Hero } from '@/components/home/Hero';
import { Services } from '@/components/home/Services';
import { WhyUs } from '@/components/home/WhyUs';

export default function HomeClient() {
    return (
        <Stack gap={0} bg="white">
            <Hero />
            <Services />
            <WhyUs />
        </Stack>
    );
}
