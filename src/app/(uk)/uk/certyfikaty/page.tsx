import React from 'react';
import { buildPageMetadata } from '@/lib/metadata';
import CertificatesClient from '@/app/(pl)/certyfikaty/CertificatesClient';

export const metadata = buildPageMetadata({
    locale: 'uk',
    path: '/certyfikaty',
    title: "Бухгалтерські сертифікати – Бюро TEWU у Щецині",
    description: "Сертифікати Міністерства Фінансів Польщі на право ведення бухгалтерського обліку. Кваліфікація та повна безпека клієнтів TEWU.",
});

export default function UkrainianCertificates() {
    return <CertificatesClient />;
}
