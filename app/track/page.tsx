'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Package, Paintbrush, ImageIcon, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';

const STAGES = [
  { key: 'uploaded',  label: 'Fotos recibidas',    desc: 'Recibimos tus fotos de referencia.',         icon: ImageIcon },
  { key: 'drawing',   label: 'Dibujando',           desc: 'Nuestro artista está trabajando en tu retrato.', icon: Paintbrush },
  { key: 'ready',     label: 'Listo para enviar',   desc: 'Tu retrato está terminado y listo.',         icon: Package },
  { key: 'sent',      label: 'Enviado',             desc: 'Tu retrato ya está en camino a tu correo.',  icon: Send },
] as const;

type StageKey = typeof STAGES[number]['key'];

interface TrackResult {
  orderId: string;
  productionStatus: string;
  statusLabel: string;
  paymentStatus: string;
  createdAt: string;
  completedAt: string | null;
}

function TrackContent() {
  const params = useSearchParams();
  const initialRef = params.get('ref') ?? '';

  const [orderId, setOrderId] = useState(initialRef);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<TrackResult | null>(null);

  const lookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'No encontrado');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos consultar el pedido');
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit once if ref arrives from URL and email is already filled
  useEffect(() => {
    if (initialRef && email) lookup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentIdx = result
    ? STAGES.findIndex((s) => s.key === (result.productionStatus as StageKey))
    : -1;

  const isPaid = result && result.paymentStatus === 'paid';

  return (
    <>
      <section className="bg-gradient-to-br from-white via-primary-lighter to-white py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            Seguimiento de pedido
          </h1>
          <p className="text-lg text-secondary-lighter">
            Ingresa tu referencia y el correo con el que pagaste.
          </p>
        </div>
      </section>

      <section className="py-10 px-4 pb-20">
        <div className="mx-auto max-w-xl space-y-6">

          {/* Lookup form */}
          <form
            onSubmit={lookup}
            className="bg-white rounded-2xl border-2 border-primary-lighter p-6 space-y-4 shadow-sm"
          >
            <div>
              <label className="block text-xs font-bold text-secondary mb-2 uppercase tracking-wider">
                Referencia de compra
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="negasva-abc123… o cs_prod_…"
                required
                className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-sm text-secondary font-mono focus:border-primary focus:outline-none"
              />
              <p className="text-xs text-secondary-lighter mt-1">
                La encontrarás en tu correo de confirmación o en la página de pago exitoso.
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary mb-2 uppercase tracking-wider">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-sm text-secondary focus:border-primary focus:outline-none"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 font-medium">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary text-white font-black py-3 hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Buscando…' : 'Ver estado'}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div className="bg-white rounded-2xl border-2 border-primary p-6 shadow-sm space-y-6">

              {/* Payment badge */}
              {!isPaid && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-700 font-medium">
                  Pago pendiente de confirmación. Si realizaste el pago, espera unos minutos.
                </div>
              )}

              {/* Status headline */}
              <div>
                <p className="text-xs font-bold text-secondary-lighter uppercase tracking-widest mb-1">
                  Estado actual
                </p>
                <p className="font-black text-2xl text-primary tracking-tighter">
                  {result.statusLabel}
                </p>
                <p className="text-xs text-secondary-lighter mt-1">
                  Pedido creado el{' '}
                  {new Date(result.createdAt).toLocaleDateString('es-CO', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              {/* Progress timeline */}
              <ol className="space-y-4">
                {STAGES.map((stage, i) => {
                  const done = i <= currentIdx;
                  const active = i === currentIdx;
                  const Icon = stage.icon;
                  return (
                    <li key={stage.key} className="flex items-start gap-4">
                      {/* Circle */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          done
                            ? 'bg-primary text-white shadow-md shadow-primary/30'
                            : 'bg-primary-lighter text-secondary-lighter'
                        } ${active ? 'ring-4 ring-primary/20 scale-110' : ''}`}
                      >
                        {done && i < currentIdx ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>

                      {/* Connector line */}
                      <div className="flex-1 pt-1">
                        <p
                          className={`font-black text-sm ${
                            done ? 'text-secondary' : 'text-secondary-lighter'
                          }`}
                        >
                          {stage.label}
                        </p>
                        {active && (
                          <p className="text-xs text-secondary-lighter mt-0.5">
                            {stage.desc}
                          </p>
                        )}
                      </div>

                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <TrackContent />
      </Suspense>
      <PageFooter minimal />
    </div>
  );
}
