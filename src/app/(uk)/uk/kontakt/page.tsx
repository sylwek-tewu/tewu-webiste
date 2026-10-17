import React from 'react';
import { buildPageMetadata } from '@/lib/metadata';
import { PATHS } from '@/lib/paths';
import ContactClient from '@/app/(pl)/kontakt/ContactClient';

export const metadata = buildPageMetadata({
    locale: 'uk',
    path: PATHS.contact,
    title: "Контакти та як доїхати – Бюро TEWU у Щецині",
    description: "Biuro Rachunkowe TEWU, Al. Powstańców Wielkopolskich 78A LU2, Щецин. Телефон 602 235 736, e-mail, години роботи (пн–пт 8–16) і карта доїзду.",
});

export default function UkrainianContact() {
    return <ContactClient />;
}
