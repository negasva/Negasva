import { NextResponse } from 'next/server';
import { checkRateLimit, type RateLimitOpts, type RateLimitResult } from './rateLimit';

/**
 * Extract the client IP from request headers. On Vercel, x-forwarded-for is
 * client-controllable (the attacker can prepend any fake IP), so prefer, in
 * order: request.ip (set by the platform), x-vercel-forwarded-for (also
 * platform-set, not attacker-reachable), x-real-ip, and only as a last
 * resort the LAST hop of x-forwarded-for — the entry closest to our edge,
 * which the platform proxy appended and the client can't spoof. The first
 * hop is attacker-controlled and never trusted. Falls back to 'unknown' so
 * the rate limiter still keys on something stable per request batch (M2).
 */
export function getClientIp(request: Request): string {
  const ip = (request as { ip?: string }).ip;
  if (ip) return ip;
  const h = request.headers;
  const trusted = h.get('x-vercel-forwarded-for') || h.get('x-real-ip');
  if (trusted) return trusted.trim();
  const last = h.get('x-forwarded-for')?.split(',').map((s) => s.trim()).filter(Boolean).pop();
  return last || 'unknown';
}

/**
 * Lightweight CSRF check using the Origin header. Browsers always send
 * Origin on POST/PUT/PATCH/DELETE, and a forged cross-site request cannot
 * spoof it. Combined with SameSite=Lax/Strict cookies (Supabase default)
 * this blocks classic CSRF without needing per-form tokens.
 */
export function validateSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;

  const host = request.headers.get('host');
  if (!host) return false;

  try {
    const originHost = new URL(origin).host;
    if (originHost === host) return true;
  } catch {
    return false;
  }

  const allowed = process.env.ALLOWED_ORIGINS?.split(',').map(s => s.trim()) ?? [];
  return allowed.includes(origin);
}

// Admin/API responses can expose order, customer or photo data. Keep them out
// of shared caches and the browser back/forward cache (B1).
const NO_STORE = { 'Cache-Control': 'no-store, no-cache' } as const;

/**
 * Generic error response. Logs the internal detail server-side but never
 * leaks it to the client — prevents schema/constraint disclosure via
 * Supabase error messages.
 */
export function errorResponse(
  publicMessage: string,
  status: number,
  internal?: unknown,
): NextResponse {
  if (internal !== undefined) {
    console.error(`[api ${status}] ${publicMessage}`, internal);
  }
  return NextResponse.json({ error: publicMessage }, { status, headers: NO_STORE });
}

/**
 * Success JSON response for admin routes. Adds Cache-Control: no-store so
 * order/customer/photo data never lands in a shared or browser cache (B1).
 */
export function successAdminResponse(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export function rateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please try again shortly.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfter || 60),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
      },
    },
  );
}

/**
 * Convenience: rate-limit a request by IP and return the 429 response if
 * exceeded, otherwise null. Caller continues if it returns null.
 */
export async function rateLimitByIp(
  request: Request,
  opts: RateLimitOpts,
): Promise<NextResponse | null> {
  const ip = getClientIp(request);
  const result = await checkRateLimit(ip, opts);
  if (!result.ok) return rateLimitResponse(result);
  return null;
}

/**
 * Pick only the listed keys from an object. Use on PUT bodies to prevent
 * arbitrary-field updates (e.g. clients setting hidden columns).
 */
export function pickFields<T extends Record<string, unknown>>(
  body: T,
  allowed: readonly (keyof T)[],
): Partial<T> {
  const out: Partial<T> = {};
  for (const k of allowed) {
    if (k in body && body[k] !== undefined) out[k] = body[k];
  }
  return out;
}

/** Safe JSON body parser with a size limit (defaults to ~32 KB of text). */
export async function readJson<T = unknown>(
  request: Request,
  maxBytes = 32 * 1024,
): Promise<T | null> {
  const len = Number(request.headers.get('content-length') || 0);
  if (len && len > maxBytes) return null;
  try {
    const text = await request.text();
    if (text.length > maxBytes) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
