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

const STYLES = [
  { id: 'rick-morty', label: 'Rick & Morty', emoji: '🛸' },
  { id: 'gravity-falls', label: 'Gravity Falls', emoji: '🌲' },
  { id: 'simpsons', label: 'Simpsons', emoji: '🍩' },
  { id: 'fairly-odd', label: 'Padrinos Mágicos', emoji: '⭐' },
  { id: 'negasva', label: 'Estilo NEGASVA', emoji: '🎨' },
];

export default async function AdminDashboard() {
  const summary = await getSummary();

  return (
    <div>
      <h1 className="text-xl lg:text-2xl font-black text-secondary mb-1">Dashboard</h1>
      <p className="text-sm text-secondary-lighter mb-6">Resumen del panel de administración.</p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-5 mb-8">
        {CARDS.map(({ key, label, href, icon, color }) => (
          <a
            key={key}
            href={href}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 lg:p-6 flex items-start gap-3 hover:shadow-md transition-shadow group"
          >
            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center text-lg lg:text-xl font-black flex-shrink-0 ${color}`}>
              {icon}
            </div>
            <div className="min-w-0">
              <p className="text-xl lg:text-2xl font-black text-secondary group-hover:text-primary transition-colors">
                {summary[key]}
              </p>
              <p className="text-xs text-secondary-lighter mt-0.5 leading-tight">{label}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Drawing styles quick access */}
      <h2 className="text-base font-black text-secondary mb-3">Estilos de dibujo</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {STYLES.map((style) => (
          <a
            key={style.id}
            href={`/admin/backgrounds?style=${style.id}`}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md hover:border-primary-lighter transition-all group"
          >
            <span className="text-2xl">{style.emoji}</span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-secondary group-hover:text-primary transition-colors truncate">{style.label}</p>
              <p className="text-xs text-secondary-lighter">Ver fondos</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
