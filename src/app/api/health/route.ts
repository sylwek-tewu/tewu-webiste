/**
 * API Route Handler: GET /api/health
 * Liveness check for the container HEALTHCHECK. Deliberately does not touch the outbox database:
 * its failures are reported on Telegram and must not block a rolling update. Open on a Preview
 * Deployment too (see src/lib/preview-auth.ts).
 */

export const dynamic = 'force-dynamic';

export function GET() {
  return new Response('ok', { headers: { 'Cache-Control': 'no-store' } });
}
