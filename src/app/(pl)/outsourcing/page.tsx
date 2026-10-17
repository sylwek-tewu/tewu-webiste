import React from 'react';
import { buildPageMetadata } from '@/lib/metadata';
import { PATHS } from '@/lib/paths';
import OutsourcingClient from './OutsourcingClient';

export const metadata = buildPageMetadata({
    locale: 'pl',
    path: PATHS.outsourcing,
    title: "Outsourcing księgowości i back-office w Szczecinie – TEWU",
    description: "Zredukuj koszty operacyjne i skup się na rozwoju. Outsourcing księgowy i procesów back-office w Biurze Rachunkowym TEWU w Szczecinie. Bezpłatna wycena.",
});

export default function Outsourcing() {
    return <OutsourcingClient />;
}
