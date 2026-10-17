import React from 'react';
import { buildPageMetadata } from '@/lib/metadata';
import { PATHS } from '@/lib/paths';
import CertificatesClient from './CertificatesClient';

export const metadata = buildPageMetadata({
    locale: 'pl',
    path: PATHS.certificates,
    title: "Certyfikaty księgowe – Biuro Rachunkowe TEWU w Szczecinie",
    description: "Certyfikaty Ministerstwa Finansów potwierdzające kwalifikacje i uprawnienia do usługowego prowadzenia ksiąg rachunkowych TEWU w Szczecinie.",
});

export default function Certificates() {
    return <CertificatesClient />;
}
