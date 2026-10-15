/**
 * Rich text of the FAQ answers: `[label](href)` is a link and `**text**` is bold, nothing else.
 * One parser feeds the page (RichText), the JSON-LD answers and the content tests.
 */
export type RichSegment =
  | { kind: 'text'; text: string }
  | { kind: 'strong'; text: string }
  | { kind: 'link'; text: string; href: string };

const TOKEN = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*(.+?)\*\*/g;

export function parseRichText(text: string): RichSegment[] {
  const segments: RichSegment[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    if (match.index > last) segments.push({ kind: 'text', text: text.slice(last, match.index) });
    if (match[1] !== undefined) segments.push({ kind: 'link', text: match[1], href: match[2] });
    else segments.push({ kind: 'strong', text: match[3] });
    last = match.index + match[0].length;
  }
  if (last < text.length) segments.push({ kind: 'text', text: text.slice(last) });
  return segments;
}

export const isExternalHref = (href: string) => /^https?:\/\//.test(href);

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** HTML for JSON-LD answers: site paths become absolute, so the answer stands on its own. */
export function richTextToHtml(text: string, origin: string): string {
  return parseRichText(text)
    .map((segment) => {
      if (segment.kind === 'text') return escapeHtml(segment.text);
      if (segment.kind === 'strong') return `<strong>${escapeHtml(segment.text)}</strong>`;
      const href = isExternalHref(segment.href) ? segment.href : `${origin}${segment.href}`;
      return `<a href="${escapeHtml(href)}">${escapeHtml(segment.text)}</a>`;
    })
    .join('');
}
