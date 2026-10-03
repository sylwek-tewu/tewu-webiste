import React from 'react';
import { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
    title: "O nas - Biuro Rachunkowe TEWU",
    description: "Poznaj Biuro Rachunkowe TEWU. Ponad 25 lat doświadczenia w księgowości, kadrach i doradztwie podatkowym w Szczecinie.",
    alternates: {
        canonical: '/o-nas',
        languages: {
            'pl': '/o-nas',
            'x-default': '/o-nas',
            'uk': '/uk/o-nas',
        },
    },
};

export default function About() {
    return <AboutClient />;
}
