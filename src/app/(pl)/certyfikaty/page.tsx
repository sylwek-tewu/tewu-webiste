import React from 'react';
import { Metadata } from 'next';
import CertificatesClient from './CertificatesClient';

export const metadata: Metadata = {
    title: "Certyfikaty - Biuro Rachunkowe TEWU",
    description: "Certyfikaty Ministerstwa Finansów potwierdzające kwalifikacje i uprawnienia do usługowego prowadzenia ksiąg rachunkowych TEWU w Szczecinie.",
    alternates: {
        canonical: '/certyfikaty',
        languages: {
            'pl': '/certyfikaty',
            'x-default': '/certyfikaty',
            'uk': '/uk/certyfikaty',
        },
    },
};

export default function Certificates() {
    return <CertificatesClient />;
}
