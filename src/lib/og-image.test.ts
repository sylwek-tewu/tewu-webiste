import { describe, it, expect } from 'vitest';
import { fillMetadataSegment } from 'next/dist/lib/metadata/get-metadata-route';
import { renderOgImage } from './og-image';
import { OG_COPY, OG_CONTENT_TYPE, OG_IMAGE_PATH, OG_SIZE } from './og-image-meta';
import { COMPANY } from './company';
import * as plImage from '@/app/(pl)/opengraph-image';
import * as ukImage from '@/app/(uk)/uk/opengraph-image';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];

describe('share image copy', () => {
  it('keeps the alt texts agreed for each language', () => {
    expect(OG_COPY.pl.alt).toBe('Biuro Rachunkowe TEWU – biuro rachunkowe w Szczecinie');
    expect(OG_COPY.uk.alt).toBe('Бухгалтерське бюро TEWU у Щецині');
  });

  it('shows the company name, a tagline, the service line and the domain, nothing else', () => {
    expect(OG_COPY.pl.name).toBe(COMPANY.shortName);
    expect(OG_COPY.uk.name).toBe(COMPANY.shortName);
    expect(OG_COPY.pl.tagline).toBe('Biuro rachunkowe w Szczecinie');
    expect(OG_COPY.uk.tagline).toBe('Бухгалтерське бюро в Щецині');
    expect(OG_COPY.pl.services).toBe('Księgowość · Kadry i płace · KSeF');
    expect(OG_COPY.uk.services).toBe('Бухгалтерія · Кадри та зарплата · KSeF');
    expect(OG_COPY.pl.domain).toBe('tewu.szczecin.pl');
    expect(OG_COPY.uk.domain).toBe('tewu.szczecin.pl');
  });
});

describe('share image URL', () => {
  // Pages name the image themselves; the path Next.js gives the file-based route must match.
  it.each([
    ['pl', '/(pl)'],
    ['uk', '/(uk)/uk'],
  ] as const)('is where Next.js serves the %s opengraph-image route', (locale, segment) => {
    expect(OG_IMAGE_PATH[locale]).toBe(fillMetadataSegment(segment, {}, 'opengraph-image'));
  });
});

describe.each([
  ['Polish', plImage, 'pl'],
  ['Ukrainian', ukImage, 'uk'],
] as const)('%s opengraph-image route file', (_name, route, locale) => {
  it('exports the size, content type and alt Next.js writes into the og:image tags', () => {
    expect(route.size).toEqual({ width: 1200, height: 630 });
    expect(route.size).toEqual(OG_SIZE);
    expect(route.contentType).toBe('image/png');
    expect(route.contentType).toBe(OG_CONTENT_TYPE);
    expect(route.alt).toBe(OG_COPY[locale].alt);
  });

  it('renders a PNG', async () => {
    const response = await route.default();
    expect(response.headers.get('content-type')).toBe('image/png');
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect([...bytes.slice(0, 4)]).toEqual(PNG_SIGNATURE);
    expect(bytes.length).toBeGreaterThan(5_000);
  });
});

describe('renderOgImage', () => {
  it('returns an image Response for each locale', async () => {
    for (const locale of ['pl', 'uk'] as const) {
      const response = await renderOgImage(locale);
      expect(response).toBeInstanceOf(Response);
      expect(response.headers.get('content-type')).toBe('image/png');
    }
  });
});
