import React from 'react';
import { Metadata } from 'next';
import ServicesClient from './ServicesClient';

export const metadata: Metadata = {
    title: "Usługi - Biuro Rachunkowe TEWU",
    description: "Pełna oferta usług księgowych, kadrowo-płacowych i doradztwa podatkowego dla firm w Szczecinie.",
    alternates: {
        canonical: '/uslugi',
        languages: {
            'pl': '/uslugi',
            'x-default': '/uslugi',
            'uk': '/uk/uslugi',
        },
    },
};

export default function Services() {
    return <ServicesClient />;
}
