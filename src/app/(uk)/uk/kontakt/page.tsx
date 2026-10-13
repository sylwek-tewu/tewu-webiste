import React from 'react';
import { Metadata } from 'next';
import ContactClient from '@/app/(pl)/kontakt/ContactClient';

export const metadata: Metadata = {
    title: "Контакти | Бухгалтерське бюро TEWU в Щецині",
    description: "Зв'яжіться з Biuro Rachunkowe TEWU. Телефон, електронна адреса, години роботи, реквізити та карта доїзду до нашого офісу в Щецині.",
    alternates: {
        canonical: '/uk/kontakt',
        languages: {
            'pl': '/kontakt',
            'x-default': '/kontakt',
            'uk': '/uk/kontakt',
        },
    },
};

export default function UkrainianContact() {
    return <ContactClient />;
}
