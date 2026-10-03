import React from 'react';

/** Renders dictionary text, turning `**phrase**` into <strong>phrase</strong>. */
export function Emphasis({ text }: { text: string }) {
  // split() with a capture group puts the emphasized phrases at the odd indexes
  const parts = text.split(/\*\*(.+?)\*\*/);
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : <React.Fragment key={i}>{part}</React.Fragment>))}
    </>
  );
}
