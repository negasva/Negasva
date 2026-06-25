import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';

async function getSummary() {
  const supabase = createServiceClient();
  const [prices, codes, packages, backgrounds, orders] = await Promise.all([
    supabase.from('prices').select('id', { count: 'exact', head: true }),
    supabase.from('discount_codes').select('id', { count: 'exact', head: true }),
    supabase.from('packages').select('id', { count: 'exact', head: true }),
    supabase.from('backgrounds').select('id', { count: 'exact', head: true }),
    supabase.from('admin_orders').select('id', { count: 'exact', head: true }),
  ]);
  return {
    prices: prices.count ?? 0,
    codes: codes.count ?? 0,
    packages: packages.count ?? 0,
    backgrounds: backgrounds.count ?? 0,
    orders: orders.count ?? 0,
  };
}

const CARDS = [
  { key: 'orders'      as const, label: 'Pedidos',           href: '/admin/orders',         color: 'bg-orange-50 text-orange-600'  },
  { key: 'prices'      as const, label: 'Precios',           href: '/admin/prices',          color: 'bg-blue-50 text-blue-600'      },
  { key: 'codes'       as const, label: 'Descuentos',        href: '/admin/discount-codes',  color: 'bg-green-50 text-green-600'    },
  { key: 'packages'    as const, label: 'Paquetes',          href: '/admin/packages',        color: 'bg-purple-50 text-purple-600'  },
  { key: 'backgrounds' as const, label: 'Fondos',            href: '/admin/backgrounds',     color: 'bg-pink-50 text-pink-600'      },
];

const STYLES = [
  { slug: 'rick-morty',    label: 'Cartoon sci-fi'         },
  { slug: 'gravity-falls', label: 'Misterio del bosque'         },
  { slug: 'simpsons',      label: 'Familia amarilla clasica'          },
  { slug: 'fairly-odd',    label: 'Fantasia brillante'  },
  { slug: 'negasva',       label: 'Estilo NEGASVA'        },
];

export default async function AdminDashboard() {
  const summary = await getSummary();

  return (
    <div>
      <h1 className="text-xl lg:text-2xl font-black text-secondary mb-0.5">Dashboard</h1>
      <p className="text-sm text-secondary-lighter mb-6">Resumen del panel de administracion.</p>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 mb-8">
        {CARDS.map(({ key, label, href, color }) => (
          <Link
            key={key}
            href={href}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-3 hover:shadow-md transition-shadow group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black flex-shrink-0 text-sm ${color}`}>
              {String(summary[key]).padStart(2, '0')}
            </div>
            <div className="min-w-0">
              <p className="text-xl font-black text-secondary group-hover:text-primary transition-colors leading-tight">
                {summary[key]}
              </p>
              <p className="text-xs text-secondary-lighter mt-0.5 leading-tight">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="text-sm font-bold text-secondary-lighter uppercase tracking-wide mb-3">Estilos de dibujo</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-8">
        {STYLES.map((style) => (
          <Link
            key={style.slug}
            href={`/admin/backgrounds?style=${style.slug}`}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-primary-lighter transition-all group"
          >
            <p className="text-sm font-bold text-secondary group-hover:text-primary transition-colors">{style.label}</p>
            <p className="text-xs text-secondary-lighter mt-0.5">Ver fondos</p>
          </Link>
        ))}
      </div>

      <div className="flex gap-3">
        <Link href="/admin/estilos" className="text-sm font-bold text-primary hover:underline">
          Gestionar estilos
        </Link>
        <Link href="/admin/orders" className="text-sm font-bold text-primary hover:underline">
          Ver todos los pedidos
        </Link>
      </div>
    </div>
  );
}
