import React from 'react';
import { Metadata } from 'next';
import OutsourcingClient from './OutsourcingClient';

export const metadata: Metadata = {
    title: "Outsourcing Procesów Biznesowych (BPO) - Biuro Rachunkowe TEWU",
    description: "Zredukuj koszty operacyjne i skup się na rozwoju. Profesjonalny outsourcing księgowy i procesów back-office w TEWU.",
    alternates: {
        canonical: '/outsourcing',
        languages: {
            'pl': '/outsourcing',
            'x-default': '/outsourcing',
            'uk': '/uk/outsourcing',
        },
    },
};

export default function Outsourcing() {
    return <OutsourcingClient />;
}
