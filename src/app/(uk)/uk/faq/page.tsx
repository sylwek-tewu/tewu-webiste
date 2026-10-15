import React from 'react';
import { JsonLd } from '@/components/seo/JsonLd';
import FaqPage from '@/components/faq/FaqPage';
import { FAQ_UPDATED_AT, buildFaqMetadata, getFaqContent } from '@/content/faq';
import { buildFaqPageJsonLd } from '@/lib/structured-data';

export const metadata = buildFaqMetadata('uk');

export default function UkrainianFaq() {
  const content = getFaqContent('uk');
  return (
    <>
      <JsonLd data={buildFaqPageJsonLd(content, FAQ_UPDATED_AT)} />
      <FaqPage content={content} updatedAt={FAQ_UPDATED_AT} />
    </>
  );
}
