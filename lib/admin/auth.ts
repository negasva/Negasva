import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

export async function requireAdmin() {
  const supabase = createServerClient();
  // getUser() revalidates the JWT against the Supabase Auth server on every
  // call; getSession() only reads the (spoofable) cookie. Server-side guards
  // must use getUser().
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
