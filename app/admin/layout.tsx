import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import AdminSidebar from './AdminSidebar';

export const metadata = { title: 'Admin — NEGASVA' };

// Admin pages read the Supabase auth cookie on every request — they must
// not be prerendered at build time.
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || session.user.user_metadata?.role !== 'admin') {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="flex-1 ml-56 p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
