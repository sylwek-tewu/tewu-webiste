import React from 'react';
import { Metadata } from 'next';
import OutsourcingClient from '@/app/(pl)/outsourcing/OutsourcingClient';

export const metadata: Metadata = {
    title: "Аутсорсинг бізнес-процесів (BPO) | Бухгалтерія TEWU",
    description: "Зменшіть витрати та оптимізуйте свій бізнес у Польщі. Надійний аутсорсинг бек-офісу, фінансів та кадрів з повною відповідальністю.",
    alternates: {
        canonical: '/uk/outsourcing',
        languages: {
            'pl': '/outsourcing',
            'x-default': '/outsourcing',
            'uk': '/uk/outsourcing',
        },
    },
};

export default function UkrainianOutsourcing() {
    return <OutsourcingClient />;
}
