/**
 * Rate limiter with two backends:
 *
 *  1. Upstash Redis (preferred on serverless). When the env vars
 *     UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are present, a
 *     sliding-window limiter backed by Redis is used. This gives a single
 *     GLOBAL cap shared across every Vercel instance — the only way to get a
 *     real hard limit on serverless.
 *
 *  2. In-memory fallback (original behaviour). When Upstash is NOT configured
 *     (e.g. local dev), it falls back to a per-instance in-memory map. The
 *     trade-off is the same as before: state is per-instance and resets on
 *     cold start, so the real cap is roughly `max * activeInstances`.
 *
 * NOTE: because Redis access is asynchronous, `checkRateLimit` now returns a
 * Promise. The result shape (`RateLimitResult`) and semantics are unchanged,
 * so callers only need to `await` it.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

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

// ── Upstash backend ────────────────────────────────────────────────────────

const upstashEnabled =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
function getRedis(): Redis {
  if (!redis) redis = Redis.fromEnv();
  return redis;
}

// One Ratelimit instance per (prefix, max, windowMs) combination. The
// algorithm and limits are fixed at construction time, so we memoize them.
const limiters = new Map<string, Ratelimit>();

function getLimiter(prefix: string, max: number, windowMs: number): Ratelimit {
  const cacheKey = `${prefix}:${max}:${windowMs}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
    limiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(max, `${windowSeconds} s`),
      prefix: `negasva-rl:${prefix}`,
      analytics: false,
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

async function checkRateLimitUpstash(
  key: string,
  prefix: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const limiter = getLimiter(prefix, max, windowMs);
  const { success, remaining, reset } = await limiter.limit(key);
  const now = Date.now();
  return {
    ok: success,
    remaining: Math.max(0, remaining),
    resetAt: reset,
    retryAfter: success ? 0 : Math.max(1, Math.ceil((reset - now) / 1000)),
  };
}

// ── In-memory fallback (original implementation) ─────────────────────────────

function evictExpired(now: number): void {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [k, v] of buckets) {
    if (v.resetAt <= now) buckets.delete(k);
  }
}

function checkRateLimitMemory(
  fullKey: string,
  max: number,
  windowMs: number,
): RateLimitResult {
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

// ── Public API ───────────────────────────────────────────────────────────────

export async function checkRateLimit(
  key: string,
  opts: RateLimitOpts = {},
): Promise<RateLimitResult> {
  const windowMs = opts.windowMs ?? DEFAULT_WINDOW_MS;
  const max = opts.max ?? DEFAULT_MAX;
  const prefix = opts.prefix ?? 'default';

  if (upstashEnabled) {
    try {
      return await checkRateLimitUpstash(key, prefix, max, windowMs);
    } catch {
      // If Redis is unreachable, fail open to the in-memory limiter rather
      // than locking everyone out (availability over a hard global cap).
    }
  }

  return checkRateLimitMemory(`${prefix}:${key}`, max, windowMs);
}

export function clearRateLimitFor(key: string, prefix = 'default'): void {
  buckets.delete(`${prefix}:${key}`);
}
