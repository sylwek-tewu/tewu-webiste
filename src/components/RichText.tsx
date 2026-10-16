import React from 'react';
import { TextLink } from '@/components/TextLink';
import { parseRichText } from '@/lib/rich-text';

/** FAQ rich text (src/lib/rich-text.ts) as inline elements; wrap it in a paragraph. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {parseRichText(text).map((segment, i) => {
        if (segment.kind === 'text') return <React.Fragment key={i}>{segment.text}</React.Fragment>;
        if (segment.kind === 'strong') return <strong key={i}>{segment.text}</strong>;
        return (
          <TextLink key={i} href={segment.href}>
            {segment.text}
          </TextLink>
        );
      })}
    </>
  );
}
