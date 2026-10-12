import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Password for a Preview Deployment: HTTP Basic Auth, on when PREVIEW_BASIC_AUTH ("user:password")
 * is set. In Coolify it is set only as a Preview variable, so the Production Deployment stays public.
 */

// The container health check has no password; the outbox endpoint has its own CRON_SECRET.
function isExempt(pathname: string): boolean {
  return pathname === '/api/health' || pathname.startsWith('/api/internal/');
}

function credentialsOf(authorization: string | null): string | null {
  const match = authorization ? /^basic\s+(\S+)$/i.exec(authorization) : null;
  return match ? Buffer.from(match[1], 'base64').toString('utf8') : null;
}

// Hashing both sides gives equal-length buffers, so the comparison leaks neither content nor length.
function safeEqual(a: string, b: string): boolean {
  const digest = (value: string) => crypto.createHash('sha256').update(value).digest();
  return crypto.timingSafeEqual(digest(a), digest(b));
}

let warnedAboutFormat = false;

// A value pasted with surrounding spaces, or without the colon, keeps everyone out with no hint why.
function warnIfMalformed(expected: string) {
  if (warnedAboutFormat || (expected.includes(':') && expected === expected.trim())) return;
  warnedAboutFormat = true;
  console.warn('[Preview Auth] PREVIEW_BASIC_AUTH should be "user:password" without surrounding spaces; nobody can log in.');
}

/** A 401 asking for the password, or null when the request may go on. */
export function rejectWithoutPreviewPassword(request: NextRequest): NextResponse | null {
  const expected = process.env.PREVIEW_BASIC_AUTH;
  if (!expected || isExempt(request.nextUrl.pathname)) return null;
  warnIfMalformed(expected);

  const provided = credentialsOf(request.headers.get('authorization'));
  if (provided !== null && safeEqual(provided, expected)) return null;

  return new NextResponse('Podgląd dostępny tylko dla zespołu TEWU.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="TEWU preview", charset="UTF-8"',
      'Cache-Control': 'no-store',
    },
  });
}
