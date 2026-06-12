'use client';

/**
 * Lightweight persistent client-side cache backed by localStorage.
 *
 * Public, read-only data (exchange rates, styles, packages, backgrounds)
 * changes at most every few minutes, yet the app was re-fetching it on every
 * page navigation. This stores each response once with a time-to-live (TTL)
 * so it is reused across navigations AND across visits until it expires.
 *
 * Everything degrades gracefully: on the server, in private-mode quota
 * errors, or with corrupt entries it simply behaves as a cache miss.
 */

const PREFIX = 'negasva-cache:';

interface Entry<T> {
  /** cached value */
  v: T;
  /** expiry, epoch milliseconds */
  e: number;
}

/** Read a fresh cached value, or null on miss / expiry / any error. */
export function readCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Entry<T>;
    if (typeof entry?.e !== 'number' || Date.now() > entry.e) {
      window.localStorage.removeItem(PREFIX + key);
      return null;
    }
    return entry.v;
  } catch {
    return null;
  }
}

/** Persist a value under `key` for `ttlMs` milliseconds. Non-fatal on error. */
export function writeCache<T>(key: string, value: T, ttlMs: number): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: Entry<T> = { v: value, e: Date.now() + ttlMs };
    window.localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // Quota exceeded or value not serializable — caching is best-effort.
  }
}

export interface CachedFetchOptions extends RequestInit {
  /** How long the response stays fresh in the client cache, in milliseconds. */
  ttlMs: number;
  /** Override the cache key (defaults to the request URL). */
  cacheKey?: string;
}

/**
 * Fetch JSON, served from the persistent client cache when still fresh.
 * On a miss it performs the network request and stores the result.
 * Throws on a non-OK response so callers can keep their existing fallbacks.
 */
export async function cachedFetchJson<T>(url: string, options: CachedFetchOptions): Promise<T> {
  const { ttlMs, cacheKey, ...init } = options;
  const key = cacheKey ?? url;

  const cached = readCache<T>(key);
  if (cached !== null) return cached;

  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = (await res.json()) as T;
  writeCache(key, data, ttlMs);
  return data;
}

/** Common TTLs (ms) for the app's public read-only data. */
export const TTL = {
  /** Exchange rates — refreshed hourly upstream. */
  rates: 60 * 60 * 1000,
  /** Catalog data editable from the admin panel; propagates within minutes. */
  catalog: 10 * 60 * 1000,
} as const;
