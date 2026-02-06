import { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
    title: "Kontakt - Biuro Rachunkowe TEWU",
};

export default function Contact() {
    return <ContactClient />;
}
