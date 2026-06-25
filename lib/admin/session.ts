import { createHmac, timingSafeEqual } from 'crypto';

// Single-password admin auth: a signed, httpOnly session cookie instead of
// Supabase Auth users. Token = "<issuedAt>.<HMAC(issuedAt)>". The HMAC key is
// ADMIN_SESSION_SECRET, falling back to ADMIN_PASSWORD so a single env var is
// enough (rotating the password also invalidates live sessions — intended).

export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12h, in seconds

function key(): string {
  const k = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!k) throw new Error('ADMIN_PASSWORD not configured');
  return k;
}

function sign(value: string): string {
  return createHmac('sha256', key()).update(value).digest('hex');
}

// Constant-time string compare that never throws on length mismatch.
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function createSessionToken(): string {
  const issued = Date.now().toString();
  return `${issued}.${sign(issued)}`;
}

export function verifySessionToken(token?: string | null): boolean {
  if (!token) return false;
  const dot = token.indexOf('.');
  if (dot <= 0) return false;
  const issued = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!safeEqual(sig, sign(issued))) return false;
  const age = Date.now() - Number(issued);
  return Number.isFinite(age) && age >= 0 && age < SESSION_MAX_AGE * 1000;
}
