import { describe, it, expect } from 'vitest';
import { buildPageMetadata } from './metadata';

// Page-level openGraph replaces the images of the opengraph-image file of the parent segment,
// so every page names the share image itself.
const PL_IMAGE = {
  url: '/opengraph-image-35ziip',
  width: 1200,
  height: 630,
  alt: 'Biuro Rachunkowe TEWU – biuro rachunkowe w Szczecinie',
};
const UK_IMAGE = {
  url: '/uk/opengraph-image-1xrru2',
  width: 1200,
  height: 630,
  alt: 'Бухгалтерське бюро TEWU у Щецині',
};

describe('buildPageMetadata', () => {
  it('sets the canonical, hreflang links and social tags of a Polish page', () => {
    expect(buildPageMetadata({ locale: 'pl', path: '/kontakt', title: 'Tytuł', description: 'Opis' })).toEqual({
      title: 'Tytuł',
      description: 'Opis',
      alternates: {
        canonical: '/kontakt',
        languages: { pl: '/kontakt', uk: '/uk/kontakt', 'x-default': '/kontakt' },
      },
      openGraph: {
        type: 'website',
        url: '/kontakt',
        siteName: 'Biuro Rachunkowe TEWU',
        locale: 'pl_PL',
        alternateLocale: 'uk_UA',
        title: 'Tytuł',
        description: 'Opis',
        images: [PL_IMAGE],
      },
      twitter: { card: 'summary_large_image', title: 'Tytuł', description: 'Opis', images: [PL_IMAGE] },
    });
  });

  it('points the canonical and Open Graph url of a Ukrainian page at the /uk path', () => {
    const metadata = buildPageMetadata({ locale: 'uk', path: '/uslugi/kpir', title: 'Т', description: 'О' });
    expect(metadata.alternates).toEqual({
      canonical: '/uk/uslugi/kpir',
      languages: { pl: '/uslugi/kpir', uk: '/uk/uslugi/kpir', 'x-default': '/uslugi/kpir' },
    });
    expect(metadata.openGraph).toMatchObject({ url: '/uk/uslugi/kpir', locale: 'uk_UA', alternateLocale: 'pl_PL' });
  });

  it('maps the home page to /uk for Ukrainian', () => {
    const metadata = buildPageMetadata({ locale: 'uk', path: '/', title: 'Т', description: 'О' });
    expect(metadata.alternates).toEqual({
      canonical: '/uk',
      languages: { pl: '/', uk: '/uk', 'x-default': '/' },
    });
  });

  it.each([
    ['pl', '/', PL_IMAGE],
    ['pl', '/uslugi/kpir', PL_IMAGE],
    ['uk', '/', UK_IMAGE],
    ['uk', '/uslugi/kpir', UK_IMAGE],
  ] as const)('names the %s share image on %s for Open Graph and Twitter', (locale, path, image) => {
    const metadata = buildPageMetadata({ locale, path, title: 'T', description: 'D' });
    expect(metadata.openGraph).toMatchObject({ images: [image] });
    expect(metadata.twitter).toMatchObject({ images: [image] });
  });
});
