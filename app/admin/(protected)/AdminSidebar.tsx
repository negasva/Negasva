'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '▦' },
  { href: '/admin/estilos', label: 'Estilos', icon: '🎨' },
  { href: '/admin/prices', label: 'Precios', icon: '€' },
  { href: '/admin/discount-codes', label: 'Descuentos', icon: '%' },
  { href: '/admin/packages', label: 'Paquetes', icon: '◫' },
  { href: '/admin/backgrounds', label: 'Fondos', icon: '🖼' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  const NavLinks = () => (
    <>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV.map(({ href, label, icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold transition-colors ${
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
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold text-gray-400 hover:text-white hover:bg-secondary-light transition-colors"
        >
          <span className="text-base leading-none w-5 text-center">→</span>
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-secondary flex items-center justify-between px-4 py-3 shadow-md">
        <div>
          <span className="text-white font-black text-lg tracking-tight">NEGASVA</span>
          <span className="text-primary text-xs font-bold ml-2">Admin</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-secondary-light transition-colors"
          aria-label="Menú"
        >
          <span className={`block w-6 h-0.5 bg-white transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </header>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-secondary flex flex-col z-50 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 py-5 border-b border-secondary-light flex items-center justify-between">
          <div>
            <span className="text-white font-black text-lg tracking-tight">NEGASVA</span>
            <span className="block text-primary text-xs font-bold mt-0.5">Admin Panel</span>
          </div>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white text-xl leading-none">✕</button>
        </div>
        <NavLinks />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-56 bg-secondary flex-col z-40">
        <div className="px-5 py-6 border-b border-secondary-light">
          <span className="text-white font-black text-lg tracking-tight">NEGASVA</span>
          <span className="block text-primary text-xs font-bold mt-0.5">Admin Panel</span>
        </div>
        <NavLinks />
      </aside>
    </>
  );
}
