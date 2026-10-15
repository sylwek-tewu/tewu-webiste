import React from 'react';
import { buildPageMetadata } from '@/lib/metadata';
import ServicesClient from './ServicesClient';

export const metadata = buildPageMetadata({
    locale: 'pl',
    path: '/uslugi',
    title: "Usługi księgowe i kadrowe w Szczecinie – Biuro TEWU",
    description: "Usługi biura rachunkowego TEWU w Szczecinie: pełna księgowość, KPiR, ryczałt, kadry i płace, KSeF oraz zakładanie spółek z o.o. Bezpłatna wycena.",
});

export default function Services() {
    return <ServicesClient />;
}
