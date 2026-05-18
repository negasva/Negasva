'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const NAV = [
  { href: '/admin',               label: 'Dashboard'  },
  { href: '/admin/orders',        label: 'Pedidos'     },
  { href: '/admin/estilos',       label: 'Estilos'     },
  { href: '/admin/backgrounds',   label: 'Fondos'      },
  { href: '/admin/prices',        label: 'Precios'     },
  { href: '/admin/discount-codes',label: 'Descuentos'  },
  { href: '/admin/packages',      label: 'Paquetes'    },
];

function Brand() {
  return (
    <span className="text-lg tracking-tight">
      <span className="font-black text-white">NEGAS</span>
      <span className="font-normal text-white">VA</span>
    </span>
  );
}

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

  const NavLinks = ({ onNav }: { onNav?: () => void }) => (
    <>
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV.map(({ href, label }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNav}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                active
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {label}
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
            <span className="block text-primary text-xs font-semibold mt-0.5">Admin Panel</span>
          </div>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white text-lg leading-none">x</button>
        </div>
        <NavLinks onNav={() => setOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-56 bg-secondary flex-col z-40">
        <div className="px-5 py-6 border-b border-white/10">
          <Brand />
          <span className="block text-primary text-xs font-semibold mt-0.5">Admin Panel</span>
        </div>
        <NavLinks />
      </aside>
    </>
  );
}
