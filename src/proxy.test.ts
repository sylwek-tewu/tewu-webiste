import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

// The password check must not depend on the shell running the tests
beforeEach(() => {
  vi.stubEnv('PREVIEW_BASIC_AUTH', '');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

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

  describe('metadata routes', () => {
    // Next serves the share image without a dot in the path, so it looks like a page
    it.each(['/opengraph-image-35ziip', '/uk/opengraph-image-1xrru2', '/twitter-image-abc123', '/icon-1a2b3c', '/apple-icon.png'])(
      'passes %s through without a language redirect',
      (path) => {
        const res = proxy(createRequest(path, { 'accept-language': 'uk-UA,uk;q=0.9' }));
        expect(res.status).toBe(200);
        expect(res.headers.get('location')).toBeNull();
      },
    );

    it('still redirects pages whose name only starts like a metadata route', () => {
      const res = proxy(createRequest('/iconografia', { 'accept-language': 'uk' }));
      expect(res.headers.get('location')).toBe('https://tewu.szczecin.pl/uk/iconografia');
    });
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
      expect(forwarded(proxy(createRequest('/uk/stara-strona.php')))).toBe('uk');
    });

    it.each(['/stara.php', '/img/logo.png', '/api/callback', '/_next/static/chunks/main.js', '/favicon.ico'])(
      'leaves %s alone, as it is not a page',
      (path) => {
        // Dotted Polish paths fall back to the Polish 404 without the header
        const res = proxy(createRequest(path, { 'accept-language': 'uk' }));
        expect(res.headers.get('location')).toBeNull();
        expect(forwarded(res)).toBeNull();
      },
    );

    it('is set without a cookie too', () => {
      expect(forwarded(proxy(createRequest('/uk/nie-ma')))).toBe('uk');
    });
  });
});

describe('Preview Deployment password', () => {
  const CREDENTIALS = 'TEWUtester:sekret:z:dwukropkami';
  const basic = (credentials: string) => `Basic ${Buffer.from(credentials).toString('base64')}`;

  it('runs the proxy on every path, assets and API routes included', () => {
    const matches = (path: string) => unstable_doesMiddlewareMatch({ config, url: path });
    for (const path of ['/', '/uk', '/kontakt', '/img/logo.png', '/api/callback', '/_next/static/chunks/main.js']) {
      expect(matches(path)).toBe(true);
    }
  });

  it('lets everyone in when PREVIEW_BASIC_AUTH is not set (Production Deployment)', () => {
    expect(proxy(createRequest('/kontakt')).status).toBe(200);
  });

  it.each(['/', '/uk/kontakt', '/img/logo.png', '/api/callback', '/_next/static/chunks/main.js'])(
    'asks for the password on %s',
    (path) => {
      vi.stubEnv('PREVIEW_BASIC_AUTH', CREDENTIALS);
      const res = proxy(createRequest(path));

      expect(res.status).toBe(401);
      expect(res.headers.get('www-authenticate')).toMatch(/^Basic realm="[^"]+", charset="UTF-8"$/);
      expect(res.headers.get('cache-control')).toBe('no-store');
    },
  );

  it.each([
    ['a wrong password', basic('TEWUtester:zle-haslo')],
    ['a wrong user', basic('ktos:sekret:z:dwukropkami')],
    ['a password prefix', basic('TEWUtester:sekret')],
    ['a non-Basic scheme', 'Bearer sekret'],
    ['an empty Basic value', 'Basic '],
    ['malformed base64', 'Basic !!!'],
  ])('rejects %s', (_, authorization) => {
    vi.stubEnv('PREVIEW_BASIC_AUTH', CREDENTIALS);
    expect(proxy(createRequest('/', { authorization })).status).toBe(401);
  });

  it('lets the team in with the right credentials and keeps the language redirect', () => {
    vi.stubEnv('PREVIEW_BASIC_AUTH', CREDENTIALS);
    const authorization = basic(CREDENTIALS);

    expect(proxy(createRequest('/kontakt', { authorization })).status).toBe(200);
    expect(proxy(createRequest('/kontakt', { authorization, 'accept-language': 'uk' })).headers.get('location')).toBe(
      'https://tewu.szczecin.pl/uk/kontakt',
    );
  });

  it('accepts the scheme name in any letter case', () => {
    vi.stubEnv('PREVIEW_BASIC_AUTH', CREDENTIALS);
    const authorization = basic(CREDENTIALS).replace('Basic', 'basic');
    expect(proxy(createRequest('/', { authorization })).status).toBe(200);
  });

  it.each(['/api/health', '/api/internal/process-outbox'])('leaves %s open, as it is not for people', (path) => {
    // The container health check has no password; the outbox endpoint has its own CRON_SECRET
    vi.stubEnv('PREVIEW_BASIC_AUTH', CREDENTIALS);
    expect(proxy(createRequest(path, { authorization: 'Bearer cron-secret' })).status).toBe(200);
  });

  it('warns once when the value cannot be typed into a browser prompt', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubEnv('PREVIEW_BASIC_AUTH', ' TEWUtester-bez-dwukropka ');
    proxy(createRequest('/'));
    proxy(createRequest('/'));

    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it('does not open paths that only start like the exempt ones', () => {
    vi.stubEnv('PREVIEW_BASIC_AUTH', CREDENTIALS);
    expect(proxy(createRequest('/api/healthz')).status).toBe(401);
    expect(proxy(createRequest('/api/internalx')).status).toBe(401);
  });
});
