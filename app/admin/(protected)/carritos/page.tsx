'use client';

import { useEffect, useState } from 'react';

interface Cart {
  id: string;
  cart_id: string;
  status: 'active' | 'converted' | 'abandoned' | string;
  step: number;
  summary: string | null;
  amount_usd: number | null;
  currency: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  abandoned: 'Abandonado',
  converted: 'Convertido',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-blue-100 text-blue-700',
  abandoned: 'bg-yellow-100 text-yellow-800',
  converted: 'bg-green-100 text-green-700',
};

const STEP_LABELS = ['', 'Estilo', 'Tipo', 'Fondo', 'Detalles', 'Pago'];

// Sin actividad en > 1h y sin convertir ⇒ se considera abandonado a efectos
// de la vista (aunque en BD siga como "active").
function effectiveStatus(c: Cart): string {
  if (c.status === 'converted') return 'converted';
  const stale = Date.now() - new Date(c.updated_at).getTime() > 3600_000;
  return stale ? 'abandoned' : 'active';
}

function money(amount: number | null, currency: string | null): string {
  if (amount == null) return '—';
  try {
    return new Intl.NumberFormat('es', { style: 'currency', currency: 'USD' }).format(amount)
      + (currency && currency !== 'usd' ? ` (${currency.toUpperCase()})` : '');
  } catch {
    return `$${amount}`;
  }
}

export default function CartsPage() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'abandoned' | 'converted'>('all');

  useEffect(() => {
    fetch('/api/admin/carts')
      .then((r) => r.json())
      .then((d) => setCarts(Array.isArray(d) ? d : []))
      .catch(() => setCarts([]))
      .finally(() => setLoading(false));
  }, []);

  const shown = carts.filter((c) => filter === 'all' || effectiveStatus(c) === filter);
  const counts = {
    all: carts.length,
    abandoned: carts.filter((c) => effectiveStatus(c) === 'abandoned').length,
    converted: carts.filter((c) => effectiveStatus(c) === 'converted').length,
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-secondary tracking-tighter">Carritos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pedidos en curso y abandonados. Escribe a quienes dejaron contacto y no terminaron.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {([['all', 'Todos'], ['abandoned', 'Abandonados'], ['converted', 'Convertidos']] as const).map(([f, label]) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              filter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label} ({counts[f]})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400">Cargando…</p>
      ) : shown.length === 0 ? (
        <p className="text-gray-400">No hay carritos.</p>
      ) : (
        <div className="space-y-4">
          {shown.map((c) => {
            const st = effectiveStatus(c);
            const wa = c.customer_phone?.replace(/[^\d]/g, '');
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[st] ?? 'bg-gray-100 text-gray-500'}`}>
                      {STATUS_LABELS[st] ?? st}
                    </span>
                    <span className="font-black text-secondary">{money(c.amount_usd, c.currency)}</span>
                    <span className="text-xs font-bold text-gray-500">
                      Paso {c.step}/5 · {STEP_LABELS[c.step] ?? ''}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(c.updated_at).toLocaleString('es')}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm mb-3">
                  <Field label="Nombre" value={c.customer_name} />
                  <Field label="Email" value={c.customer_email} />
                  <Field label="WhatsApp" value={c.customer_phone} />
                  <Field label="Resumen" value={c.summary} />
                </div>

                {(c.customer_email || wa) && st !== 'converted' && (
                  <div className="flex gap-2 flex-wrap pt-2 border-t border-gray-50">
                    {c.customer_email && (
                      <a
                        href={`mailto:${c.customer_email}?subject=${encodeURIComponent('Tu retrato NEGASVA te espera')}`}
                        className="text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Enviar email
                      </a>
                    )}
                    {wa && (
                      <a
                        href={`https://wa.me/${wa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-semibold text-secondary truncate">{value || '—'}</p>
    </div>
  );
}
