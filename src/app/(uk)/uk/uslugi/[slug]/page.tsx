import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ServiceLandingPage from '@/components/service-pages/ServiceLandingPage';
import { buildServicePageMetadata, getServicePageContent } from '@/content/service-pages';
import { SERVICE_PAGE_SLUGS, isServicePageSlug } from '@/lib/service-pages';

type Props = { params: Promise<{ slug: string }> };

// Only the listed landing pages exist; any other /uslugi/<slug> is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_PAGE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return isServicePageSlug(slug) ? buildServicePageMetadata('uk', slug) : {};
}

export default async function UkrainianServicePage({ params }: Props) {
  const { slug } = await params;
  if (!isServicePageSlug(slug)) notFound();
  return <ServiceLandingPage content={getServicePageContent('uk', slug)} />;
}
