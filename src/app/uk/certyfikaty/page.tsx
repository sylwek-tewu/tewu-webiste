import React from 'react';
import { Metadata } from 'next';
import CertificatesClient from '@/app/certyfikaty/CertificatesClient';

export const metadata: Metadata = {
    title: "Державні сертифікати | Бухгалтерське бюро TEWU",
    description: "Сертифікати Міністерства Фінансів Польщі на право ведення бухгалтерського обліку. Кваліфікація та повна безпека клієнтів TEWU.",
    alternates: {
        canonical: '/uk/certyfikaty',
        languages: {
            'pl': '/certyfikaty',
            'uk': '/uk/certyfikaty',
        },
    },
};

export default function UkrainianCertificates() {
    return <CertificatesClient />;
}
