'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import { usePageText } from '@/lib/i18n/pageContent';
import { seguimientoContent } from '@/lib/i18n/pages/seguimiento';

const STAGES = [
  { key: 'uploaded', labelKey: 'stage_uploaded', icon: '1' },
  { key: 'drawing', labelKey: 'stage_drawing', icon: '2' },
  { key: 'ready', labelKey: 'stage_ready', icon: '3' },
  { key: 'sent', labelKey: 'stage_sent', icon: '4' },
] as const;

type StageKey = typeof STAGES[number]['key'];

interface TrackResult {
  orderId: string;
  productionStatus: string;
  statusLabel: string;
  createdAt: string;
}

export default function SeguimientoPage() {
  const tx = usePageText('seguimiento', seguimientoContent);
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
      setError(err instanceof Error ? err.message : tx.error_generic);
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

      <section className="bg-primary-lighter/30 py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            {tx.title}
          </h1>
          <p className="text-lg text-secondary-lighter">
            {tx.subtitle}
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="mx-auto max-w-xl">
          <form onSubmit={lookup} className="bg-white rounded-2xl border-2 border-primary-lighter p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-secondary mb-2">{tx.label_order_id}</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder={tx.placeholder_order_id}
                required
                className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-sm text-secondary focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary mb-2">{tx.label_email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={tx.placeholder_email}
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
              {loading ? tx.button_loading : tx.button_submit}
            </button>
          </form>

          {result && (
            <div className="mt-8 bg-white rounded-2xl border-2 border-primary p-6">
              <p className="text-xs font-bold text-secondary-lighter uppercase tracking-widest mb-1">{tx.current_status}</p>
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
                          {tx[stage.labelKey]}
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

      <PageFooter />
    </div>
  );
}
