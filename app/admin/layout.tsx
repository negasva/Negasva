export const metadata = { title: 'Admin — NEGASVA' };

// Children include both /admin/login (public) and the (protected) route
// group. The protected group has its own layout that enforces auth, so
// this top layout stays minimal — otherwise /admin/login would inherit
// the auth check and cause an infinite redirect loop.
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
