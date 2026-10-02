import { NextResponse, type NextRequest } from 'next/server';
import { detectLocaleFromAcceptLanguage } from './i18n/detect-locale';
import { LOCALE_COOKIE_NAME } from './i18n';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if user already has an explicit preference stored in cookie
  const preferredLocaleCookie = request.cookies.get(LOCALE_COOKIE_NAME)?.value;

  // If user already has a saved preference, respect the requested URL
  if (preferredLocaleCookie) {
    return NextResponse.next();
  }

  // 2. No preference cookie set: check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  const detectedLocale = detectLocaleFromAcceptLanguage(acceptLanguage);

  if (detectedLocale === 'uk') {
    // If not already on /uk route, redirect to /uk equivalent (307 Temporary Redirect)
    if (!pathname.startsWith('/uk')) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = pathname === '/' ? '/uk' : `/uk${pathname}`;
      return NextResponse.redirect(redirectUrl, { status: 307 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (Next.js assets)
     * - api routes
     * - static files with extensions (e.g. .svg, .png, .jpg, .ico, .pdf)
     */
    '/((?!api/|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
