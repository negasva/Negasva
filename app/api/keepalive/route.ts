import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { rateLimitByIp } from '@/lib/security/apiHelpers';

// Always run on the server, on demand. Never statically optimized or cached:
// every ping MUST actually execute a query against Supabase, otherwise the
// keep-alive is worthless (a cached 200 would not touch the database).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Keep-alive endpoint for Supabase free tier.
 *
 * Supabase pauses free projects after ~7 days of inactivity. A real read
 * query against the database resets that timer. An external monitor
 * (e.g. UptimeRobot) hits this endpoint on a schedule; we run an authentic
 * `SELECT` against an existing table and only return 200 `{ ok: true }`
 * when that query actually succeeds.
 *
 * Security:
 *  - Uses the service role key, which lives ONLY server-side. It is read
 *    from process.env here and never reaches the client bundle.
 *  - Optional shared secret: if KEEPALIVE_SECRET is set, callers must pass
 *    it via `?token=` or the `x-keepalive-token` header. If it is not set,
 *    the endpoint is open but still rate-limited and read-only.
 */
export async function GET(request: Request) {
  // Modest rate limit. UptimeRobot pings every few minutes from rotating
  // IPs, so this never trips for legitimate use — it just blocks abuse.
  const rl = rateLimitByIp(request, { prefix: 'keepalive', max: 30, windowMs: 60_000 });
  if (rl) return rl;

  // Optional shared-secret gate.
  const secret = process.env.KEEPALIVE_SECRET;
  if (secret) {
    const { searchParams } = new URL(request.url);
    const provided = searchParams.get('token') || request.headers.get('x-keepalive-token');
    if (provided !== secret) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } },
      );
    }
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json(
      { ok: false, error: 'Supabase not configured' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const startedAt = Date.now();
  const supabase = createServiceClient();

  // Authentic read against an existing, stable table. `head: true` returns
  // just the row count (no payload), which is enough to make PostgreSQL run
  // the query and keep the project active. No writes, no side effects.
  const { count, error } = await supabase
    .from('prices')
    .select('key', { count: 'exact', head: true });

  if (error) {
    return NextResponse.json(
      { ok: false, error: 'Supabase query failed' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      table: 'prices',
      rowCount: count ?? null,
      durationMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  );
}
