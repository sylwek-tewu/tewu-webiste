import { NextResponse, type NextRequest } from 'next/server';
import { detectLocaleFromAcceptLanguage } from './i18n/detect-locale';
import { LOCALE_COOKIE_NAME, SITE_LOCALE_HEADER, isSupportedLocale, localeOfPath } from './i18n/config';
import { rejectWithoutPreviewPassword } from './lib/preview-auth';

/**
 * Language handling covers pages only: not API routes, Next.js assets or static files (paths with
 * a dot), except everything under /uk, dotted paths too (no static files live there), so a missing
 * /uk/old.php still gets the Ukrainian 404.
 */
function isPage(pathname: string): boolean {
  if (localeOfPath(pathname) === 'uk') return true;
  return !/^\/(api\/|_next\/static|_next\/image|favicon\.ico)/.test(pathname) && !pathname.includes('.');
}

function continueWithLocale(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set(SITE_LOCALE_HEADER, localeOfPath(request.nextUrl.pathname));
  return NextResponse.next({ request: { headers } });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const unauthorized = rejectWithoutPreviewPassword(request);
  if (unauthorized) return unauthorized;

  if (!isPage(pathname)) return NextResponse.next();

  // 1. An explicit, valid preference stored in the cookie: respect the requested URL
  const preferredLocaleCookie = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (preferredLocaleCookie && isSupportedLocale(preferredLocaleCookie)) {
    return continueWithLocale(request);
  }

  // 2. No (valid) preference: check Accept-Language
  const detectedLocale = detectLocaleFromAcceptLanguage(request.headers.get('accept-language'));

  if (detectedLocale === 'uk' && localeOfPath(pathname) !== 'uk') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname === '/' ? '/uk' : `/uk${pathname}`;
    const response = NextResponse.redirect(redirectUrl, { status: 307 });
    // The redirect depends on the visitor's languages, so no shared cache may store it.
    response.headers.set('Vary', 'Accept-Language, Cookie');
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  }

  return continueWithLocale(request);
}

export const config = {
  // Every path: on a Preview Deployment assets and API routes need the password too
  matcher: '/:path*',
};
