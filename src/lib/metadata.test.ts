import { describe, it, expect } from 'vitest';
import { buildPageMetadata } from './metadata';

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
      },
      twitter: { card: 'summary_large_image', title: 'Tytuł', description: 'Opis' },
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

  it('leaves Open Graph images to the file-based opengraph-image routes', () => {
    const metadata = buildPageMetadata({ locale: 'pl', path: '/', title: 'T', description: 'D' });
    expect(metadata.openGraph).not.toHaveProperty('images');
    expect(metadata.twitter).not.toHaveProperty('images');
  });
});
