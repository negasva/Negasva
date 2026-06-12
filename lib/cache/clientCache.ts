'use client';

/**
 * Lightweight client-side fetch cache.
 *
 * Goal: catalog data that rarely changes (styles, backgrounds, packages,
 * exchange rates...) should be fetched ONCE per browser session and reused
 * everywhere, instead of hitting the network on every component mount or
 * navigation.
 *
 * Three layers, checked in order:
 *  1. In-memory map        — instant, survives client-side navigation.
 *  2. sessionStorage       — survives full page reloads within a tab.
 *  3. In-flight dedupe     — concurrent callers share a single request.
 *
 * Entries expire after `ttlMs` (default 5 min) so stale data eventually
 * refreshes without forcing a hard reload.
 */

interface CacheEntry<T> {
  value: T;
  expires: number;
}

const memory = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const STORAGE_PREFIX = 'negasva-cache:';

function readSession<T>(key: string): CacheEntry<T> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry<T>;
  } catch {
    return null;
  }
}

function writeSession<T>(key: string, entry: CacheEntry<T>): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Quota exceeded or storage unavailable — in-memory cache still works.
  }
}

/**
 * Fetch a JSON resource, returning a cached copy when one is still fresh.
 * The result is stored once and reused for the rest of the session.
 */
export async function cachedFetchJSON<T>(
  url: string,
  options: { ttlMs?: number; init?: RequestInit } = {},
): Promise<T> {
  const { ttlMs = DEFAULT_TTL, init } = options;
  const key = url;
  const now = Date.now();

  // 1. In-memory hit.
  const mem = memory.get(key) as CacheEntry<T> | undefined;
  if (mem && mem.expires > now) return mem.value;

  // 2. sessionStorage hit — rehydrate memory and return.
  const stored = readSession<T>(key);
  if (stored && stored.expires > now) {
    memory.set(key, stored);
    return stored.value;
  }

  // 3. Share any request already in flight for this key.
  const pending = inflight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const request = fetch(url, init)
    .then(async (res) => {
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const value = (await res.json()) as T;
      const entry: CacheEntry<T> = { value, expires: Date.now() + ttlMs };
      memory.set(key, entry);
      writeSession(key, entry);
      return value;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, request);
  return request;
}

/** Drop a cached entry (e.g. after a mutation) so the next read is fresh. */
export function invalidateCache(url: string): void {
  memory.delete(url);
  inflight.delete(url);
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.removeItem(STORAGE_PREFIX + url);
    } catch {
      // ignore
    }
  }
}
