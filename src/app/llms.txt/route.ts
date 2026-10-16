import { buildLlmsTxt } from '@/lib/llms-txt';

// Built once at build time: the content changes only with a deployment.
export const dynamic = 'force-static';

export function GET(): Response {
  return new Response(buildLlmsTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
