import React from 'react';
import { buildPageMetadata } from '@/lib/metadata';
import AboutClient from '@/app/(pl)/o-nas/AboutClient';

export const metadata = buildPageMetadata({
    locale: 'uk',
    path: '/o-nas',
    title: "Про нас – бухгалтерське бюро в Щецині понад 25 років | TEWU",
    description: "Biuro Rachunkowe TEWU у Щецині: понад 25 років на ринку, уповноваження Міністерства фінансів і прямий контакт з керівництвом бюро. Познайомтеся з нами.",
});

export default function UkrainianAbout() {
    return <AboutClient />;
}
