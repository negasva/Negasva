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
  recovery_sent_at: string | null;
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
  const [showArchived, setShowArchived] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/carts' + (showArchived ? '?archived=1' : ''))
      .then((r) => r.json())
      .then((d) => setCarts(Array.isArray(d) ? d : []))
      .catch(() => setCarts([]))
      .finally(() => setLoading(false));
  }, [showArchived]);

  async function restore(id: string) {
    setBusy(id);
    try {
      const res = await fetch('/api/admin/carts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) setCarts((prev) => prev.filter((c) => c.id !== id));
      else alert('No se pudo restaurar el carrito.');
    } catch {
      alert('No se pudo restaurar el carrito.');
    } finally {
      setBusy(null);
    }
  }

  async function archive(id: string) {
    if (!confirm('¿Ocultar este carrito del panel? El dato no se borra de la base de datos, solo deja de mostrarse aquí.')) return;
    setBusy(id);
    try {
      const res = await fetch('/api/admin/carts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) setCarts((prev) => prev.filter((c) => c.id !== id));
      else alert('No se pudo ocultar el carrito.');
    } catch {
      alert('No se pudo ocultar el carrito.');
    } finally {
      setBusy(null);
    }
  }

  async function sendRecovery(id: string) {
    if (!confirm('¿Enviar el email de recuperación? Se genera un cupón único y se manda al cliente por Resend.')) return;
    setBusy(id);
    try {
      const res = await fetch('/api/admin/carts/send-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setCarts((prev) => prev.map((c) => (c.id === id ? { ...c, recovery_sent_at: new Date().toISOString() } : c)));
        alert(`Email enviado a ${data.sentTo}. Cupón: ${data.code}`);
      } else {
        alert(data.error || 'No se pudo enviar el email.');
      }
    } catch {
      alert('No se pudo enviar el email.');
    } finally {
      setBusy(null);
    }
  }

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

      <div className="flex gap-2 mb-6 flex-wrap">
        {!showArchived && ([['all', 'Todos'], ['abandoned', 'Abandonados'], ['converted', 'Convertidos']] as const).map(([f, label]) => (
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
        <button
          onClick={() => setShowArchived((v) => !v)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${showArchived ? 'ml-0' : 'ml-auto'} ${
            showArchived ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {showArchived ? '← Activos' : '🗄 Archivados'}
        </button>
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
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {new Date(c.updated_at).toLocaleString('es')}
                    </span>
                    {showArchived ? (
                      <button
                        onClick={() => restore(c.id)}
                        disabled={busy === c.id}
                        className="text-xs font-bold text-gray-400 hover:text-green-600 hover:bg-green-50 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                        title="Volver a mostrar en el panel"
                      >
                        {busy === c.id ? '…' : '↩ Restaurar'}
                      </button>
                    ) : (
                      <button
                        onClick={() => archive(c.id)}
                        disabled={busy === c.id}
                        className="text-xs font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                        title="Ocultar del panel (no borra el dato)"
                      >
                        {busy === c.id ? '…' : '🗑 Borrar'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm mb-3">
                  <Field label="Nombre" value={c.customer_name} />
                  <Field label="Email" value={c.customer_email} />
                  <Field label="WhatsApp" value={c.customer_phone} />
                  <Field label="Resumen" value={c.summary} />
                </div>

                {st !== 'converted' && (
                  <div className="flex gap-2 flex-wrap items-center pt-2 border-t border-gray-50">
                    {c.customer_email ? (
                      <>
                        <button
                          onClick={() => sendRecovery(c.id)}
                          disabled={busy === c.id}
                          className="text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          title="Genera un cupón único y envía el email de recuperación por Resend"
                        >
                          {busy === c.id ? 'Enviando…' : c.recovery_sent_at ? 'Reenviar email' : 'Enviar email'}
                        </button>
                        {c.recovery_sent_at && (
                          <span className="text-xs text-green-600 font-semibold">
                            ✓ Enviado {new Date(c.recovery_sent_at).toLocaleDateString('es')}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Sin email — no se puede enviar recuperación</span>
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
