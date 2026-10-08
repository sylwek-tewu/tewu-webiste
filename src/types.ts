
import { ReactNode } from 'react';

export interface NavItem {
  label: string;
  path: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  features: string[];
}

export interface Testimonial {
  id: number;
  author: string;
  content: string;
  company: string;
}

export interface ContactInfo {
  address: string;
  phone: string;
  phoneE164?: string;
  mobilePhone: string;
  mobilePhoneE164: string;
  email: string;
  hours: string;
}
