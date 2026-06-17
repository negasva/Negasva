'use client';

import { useEffect, useState } from 'react';

interface CheckoutOrder {
  id: string;
  created_at: string;
  provider: string | null;
  provider_reference: string | null;
  status: string | null;
  amount_total: number | null;
  currency: string | null;
  style: string | null;
  body_type: string | null;
  background: string | null;
  people_count: number | null;
  express: boolean | null;
  special_requests: string | null;
  discount_code: string | null;
  customer_email: string | null;
  photoUrls: string[];
}

const STATUS_COLORS: Record<string, string> = {
  paid:     'bg-green-100 text-green-700',
  pending:  'bg-yellow-100 text-yellow-800',
  failed:   'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-500',
  disputed: 'bg-orange-100 text-orange-700',
};

function money(amount: number | null, currency: string | null): string {
  if (amount == null) return '—';
  const cur = (currency ?? 'usd').toUpperCase();
  // COP is stored without minor units; everything else is in cents.
  const value = cur === 'COP' ? amount : amount / 100;
  try {
    return new Intl.NumberFormat('es', { style: 'currency', currency: cur }).format(value);
  } catch {
    return `${value} ${cur}`;
  }
}

export default function CheckoutOrdersPage() {
  const [orders, setOrders] = useState<CheckoutOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');

  useEffect(() => {
    fetch('/api/admin/checkout-orders')
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const shown = orders.filter((o) => filter === 'all' || o.status === filter);

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-secondary tracking-tighter">Pedidos pagados</h1>
          <p className="text-sm text-gray-500 mt-1">Pedidos reales con sus fotos para ilustrar.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(['all', 'paid', 'pending'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              filter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'Todos' : f === 'paid' ? 'Pagados' : 'Pendientes'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400">Cargando…</p>
      ) : shown.length === 0 ? (
        <p className="text-gray-400">No hay pedidos.</p>
      ) : (
        <div className="space-y-4">
          {shown.map((o) => (
            <div key={o.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[o.status ?? ''] ?? 'bg-gray-100 text-gray-500'}`}>
                    {o.status ?? '—'}
                  </span>
                  <span className="font-black text-secondary">{money(o.amount_total, o.currency)}</span>
                  {o.express && <span className="text-xs font-bold text-primary">⚡ Exprés</span>}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(o.created_at).toLocaleString('es')} · {o.provider}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm mb-3">
                <Field label="Estilo" value={o.style} />
                <Field label="Tipo" value={o.body_type} />
                <Field label="Personas" value={o.people_count != null ? String(o.people_count) : null} />
                <Field label="Fondo" value={o.background} />
                <Field label="Email" value={o.customer_email} />
                <Field label="Cupón" value={o.discount_code} />
                <Field label="Ref" value={o.provider_reference} />
              </div>

              {o.special_requests && (
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-3">
                  <span className="font-semibold">Notas:</span> {o.special_requests}
                </p>
              )}

              {o.photoUrls.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {o.photoUrls.map((url, i) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={url}
                        alt={`Foto ${i + 1}`}
                        loading="lazy"
                        className="w-24 h-24 object-cover rounded-lg border border-gray-200 hover:ring-2 hover:ring-primary transition"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">Sin fotos adjuntas.</p>
              )}
            </div>
          ))}
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
