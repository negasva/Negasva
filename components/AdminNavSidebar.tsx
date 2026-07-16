'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export interface NavItem {
  href: string;
  label: string;
  /** Clave del contador de /api/admin/badges que se muestra en el círculo rojo. */
  badgeKey?: 'total' | 'pagos' | 'carritos' | 'pedidos';
  /** Secciones operativas clave: se resaltan visualmente en el menú. */
  important?: boolean;
}

interface Badges { total: number; pagos: number; carritos: number; pedidos: number }

function Brand() {
  return (
    <span className="text-lg tracking-tight">
      <span className="font-black text-white">NEGAS</span>
      <span className="font-normal text-white">VA</span>
    </span>
  );
}

// Shared admin sidebar for both panels (/admin operation, /adminlanding content).
// Cuando showBadges está activo (panel de operación), sondea /api/admin/badges y
// pinta círculos rojos con el nº de items sin gestionar por sección.
export default function AdminNavSidebar({
  items,
  subtitle,
  showBadges = false,
}: {
  items: NavItem[];
  subtitle: string;
  showBadges?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [badges, setBadges] = useState<Badges>({ total: 0, pagos: 0, carritos: 0, pedidos: 0 });

  // Contadores "sin gestionar" en vivo: se sondean cada 20s.
  useEffect(() => {
    if (!showBadges) return;
    let alive = true;
    async function poll() {
      try {
        const res = await fetch('/api/admin/badges');
        if (!res.ok) return;
        const data = await res.json();
        if (alive) setBadges({
          total: Number(data.total) || 0,
          pagos: Number(data.pagos) || 0,
          carritos: Number(data.carritos) || 0,
          pedidos: Number(data.pedidos) || 0,
        });
      } catch { /* ignore */ }
    }
    poll();
    const id = setInterval(poll, 20000);
    return () => { alive = false; clearInterval(id); };
  }, [pathname, showBadges]);

  async function handleLogout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  }

  const NavLinks = ({ onNav }: { onNav?: () => void }) => (
    <>
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {items.map(({ href, label, badgeKey, important }) => {
          const active = href === pathname || (href !== '/admin' && href !== '/adminlanding' && pathname.startsWith(href));
          const count = showBadges && badgeKey ? badges[badgeKey] : 0;
          const base = 'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors';
          const state = active
            ? 'bg-primary text-white font-bold shadow-sm'
            : important
              ? 'text-white font-bold bg-white/5 hover:bg-white/15 ring-1 ring-white/10'
              : 'text-gray-400 font-semibold hover:text-white hover:bg-white/10';
          return (
            <Link key={href} href={href} onClick={onNav} className={`${base} ${state}`}>
              <span className="flex items-center gap-2">
                {important && !active && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                {label}
              </span>
              {count > 0 && (
                <span className="ml-2 min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-black shadow ring-2 ring-secondary animate-pulse">
                  {count > 99 ? '99+' : count}
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

  // Total de items sin gestionar para el punto rojo del botón de menú móvil.
  const mobileTotal = showBadges ? badges.total : 0;

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-secondary flex items-center justify-between px-4 py-3 shadow-md">
        <Brand />
        <button
          onClick={() => setOpen(!open)}
          className="relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          {mobileTotal > 0 && !open && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-black ring-2 ring-secondary">
              {mobileTotal > 99 ? '99+' : mobileTotal}
            </span>
          )}
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
