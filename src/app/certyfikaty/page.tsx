import React from 'react';
import CertificatesClient from './CertificatesClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Certyfikaty - Biuro Rachunkowe TEWU",
};

export default function Certificates() {
    return <CertificatesClient />;
}
