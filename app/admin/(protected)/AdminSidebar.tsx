'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '▦' },
  { href: '/admin/prices', label: 'Precios', icon: '€' },
  { href: '/admin/discount-codes', label: 'Descuentos', icon: '%' },
  { href: '/admin/packages', label: 'Paquetes', icon: '◫' },
  { href: '/admin/backgrounds', label: 'Fondos', icon: '🖼' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-secondary flex flex-col z-40">
      <div className="px-5 py-6 border-b border-secondary-light">
        <span className="text-white font-black text-lg tracking-tight">NEGASVA</span>
        <span className="block text-primary text-xs font-bold mt-0.5">Admin Panel</span>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV.map(({ href, label, icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                active
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-secondary-light'
              }`}
            >
              <span className="text-base leading-none w-5 text-center">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-secondary-light">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-gray-400 hover:text-white hover:bg-secondary-light transition-colors"
        >
          <span className="text-base leading-none w-5 text-center">→</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
