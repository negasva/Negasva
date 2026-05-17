/**
 * In-memory rate limiter.
 *
 * Trade-off: state is per-instance and resets on cold start. On serverless
 * platforms (Vercel) each warm container has its own bucket, so the real
 * cap is roughly `max * activeInstances` per window. That is still a
 * meaningful first line of defence against burst floods, scraping, and
 * brute-force enumeration. For a hard global cap, swap this for Upstash
 * Redis (preserves the same checkRateLimit() signature).
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX = 30;
const MAX_BUCKETS = 10_000;

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
  retryAfter: number;
};

export type RateLimitOpts = {
  /** Window length in milliseconds. Default 60_000. */
  windowMs?: number;
  /** Max requests per window. Default 30. */
  max?: number;
  /** Namespace so different routes can't collide on the same key. */
  prefix?: string;
};

function evictExpired(now: number): void {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [k, v] of buckets) {
    if (v.resetAt <= now) buckets.delete(k);
  }
}

export function checkRateLimit(
  key: string,
  opts: RateLimitOpts = {},
): RateLimitResult {
  const windowMs = opts.windowMs ?? DEFAULT_WINDOW_MS;
  const max = opts.max ?? DEFAULT_MAX;
  const fullKey = `${opts.prefix ?? 'default'}:${key}`;
  const now = Date.now();

  evictExpired(now);

  const rec = buckets.get(fullKey);

  if (!rec || rec.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(fullKey, { count: 1, resetAt });
    return { ok: true, remaining: max - 1, resetAt, retryAfter: 0 };
  }

  rec.count += 1;
  const remaining = Math.max(0, max - rec.count);
  const ok = rec.count <= max;
  return {
    ok,
    remaining,
    resetAt: rec.resetAt,
    retryAfter: ok ? 0 : Math.ceil((rec.resetAt - now) / 1000),
  };
}

export function clearRateLimitFor(key: string, prefix = 'default'): void {
  buckets.delete(`${prefix}:${key}`);
}
