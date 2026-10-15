import React from 'react';

/** JSON for a <script>: every "<" becomes <, so page copy can never close the element early. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Structured data for search engines. Server component: ships no client JavaScript. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
