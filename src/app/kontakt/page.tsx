import React from 'react';
import { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
    title: "Kontakt - Biuro Rachunkowe TEWU",
    description: "Skontaktuj się z Biurem Rachunkowym TEWU w Szczecinie. Dane kontaktowe, telefon, email, godziny otwarcia i mapa dojazdu.",
    alternates: {
        canonical: '/kontakt',
        languages: {
            'pl': '/kontakt',
            'uk': '/uk/kontakt',
        },
    },
};

export default function Contact() {
    return <ContactClient />;
}
