import React from 'react';
import { Metadata } from 'next';
import AboutClient from '@/app/o-nas/AboutClient';

export const metadata: Metadata = {
    title: "Про нас | Бухгалтерське бюро TEWU",
    description: "Дізнайтеся більше про Biuro Rachunkowe TEWU. Понад 25 років стабільного фінансового успіху для компаній та підприємців у Польщі.",
    alternates: {
        canonical: '/uk/o-nas',
        languages: {
            'pl': '/o-nas',
            'uk': '/uk/o-nas',
        },
    },
};

export default function UkrainianAbout() {
    return <AboutClient />;
}
