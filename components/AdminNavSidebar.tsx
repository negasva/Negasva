'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export interface NavItem { href: string; label: string }

function Brand() {
  return (
    <span className="text-lg tracking-tight">
      <span className="font-black text-white">NEGAS</span>
      <span className="font-normal text-white">VA</span>
    </span>
  );
}

// Shared admin sidebar for both panels (/admin operation, /adminlanding content).
// The "new paid orders" badge is operation-only, gated by newOrdersHref.
export default function AdminNavSidebar({
  items,
  subtitle,
  newOrdersHref,
}: {
  items: NavItem[];
  subtitle: string;
  newOrdersHref?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [newOrders, setNewOrders] = useState(0);

  // Live "new paid orders" badge: poll the cheap count endpoint and subtract
  // the count last seen on the Pedidos pagados page (stored in localStorage).
  useEffect(() => {
    if (!newOrdersHref) return;
    let alive = true;
    async function poll() {
      try {
        const res = await fetch('/api/admin/orders/new-count');
        if (!res.ok) return;
        const { count } = await res.json();
        const seen = Number(localStorage.getItem('adminOrdersSeen') || '0');
        if (alive) setNewOrders(Math.max(0, count - seen));
      } catch { /* ignore */ }
    }
    poll();
    const id = setInterval(poll, 20000);
    return () => { alive = false; clearInterval(id); };
  }, [pathname, newOrdersHref]);

  async function handleLogout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  }

  const NavLinks = ({ onNav }: { onNav?: () => void }) => (
    <>
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {items.map(({ href, label }) => {
          const active = href === pathname || (href !== '/admin' && href !== '/adminlanding' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNav}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                active
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{label}</span>
              {newOrdersHref && href === newOrdersHref && newOrders > 0 && (
                <span className="ml-2 min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-black">
                  {newOrders}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          Cerrar sesion
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-secondary flex items-center justify-between px-4 py-3 shadow-md">
        <Brand />
        <button
          onClick={() => setOpen(!open)}
          className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </header>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
      )}

      <aside className={`lg:hidden fixed top-0 left-0 h-full w-60 bg-secondary flex flex-col z-50 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <Brand />
            <span className="block text-primary text-xs font-semibold mt-0.5">{subtitle}</span>
          </div>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white text-lg leading-none">x</button>
        </div>
        <NavLinks onNav={() => setOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-56 bg-secondary flex-col z-40">
        <div className="px-5 py-6 border-b border-white/10">
          <Brand />
          <span className="block text-primary text-xs font-semibold mt-0.5">{subtitle}</span>
        </div>
        <NavLinks />
      </aside>
    </>
  );
}
