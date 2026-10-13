import React from 'react';
import { buildPageMetadata } from '@/lib/metadata';
import AboutClient from './AboutClient';

export const metadata = buildPageMetadata({
    locale: 'pl',
    path: '/o-nas',
    title: "O nas – biuro rachunkowe w Szczecinie od ponad 25 lat | TEWU",
    description: "Biuro Rachunkowe TEWU w Szczecinie: ponad 25 lat na rynku, uprawnienia Ministerstwa Finansów i bezpośredni kontakt z szefostwem biura. Poznaj nas.",
});

export default function About() {
    return <AboutClient />;
}
