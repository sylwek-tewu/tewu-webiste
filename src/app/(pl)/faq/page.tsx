import React from 'react';
import { JsonLd } from '@/components/seo/JsonLd';
import FaqPage from '@/components/faq/FaqPage';
import { FAQ_UPDATED_AT, buildFaqMetadata, getFaqContent } from '@/content/faq';
import { buildFaqPageJsonLd } from '@/lib/structured-data';

export const metadata = buildFaqMetadata('pl');

export default function Faq() {
  const content = getFaqContent('pl');
  return (
    <>
      <JsonLd data={buildFaqPageJsonLd(content, FAQ_UPDATED_AT)} />
      <FaqPage content={content} updatedAt={FAQ_UPDATED_AT} />
    </>
  );
}
