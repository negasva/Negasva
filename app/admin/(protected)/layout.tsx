import { requireAdmin } from '@/lib/admin/auth';
import AdminNavSidebar, { type NavItem } from '@/components/AdminNavSidebar';

export const dynamic = 'force-dynamic';

// Operation only — content panels live in /adminlanding.
const NAV: NavItem[] = [
  { href: '/admin',              label: 'Dashboard'       },
  { href: '/admin/pedidos-pago', label: 'Pedidos pagados' },
  { href: '/admin/carritos',     label: 'Carritos'        },
  { href: '/admin/orders',       label: 'Pedidos'         },
  { href: '/admin/estilos',      label: 'Estilos'         },
  { href: '/admin/body-types',   label: 'Tipos de cuerpo' },
  { href: '/admin/backgrounds',  label: 'Fondos'          },
  { href: '/admin/imagenes',     label: 'Imágenes del sitio' },
  { href: '/admin/prices',       label: 'Precios'         },
  { href: '/adminlanding',       label: '→ Contenido del sitio' },
];

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavSidebar items={NAV} subtitle="Admin Panel" newOrdersHref="/admin/pedidos-pago" />
      <main className="lg:ml-56 pt-16 lg:pt-0 p-4 lg:p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
