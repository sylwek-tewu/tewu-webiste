import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { TEWU_LOGO_PATH, TEWU_LOGO_TRANSFORM, TEWU_LOGO_VIEW_BOX } from '@/components/icons/tewu-logo-path';
import { brandBlue, slate } from '@/theme';
import { OG_COPY, OG_SIZE } from '@/lib/og-image-meta';
import type { Locale } from '@/i18n/types';

// Site palette (src/theme.ts): slate-900 background, brand blue accent, slate-300 secondary text.
const BACKGROUND = slate[9];
const ACCENT = brandBlue[6];
const SECONDARY = slate[3];
const MUTED = slate[4];

const LOGO_WIDTH = 480;
const LOGO_HEIGHT = Math.round((LOGO_WIDTH * 2950) / 15103.041);

// Bundled because the default ImageResponse font has no Polish diacritics or Cyrillic.
// The route files are static, so this runs at build time only.
async function loadFont(file: string): Promise<Buffer> {
  return readFile(path.join(process.cwd(), 'src/assets/fonts', file));
}

export async function renderOgImage(locale: Locale): Promise<ImageResponse> {
  const copy = OG_COPY[locale];
  const [bold, regular] = await Promise.all([loadFont('Inter-Bold.ttf'), loadFont('Inter-Regular.ttf')]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          backgroundColor: BACKGROUND,
          color: '#ffffff',
          fontFamily: 'Inter',
        }}
      >
        <svg width={LOGO_WIDTH} height={LOGO_HEIGHT} viewBox={TEWU_LOGO_VIEW_BOX} fill="none">
          <path d={TEWU_LOGO_PATH} transform={TEWU_LOGO_TRANSFORM} fill="#ffffff" />
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 84, fontWeight: 700, lineHeight: 1.1, letterSpacing: -2 }}>
            {copy.name}
          </div>
          <div style={{ display: 'flex', marginTop: 20, fontSize: 44, fontWeight: 400, color: SECONDARY }}>
            {copy.tagline}
          </div>
          <div style={{ display: 'flex', width: 120, height: 6, marginTop: 36, backgroundColor: ACCENT }} />
          <div style={{ display: 'flex', marginTop: 36, fontSize: 34, fontWeight: 700, color: '#ffffff' }}>
            {copy.services}
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 30, fontWeight: 400, color: MUTED }}>{copy.domain}</div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Inter', data: bold, weight: 700, style: 'normal' },
        { name: 'Inter', data: regular, weight: 400, style: 'normal' },
      ],
    },
  );
}
