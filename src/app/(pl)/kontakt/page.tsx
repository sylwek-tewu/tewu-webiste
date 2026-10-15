import React from 'react';
import { buildPageMetadata } from '@/lib/metadata';
import ContactClient from './ContactClient';

export const metadata = buildPageMetadata({
    locale: 'pl',
    path: '/kontakt',
    title: "Kontakt i dojazd – Biuro Rachunkowe TEWU w Szczecinie",
    description: "Biuro Rachunkowe TEWU, Al. Powstańców Wielkopolskich 78A LU2, Szczecin. Telefon 602 235 736, e-mail, godziny otwarcia (pn–pt 8–16) i mapa dojazdu.",
});

export default function Contact() {
    return <ContactClient />;
}
