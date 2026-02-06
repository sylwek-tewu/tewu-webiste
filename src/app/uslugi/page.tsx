
import React from 'react';
import { Metadata } from 'next';
import ServicesClient from './ServicesClient';

export const metadata: Metadata = {
    title: "Usługi - Biuro Rachunkowe TEWU",
};

export default function Services() {
    return <ServicesClient />;
}
