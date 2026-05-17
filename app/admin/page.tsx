import { createServerClient } from '@/lib/supabase/server';

async function getSummary() {
  const supabase = createServerClient();
  const [prices, codes, packages, backgrounds] = await Promise.all([
    supabase.from('prices').select('id', { count: 'exact', head: true }),
    supabase.from('discount_codes').select('id', { count: 'exact', head: true }),
    supabase.from('packages').select('id', { count: 'exact', head: true }),
    supabase.from('backgrounds').select('id', { count: 'exact', head: true }),
  ]);
  return {
    prices: prices.count ?? 0,
    codes: codes.count ?? 0,
    packages: packages.count ?? 0,
    backgrounds: backgrounds.count ?? 0,
  };
}

const CARDS = [
  { key: 'prices' as const, label: 'Precios', href: '/admin/prices', icon: '€', color: 'bg-blue-50 text-blue-600' },
  { key: 'codes' as const, label: 'Códigos de descuento', href: '/admin/discount-codes', icon: '%', color: 'bg-green-50 text-green-600' },
  { key: 'packages' as const, label: 'Paquetes', href: '/admin/packages', icon: '◫', color: 'bg-purple-50 text-purple-600' },
  { key: 'backgrounds' as const, label: 'Fondos', href: '/admin/backgrounds', icon: '🖼', color: 'bg-pink-50 text-pink-600' },
];

export default async function AdminDashboard() {
  const summary = await getSummary();

  return (
    <div>
      <h1 className="text-2xl font-black text-secondary mb-1">Dashboard</h1>
      <p className="text-sm text-secondary-lighter mb-8">Resumen del panel de administración.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {CARDS.map(({ key, label, href, icon, color }) => (
          <a
            key={key}
            href={href}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-start gap-4 hover:shadow-md transition-shadow group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black ${color}`}>
              {icon}
            </div>
            <div>
              <p className="text-2xl font-black text-secondary group-hover:text-primary transition-colors">
                {summary[key]}
              </p>
              <p className="text-xs text-secondary-lighter mt-0.5">{label}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
