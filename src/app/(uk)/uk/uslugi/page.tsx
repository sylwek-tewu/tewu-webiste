import React from 'react';
import { Metadata } from 'next';
import ServicesClient from '@/app/(pl)/uslugi/ServicesClient';

export const metadata: Metadata = {
    title: "Бухгалтерські послуги в Польщі | TEWU",
    description: "Повна бухгалтерія (Sp. z o.o.), облік для ФОП (KPiR / Ryczałt), розрахунки з ZUS і US, кадри та заробітна плата, податкові консультації в Щецині.",
    alternates: {
        canonical: '/uk/uslugi',
        languages: {
            'pl': '/uslugi',
            'x-default': '/uslugi',
            'uk': '/uk/uslugi',
        },
    },
};

export default function UkrainianServices() {
    return <ServicesClient />;
}
