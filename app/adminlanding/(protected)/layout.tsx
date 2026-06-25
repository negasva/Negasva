import { requireAdmin } from '@/lib/admin/auth';
import AdminNavSidebar, { type NavItem } from '@/components/AdminNavSidebar';

export const dynamic = 'force-dynamic';

// Same single password as /admin (shared signed cookie). Content panels only.
const NAV: NavItem[] = [
  { href: '/adminlanding',               label: 'Resumen'      },
  { href: '/adminlanding/landing',       label: 'Landing Page' },
  { href: '/adminlanding/galeria',       label: 'Galería'      },
  { href: '/adminlanding/faqs',          label: 'FAQ'          },
  { href: '/adminlanding/discount-codes',label: 'Descuentos'   },
  { href: '/adminlanding/packages',      label: 'Paquetes'     },
  { href: '/adminlanding/contenido',     label: 'Contenido'    },
  { href: '/admin',                      label: '← Operación / Pedidos' },
];

export default async function ProtectedAdminLandingLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavSidebar items={NAV} subtitle="Contenido del sitio" />
      <main className="lg:ml-56 pt-16 lg:pt-0 p-4 lg:p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
