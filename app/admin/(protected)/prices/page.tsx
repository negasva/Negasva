'use client';

import { useEffect, useState } from 'react';
import type { Price } from '@/types/admin';

export default function PricesPage() {
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch('/api/admin/prices')
      .then((r) => r.json())
      .then((data) => { setPrices(data); setLoading(false); });
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  async function handleSave(price: Price) {
    const raw = edits[price.id];
    const amount = raw !== undefined ? parseFloat(raw) : price.amount;
    if (isNaN(amount) || amount < 0) return;

    setSaving(price.id);
    const res = await fetch('/api/admin/prices', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: price.id, amount }),
    });

    if (res.ok) {
      setPrices((prev) =>
        prev.map((p) => p.id === price.id ? { ...p, amount, updated_at: new Date().toISOString() } : p)
      );
      const newEdits = { ...edits };
      delete newEdits[price.id];
      setEdits(newEdits);
      showToast('Precio guardado');
    } else {
      showToast('Error al guardar');
    }
    setSaving(null);
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-secondary mb-1">Precios</h1>
      <p className="text-sm text-secondary-lighter mb-8">Edita los precios base en USD. El frontend convierte según la divisa del usuario.</p>

      {loading ? (
        <div className="text-center py-16 text-secondary-lighter text-sm">Cargando...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-bold text-secondary-lighter uppercase tracking-wide">Clave</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-secondary-lighter uppercase tracking-wide">Descripción</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-secondary-lighter uppercase tracking-wide">Divisa</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-secondary-lighter uppercase tracking-wide">Precio (USD)</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {prices.map((price) => (
                <tr key={price.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <code className="text-xs bg-primary-lighter text-secondary px-2 py-0.5 rounded">{price.key}</code>
                  </td>
                  <td className="px-5 py-4 text-secondary">{price.label}</td>
                  <td className="px-5 py-4 text-secondary-lighter">{price.currency}</td>
                  <td className="px-5 py-4 text-right">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={edits[price.id] ?? price.amount}
                      onChange={(e) => setEdits({ ...edits, [price.id]: e.target.value })}
                      className="w-28 text-right border border-primary-lighter rounded-lg px-3 py-1.5 text-sm font-bold text-secondary focus:outline-none focus:border-primary transition-colors"
                    />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleSave(price)}
                      disabled={saving === price.id || edits[price.id] === undefined}
                      className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {saving === price.id ? '...' : 'Guardar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-secondary text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg animate-wiggle-slow">
          {toast}
        </div>
      )}
    </div>
  );
}
