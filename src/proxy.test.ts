import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { proxy, config } from './proxy';
import { LOCALE_COOKIE_NAME, SITE_LOCALE_HEADER } from './i18n/config';

function createRequest(url: string, headers: Record<string, string> = {}, cookies: Record<string, string> = {}) {
  const req = new NextRequest(new URL(url, 'https://tewu.szczecin.pl'), {
    headers: new Headers(headers),
  });
  for (const [key, value] of Object.entries(cookies)) {
    req.cookies.set(key, value);
  }
  return req;
}

describe('Proxy language detection and routing', () => {
  it('redirects / to /uk when Accept-Language contains Ukrainian and no cookie is present', () => {
    const req = createRequest('/', { 'accept-language': 'uk-UA,uk;q=0.9,en;q=0.8' });
    const res = proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('https://tewu.szczecin.pl/uk');
  });

  it('redirects /kontakt to /uk/kontakt when Accept-Language contains Russian and no cookie is present', () => {
    const req = createRequest('/kontakt', { 'accept-language': 'ru-RU,ru;q=0.9,en;q=0.8' });
    const res = proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('https://tewu.szczecin.pl/uk/kontakt');
  });

  it('does NOT redirect when preferred_locale cookie is set to pl, even if browser is uk', () => {
    const req = createRequest('/', { 'accept-language': 'uk-UA,uk;q=0.9' }, { [LOCALE_COOKIE_NAME]: 'pl' });
    const res = proxy(req);

    // No redirection
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('does NOT redirect when preferred_locale cookie is set to uk, even if URL is /kontakt', () => {
    // When cookie is present, user can navigate to any URL without being hijacked
    const req = createRequest('/kontakt', { 'accept-language': 'uk-UA,uk;q=0.9' }, { [LOCALE_COOKIE_NAME]: 'uk' });
    const res = proxy(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('does NOT redirect when user is already on a /uk sub-path', () => {
    const req = createRequest('/uk/kontakt', { 'accept-language': 'uk-UA,uk;q=0.9' });
    const res = proxy(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('does NOT redirect when browser language is Polish', () => {
    const req = createRequest('/uslugi', { 'accept-language': 'pl-PL,pl;q=0.9,en;q=0.5' });
    const res = proxy(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('keeps shared caches from storing the language redirect', () => {
    const res = proxy(createRequest('/kontakt', { 'accept-language': 'uk' }));

    expect(res.status).toBe(307);
    expect(res.headers.get('vary')).toContain('Accept-Language');
    expect(res.headers.get('cache-control')).toBe('private, no-store');
  });

  it('ignores a cookie with an unsupported value and detects the language instead', () => {
    const req = createRequest('/', { 'accept-language': 'uk' }, { [LOCALE_COOKIE_NAME]: 'garbage' });

    expect(proxy(req).headers.get('location')).toBe('https://tewu.szczecin.pl/uk');
  });

  it('redirects a path that only starts with "uk" (e.g. /ukryte), as it is not Ukrainian', () => {
    const res = proxy(createRequest('/ukryte', { 'accept-language': 'uk' }));

    expect(res.headers.get('location')).toBe('https://tewu.szczecin.pl/uk/ukryte');
  });

  describe('locale header for the 404 page', () => {
    // NextResponse.next({ request: { headers } }) exposes overridden request headers this way
    const forwarded = (res: Response) => res.headers.get(`x-middleware-request-${SITE_LOCALE_HEADER}`);

    it.each([
      ['/uk/nie-ma', 'uk'],
      ['/uk', 'uk'],
      ['/nie-ma', 'pl'],
      ['/ukryte', 'pl'],
    ])('marks %s as %s', (path, locale) => {
      const res = proxy(createRequest(path, {}, { [LOCALE_COOKIE_NAME]: 'pl' }));
      expect(forwarded(res)).toBe(locale);
    });

    it('covers dotted paths under /uk, so they get the Ukrainian 404', () => {
      const matches = (path: string) => unstable_doesMiddlewareMatch({ config, url: path });
      expect(matches('/uk/stara-strona.php')).toBe(true);
      expect(matches('/uk')).toBe(true);
      expect(matches('/img/logo.png')).toBe(false);
      // Dotted Polish paths skip the proxy and fall back to the Polish 404
      expect(matches('/stara.php')).toBe(false);
      expect(matches('/api/callback')).toBe(false);
    });

    it('is set without a cookie too', () => {
      expect(forwarded(proxy(createRequest('/uk/nie-ma')))).toBe('uk');
    });
  });
});
