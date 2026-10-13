import { renderOgImage } from '@/lib/og-image';
import { OG_COPY, OG_CONTENT_TYPE, OG_SIZE } from '@/lib/og-image-meta';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = OG_COPY.pl.alt;

export default function Image() {
  return renderOgImage('pl');
}
