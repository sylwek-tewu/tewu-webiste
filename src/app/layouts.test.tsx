import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Metadata } from 'next';
import SiteLayout from '@/components/layout/SiteLayout';
import { PlLocaleProvider } from '@/i18n/PlLocaleProvider';
import { UkLocaleProvider } from '@/i18n/UkLocaleProvider';
import { SITE_LOCALE_HEADER } from '@/i18n/config';
import { SITE_URL } from '@/constants';
import PolishRootLayout, { metadata as plMetadata } from './(pl)/layout';
import UkrainianRootLayout, { metadata as ukMetadata } from './(uk)/layout';
import GlobalNotFound, { generateMetadata as notFoundMetadata } from './global-not-found';

// SiteLayout loads next/font, which needs the Next.js compiler; these tests only check its props.
vi.mock('@/components/layout/SiteLayout', () => ({ default: () => null }));

const requestHeaders = vi.hoisted(() => ({ value: new Headers() }));
vi.mock('next/headers', () => ({ headers: async () => requestHeaders.value }));

type ShellProps = { lang: string; LocaleProvider: unknown };

describe('root layouts', () => {
  it.each([
    ['Polish', PolishRootLayout, plMetadata, 'pl', PlLocaleProvider],
    ['Ukrainian', UkrainianRootLayout, ukMetadata, 'uk', UkLocaleProvider],
  ] as const)('%s: sets <html lang> and its own dictionary provider', (_, Layout, metadata, lang, Provider) => {
    const element = Layout({ children: null }) as React.ReactElement<ShellProps>;
    expect(element.type).toBe(SiteLayout);
    expect(element.props.lang).toBe(lang);
    expect(element.props.LocaleProvider).toBe(Provider);
    // Without it canonical and hreflang links would be relative, which search engines may ignore
    expect((metadata as Metadata).metadataBase?.toString()).toBe(`${SITE_URL}/`);
  });
});

describe('global-not-found', () => {
  beforeEach(() => {
    requestHeaders.value = new Headers();
  });

  it.each([
    ['uk', 'uk', UkLocaleProvider, 'Сторінку не знайдено'],
    ['pl', 'pl', PlLocaleProvider, 'Nie znaleziono strony'],
    [null, 'pl', PlLocaleProvider, 'Nie znaleziono strony'],
    ['xx', 'pl', PlLocaleProvider, 'Nie znaleziono strony'],
  ] as const)('header %s renders the %s site shell and title', async (header, lang, Provider, title) => {
    if (header) requestHeaders.value = new Headers({ [SITE_LOCALE_HEADER]: header });

    const element = (await GlobalNotFound()) as React.ReactElement<ShellProps>;
    expect(element.props.lang).toBe(lang);
    expect(element.props.LocaleProvider).toBe(Provider);

    const metadata = await notFoundMetadata();
    expect(metadata.title).toBe(`404 – ${title} | TEWU`);
    expect(metadata.robots).toEqual({ index: false });
  });
});
