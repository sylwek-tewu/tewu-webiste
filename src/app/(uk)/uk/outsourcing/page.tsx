import React from 'react';
import { buildPageMetadata } from '@/lib/metadata';
import { PATHS } from '@/lib/paths';
import OutsourcingClient from '@/app/(pl)/outsourcing/OutsourcingClient';

export const metadata = buildPageMetadata({
    locale: 'uk',
    path: PATHS.outsourcing,
    title: "Аутсорсинг бухгалтерії та бек-офісу в Щецині – TEWU",
    description: "Знизьте операційні витрати й зосередьтеся на розвитку. Аутсорсинг бухгалтерії та процесів бек-офісу в бюро TEWU у Щецині. Безкоштовна оцінка.",
});

export default function UkrainianOutsourcing() {
    return <OutsourcingClient />;
}
