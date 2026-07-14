import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServiceClient } from '@/lib/supabase/server';
import { SESSION_COOKIE, verifySessionToken } from './session';

/**
 * True when the caller carries a valid signed admin session cookie. Single
 * shared password (ADMIN_PASSWORD), no Supabase Auth users.
 */
export async function isAdminAuthed(): Promise<boolean> {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Server Component / page guard. Redirects to /admin/login when not authed. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthed())) redirect('/admin/login');
}

/**
 * Route Handler guard for /api/admin/*. Returns a service-role Supabase client
 * (admin ops are trusted server-side once the cookie is verified) or null so
 * the route can respond 401. Async signature kept for existing callers.
 */
export async function requireAdminRoute(): Promise<SupabaseClient | null> {
  if (!(await isAdminAuthed())) return null;
  return createServiceClient();
}
