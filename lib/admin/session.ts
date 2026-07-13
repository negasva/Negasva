import { createHash, createHmac, timingSafeEqual } from 'crypto';

// Single-password admin auth: a signed, httpOnly session cookie instead of
// Supabase Auth users. Token = "<issuedAt>.<pwHash>.<HMAC(issuedAt.pwHash)>".
// The HMAC key is ADMIN_SESSION_SECRET, falling back to ADMIN_PASSWORD. pwHash
// binds the token to the current ADMIN_PASSWORD so rotating the password
// invalidates live sessions even when ADMIN_SESSION_SECRET is set (A1).

export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12h, in seconds

function key(): string {
  const k = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!k) throw new Error('ADMIN_PASSWORD not configured');
  return k;
}

function passwordHash(): string {
  const pw = process.env.ADMIN_PASSWORD ?? '';
  return createHash('sha256').update(pw).digest('hex').slice(0, 8);
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
  const pw = passwordHash();
  const payload = `${issued}.${pw}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token?: string | null): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [issued, pw, sig] = parts;
  if (!issued || !pw) return false;
  if (!safeEqual(pw, passwordHash())) return false;
  if (!safeEqual(sig, sign(`${issued}.${pw}`))) return false;
  const age = Date.now() - Number(issued);
  return Number.isFinite(age) && age >= 0 && age < SESSION_MAX_AGE * 1000;
}
