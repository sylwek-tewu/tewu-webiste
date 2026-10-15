import React from 'react';
import { buildPageMetadata } from '@/lib/metadata';
import ServicesClient from '@/app/(pl)/uslugi/ServicesClient';

export const metadata = buildPageMetadata({
    locale: 'uk',
    path: '/uslugi',
    title: "Бухгалтерські та кадрові послуги в Щецині – Бюро TEWU",
    description: "Послуги бухгалтерського бюро TEWU у Щецині: повна бухгалтерія, KPiR, ryczałt, кадри та зарплата, KSeF, а також реєстрація Sp. z o.o. Безкоштовна оцінка.",
});

export default function UkrainianServices() {
    return <ServicesClient />;
}
