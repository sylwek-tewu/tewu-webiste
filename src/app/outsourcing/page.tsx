
import React from 'react';
import { Metadata } from 'next';
import OutsourcingClient from './OutsourcingClient';

export const metadata: Metadata = {
    title: "Outsourcing - Biuro Rachunkowe TEWU",
};

export default function Outsourcing() {
    return <OutsourcingClient />;
}
