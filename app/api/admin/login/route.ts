import { cookies } from 'next/headers';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  safeEqual,
} from '@/lib/admin/session';
import { successAdminResponse, errorResponse, rateLimitByIp, readJson, validateSameOrigin } from '@/lib/security/apiHelpers';

// POST = log in with the single ADMIN_PASSWORD, set the signed session cookie.
export async function POST(request: Request) {
  if (!validateSameOrigin(request)) return errorResponse('Invalid origin', 403);
  const rl = await rateLimitByIp(request, { prefix: 'admin-login', max: 10, windowMs: 60_000 });
  if (rl) return rl;

  const body = await readJson<{ password?: unknown }>(request);
  const password = typeof body?.password === 'string' ? body.password : '';
  const expected = process.env.ADMIN_PASSWORD ?? '';

  if (expected.length === 0 || !safeEqual(password, expected)) {
    return errorResponse('Credenciales incorrectas', 401);
  }

  (await cookies()).set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return successAdminResponse({ ok: true });
}

// DELETE = log out.
export async function DELETE() {
  (await cookies()).delete(SESSION_COOKIE);
  return successAdminResponse({ ok: true });
}
