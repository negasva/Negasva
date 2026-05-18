'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';

const STAGES = [
  { key: 'uploaded', label: 'Fotos recibidas', icon: '1' },
  { key: 'drawing', label: 'Dibujando', icon: '2' },
  { key: 'ready', label: 'Listo', icon: '3' },
  { key: 'sent', label: 'Enviado', icon: '4' },
] as const;

type StageKey = typeof STAGES[number]['key'];

interface TrackResult {
  orderId: string;
  productionStatus: string;
  statusLabel: string;
  createdAt: string;
}

export default function SeguimientoPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<TrackResult | null>(null);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Error');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos consultar el pedido');
    } finally {
      setLoading(false);
    }
  };

  const currentIdx = result
    ? STAGES.findIndex((s) => s.key === (result.productionStatus as StageKey))
    : -1;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-gradient-to-br from-white via-primary-lighter to-white py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            Seguimiento de pedido
          </h1>
          <p className="text-lg text-secondary-lighter">
            Ingresa tu ID de pedido y el correo con el que pagaste.
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="mx-auto max-w-xl">
          <form onSubmit={lookup} className="bg-white rounded-2xl border-2 border-primary-lighter p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-secondary mb-2">ID de pedido</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Ej: 8f3c-…"
                required
                className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-sm text-secondary focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary mb-2">Correo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-sm text-secondary focus:border-primary focus:outline-none"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary text-white font-black py-3 hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Buscando…' : 'Ver estado'}
            </button>
          </form>

          {result && (
            <div className="mt-8 bg-white rounded-2xl border-2 border-primary p-6">
              <p className="text-xs font-bold text-secondary-lighter uppercase tracking-widest mb-1">Estado actual</p>
              <p className="font-black text-2xl text-primary tracking-tighter mb-6">{result.statusLabel}</p>

              <ol className="space-y-3">
                {STAGES.map((stage, i) => {
                  const done = i <= currentIdx;
                  const active = i === currentIdx;
                  return (
                    <li key={stage.key} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black flex-shrink-0 transition-colors ${
                        done ? 'bg-primary text-white' : 'bg-primary-lighter text-secondary-lighter'
                      } ${active ? 'ring-4 ring-primary-lighter' : ''}`}>
                        {done && i < currentIdx ? <Check className="w-5 h-5" /> : stage.icon}
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold ${done ? 'text-secondary' : 'text-secondary-lighter'}`}>
                          {stage.label}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
      </section>

      <PageFooter minimal />
    </div>
  );
}
