import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

export async function requireAdmin() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/admin/login');
  }

  const role = session.user.user_metadata?.role;
  if (role !== 'admin') {
    redirect('/admin/login');
  }

  return session;
}
