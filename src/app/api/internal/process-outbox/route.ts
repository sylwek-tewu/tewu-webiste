import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { runOutboxProcessing } from '@/lib/outbox';

function isValidSecret(provided: string | null | undefined, expected: string): boolean {
  if (!provided) return false;
  const bufProvided = Buffer.from(provided);
  const bufExpected = Buffer.from(expected);
  if (bufProvided.length !== bufExpected.length) return false;
  return crypto.timingSafeEqual(bufProvided, bufExpected);
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Process Outbox API] CRON_SECRET is not configured in production environment.');
      return NextResponse.json(
        { error: 'Server configuration error: CRON_SECRET is required' },
        { status: 500 }
      );
    }
  }

  const authHeader = request.headers.get('authorization');
  const cronSecretHeader = request.headers.get('x-cron-secret');

  const match = authHeader ? /^bearer\s+(.+)$/i.exec(authHeader) : null;
  const bearerToken = match ? match[1].trim() : null;
  const providedSecret = bearerToken || cronSecretHeader;

  if (expectedSecret && !isValidSecret(providedSecret, expectedSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runOutboxProcessing();
    console.info('[Process Outbox API] Run finished:', JSON.stringify(result));
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[Process Outbox API] Unexpected error processing outbox:', error);
    return NextResponse.json(
      { error: 'Internal server error processing outbox' },
      { status: 500 }
    );
  }
}
