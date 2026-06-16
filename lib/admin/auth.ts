import { redirect } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerClient, createRouteClient } from '@/lib/supabase/server';

/**
 * Server Component / page guard. Redirects to /admin/login when the caller is
 * not an authenticated admin. Uses getUser() (revalidates the JWT against the
 * Supabase Auth server) instead of getSession() (which only reads the
 * spoofable cookie).
 */
export async function requireAdmin() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const role = user.user_metadata?.role;
  if (role !== 'admin') {
    redirect('/admin/login');
  }

  return user;
}

/**
 * Route Handler guard for /api/admin/*. Returns the authenticated route-scoped
 * Supabase client, or null when the caller is not an admin (so the route can
 * respond with 401). Centralizes the auth check that was duplicated in every
 * admin API route.
 */
export async function requireAdminRoute(): Promise<SupabaseClient | null> {
  const supabase = createRouteClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') return null;
  return supabase;
}
