
import React from 'react';
import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
    title: "Strona główna - Biuro Rachunkowe TEWU",
};

export default function Home() {
    return <HomeClient />;
}
