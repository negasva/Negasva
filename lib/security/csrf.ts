import crypto from 'crypto';
import { Redis } from '@upstash/redis';

/**
 * One-time CSRF tokens with two backends:
 *
 *  1. Upstash Redis (preferred on serverless). Tokens are stored with a native
 *     TTL and consumed atomically, so they survive across Vercel instances and
 *     cold starts — an in-memory Map cannot, which is why the original
 *     implementation was effectively a no-op in production.
 *
 *  2. In-memory fallback (original behaviour) when Upstash is not configured.
 *
 * Because Redis access is asynchronous, these functions now return Promises.
 * The behaviour (single-use, 30-minute expiry) is unchanged.
 */

const tokens = new Map<string, number>();
const TOKEN_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
const TOKEN_EXPIRY_S = 30 * 60;
const REDIS_PREFIX = 'negasva-csrf:';

const upstashEnabled =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
function getRedis(): Redis {
  if (!redis) redis = Redis.fromEnv();
  return redis;
}

export async function generateCSRFToken(): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');

  if (upstashEnabled) {
    try {
      await getRedis().set(`${REDIS_PREFIX}${token}`, '1', { ex: TOKEN_EXPIRY_S });
      return token;
    } catch {
      // fall through to in-memory
    }
  }

  tokens.set(token, Date.now());
  return token;
}

export async function validateCSRFToken(token: string): Promise<boolean> {
  if (upstashEnabled) {
    try {
      // Atomic single-use: GETDEL returns the value and removes it in one op.
      const found = await getRedis().getdel(`${REDIS_PREFIX}${token}`);
      return found !== null;
    } catch {
      // fall through to in-memory
    }
  }

  const timestamp = tokens.get(token);
  if (!timestamp) return false;

  tokens.delete(token);
  if (Date.now() - timestamp > TOKEN_EXPIRY_MS) return false;
  return true;
}

/** In-memory housekeeping. Redis entries expire on their own via TTL. */
export function cleanExpiredTokens(): void {
  const now = Date.now();
  for (const [token, timestamp] of tokens.entries()) {
    if (now - timestamp > TOKEN_EXPIRY_MS) {
      tokens.delete(token);
    }
  }
}
