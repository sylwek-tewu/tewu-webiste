// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithMantine } from '@/test/render';
import { getDictionary, type Locale } from '@/i18n';
import { Hero } from '@/components/home/Hero';
import { WhyUs } from '@/components/home/WhyUs';
import AboutClient from './(pl)/o-nas/AboutClient';
import CertificatesClient from './(pl)/certyfikaty/CertificatesClient';
import { CallbackProvider } from '@/components/callback-widget';
import FaqPage from '@/components/faq/FaqPage';
import ServiceLandingPage from '@/components/service-pages/ServiceLandingPage';
import ContactClient from './(pl)/kontakt/ContactClient';
import { FAQ_UPDATED_AT, getFaqContent } from '@/content/faq';
import { getServicePageContent } from '@/content/service-pages';

type Size = { width: string; height: string };

function imgsOf(container: HTMLElement): Record<string, HTMLImageElement> {
  return Object.fromEntries(
    Array.from(container.querySelectorAll('img')).map((img) => [new URL(img.src).pathname, img])
  );
}

// Intrinsic pixel sizes of the files in public/img (read with `file`), so the browser reserves
// the space before the file arrives. Every image is lazy: none is in the first mobile viewport,
// and the hero and "Why us" photos are hidden on mobile (a lazy image hidden by CSS is not fetched).
// The exception is the FAQ building photo, the LCP element of that page, which loads first.
// The office photos elsewhere (service CTA, about, contact) sit below the first screen, so they stay lazy.
const PHOTOS: Record<string, Size> = {
  '/img/stock/hero-office.jpg': { width: '1200', height: '689' },
  '/img/stock/team-at-work.jpg': { width: '800', height: '533' },
  '/img/stock/business-meeting.jpg': { width: '800', height: '533' },
};

const CERTIFICATES: Record<string, Size> = {
  '/img/cert.png': { width: '1200', height: '761' },
  '/img/library.png': { width: '1200', height: '1680' },
};

/** The AVIF sources of every <picture>, in page order. */
function avifSources(container: HTMLElement) {
  return [...container.querySelectorAll('picture source')].map((s) => [s.getAttribute('type'), s.getAttribute('srcset')]);
}

function expectLoadingAttributes(img: HTMLImageElement | null | undefined, size: Size) {
  expect(img).toBeTruthy();
  expect(img).toHaveAttribute('width', size.width);
  expect(img).toHaveAttribute('height', size.height);
  expect(img).toHaveAttribute('decoding', 'async');
  expect(img).toHaveAttribute('loading', 'lazy');
}

describe.each(['pl', 'uk'] as Locale[])('image dimensions and lazy loading (%s)', (locale) => {
  it('sizes the hero photo and loads it lazily', () => {
    const { container } = renderWithMantine(<Hero />, { locale });
    const path = '/img/stock/hero-office.jpg';
    expectLoadingAttributes(imgsOf(container)[path], PHOTOS[path]);
  });

  it('sizes the "Why us" photos and loads them lazily', () => {
    const { container } = renderWithMantine(<WhyUs />, { locale });
    const imgs = imgsOf(container);
    for (const path of ['/img/stock/team-at-work.jpg', '/img/stock/business-meeting.jpg']) {
      expectLoadingAttributes(imgs[path], PHOTOS[path]);
    }
  });

  it('loads the FAQ building photo first (LCP) and the reception photo lazily, AVIF first', () => {
    const { container } = renderWithMantine(
      <CallbackProvider>
        <FaqPage content={getFaqContent(locale)} updatedAt={FAQ_UPDATED_AT} />
      </CallbackProvider>,
      { locale }
    );
    const imgs = imgsOf(container);
    const building = imgs['/img/biuro/budynek.jpg'];
    expect(building).toHaveAttribute('width', '960');
    expect(building).toHaveAttribute('height', '720');
    expect(building).toHaveAttribute('loading', 'eager');
    expect(building).toHaveAttribute('fetchpriority', 'high');
    expectLoadingAttributes(imgs['/img/biuro/recepcja.jpg'], { width: '1200', height: '900' });
    expect(avifSources(container)).toEqual([
      ['image/avif', '/img/biuro/budynek.avif'],
      ['image/avif', '/img/biuro/recepcja.avif'],
    ]);
  });

  it('loads the reception photo in the service page CTA lazily, AVIF first', () => {
    const { container } = renderWithMantine(
      <CallbackProvider>
        <ServiceLandingPage content={getServicePageContent(locale, 'kpir')} />
      </CallbackProvider>,
      { locale }
    );
    expectLoadingAttributes(imgsOf(container)['/img/biuro/recepcja.jpg'], { width: '1200', height: '900' });
    expect(avifSources(container)).toEqual([['image/avif', '/img/biuro/recepcja.avif']]);
  });

  it('sizes the office photo on the about page and loads it lazily, AVIF first', () => {
    const { container } = renderWithMantine(<AboutClient />, { locale });
    expectLoadingAttributes(imgsOf(container)['/img/biuro/zespol.jpg'], { width: '1200', height: '900' });
    expect(avifSources(container)).toEqual([['image/avif', '/img/biuro/zespol.avif']]);
  });

  it('loads the entrance photo on the contact page lazily, AVIF first', () => {
    const { container } = renderWithMantine(<ContactClient />, { locale });
    expectLoadingAttributes(imgsOf(container)['/img/biuro/budynek.jpg'], { width: '960', height: '720' });
    expect(avifSources(container)).toEqual([['image/avif', '/img/biuro/budynek.avif']]);
  });

  it('sizes the certificate thumbnails, loads them lazily and offers AVIF first', () => {
    const { container } = renderWithMantine(<CertificatesClient />, { locale });
    const { items } = getDictionary(locale).certificates;
    const pictures = Array.from(container.querySelectorAll('picture'));
    expect(pictures).toHaveLength(items.length);
    pictures.forEach((picture, i) => {
      const img = picture.querySelector('img');
      expectLoadingAttributes(img, CERTIFICATES[items[i].url]);
      expect(img).toHaveAttribute('src', items[i].url);
      const source = picture.querySelector('source');
      expect(source).toHaveAttribute('type', 'image/avif');
      expect(source).toHaveAttribute('srcset', items[i].url.replace(/\.png$/, '.avif'));
    });
  });
});
