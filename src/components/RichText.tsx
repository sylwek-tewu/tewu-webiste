"use client";

import React from 'react';
import Link from 'next/link';
import { Anchor } from '@mantine/core';
import { isExternalHref, parseRichText } from '@/lib/rich-text';

/** FAQ rich text (src/lib/rich-text.ts) as inline elements; wrap it in a paragraph. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {parseRichText(text).map((segment, i) => {
        if (segment.kind === 'text') return <React.Fragment key={i}>{segment.text}</React.Fragment>;
        if (segment.kind === 'strong') return <strong key={i}>{segment.text}</strong>;
        return isExternalHref(segment.href) ? (
          <Anchor key={i} href={segment.href} target="_blank" rel="noopener noreferrer" c="brandBlue.7" underline="always">
            {segment.text}
          </Anchor>
        ) : (
          <Anchor key={i} component={Link} href={segment.href} c="brandBlue.7" underline="always">
            {segment.text}
          </Anchor>
        );
      })}
    </>
  );
}
