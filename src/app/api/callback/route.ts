/**
 * API Route Handler: POST /api/callback
 * Serverless function for processing callback quote requests.
 * Thin HTTP adapter delegating business logic to the submitCallbackLead delivery pipeline.
 */

import { NextRequest, NextResponse } from 'next/server';
import { submitCallbackLead } from '@/lib/callback/delivery-pipeline';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowe dane formularza', code: 'invalid_request' }, { status: 400 });
  }

  const result = await submitCallbackLead(body);

  switch (result.status) {
    case 'delivered':
      return NextResponse.json({ success: true, id: result.id, delivery: 'direct' }, { status: 200 });
    case 'buffered':
      return NextResponse.json({ success: true, id: result.id, delivery: 'buffered' }, { status: 200 });
    case 'silently_ignored':
      return NextResponse.json({ success: true, id: 'OK' }, { status: 200 });
    case 'validation_error':
      return NextResponse.json({ error: result.message, code: result.code }, { status: 400 });
    case 'fallback_office_call':
      return NextResponse.json(
        {
          error: `${result.message} ${result.callNumber.display}`,
          code: result.code,
          callNumber: result.callNumber.display,
          telUri: result.callNumber.telUri,
        },
        { status: result.httpStatus }
      );
  }
}
