'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Package, Paintbrush, ImageIcon, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import { usePageText } from '@/lib/i18n/pageContent';
import { trackContent } from '@/lib/i18n/pages/track';

const STAGES = [
  { key: 'uploaded',  labelKey: 'stage_uploaded_label', descKey: 'stage_uploaded_desc', icon: ImageIcon },
  { key: 'drawing',   labelKey: 'stage_drawing_label',  descKey: 'stage_drawing_desc',  icon: Paintbrush },
  { key: 'ready',     labelKey: 'stage_ready_label',    descKey: 'stage_ready_desc',    icon: Package },
  { key: 'sent',      labelKey: 'stage_sent_label',     descKey: 'stage_sent_desc',     icon: Send },
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
  const tx = usePageText('track', trackContent);
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
      if (!res.ok) throw new Error(data?.error || tx.error_not_found);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : tx.error_generic);
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
      <section className="bg-primary-lighter/30 py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            {tx.title}
          </h1>
          <p className="text-lg text-secondary-lighter">
            {tx.subtitle}
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
                {tx.label_reference}
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder={tx.placeholder_reference}
                required
                className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-sm text-secondary font-mono focus:border-primary focus:outline-none"
              />
              <p className="text-xs text-secondary-lighter mt-1">
                {tx.reference_hint}
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary mb-2 uppercase tracking-wider">
                {tx.label_email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={tx.placeholder_email}
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
              {loading ? tx.button_loading : tx.button_submit}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div className="bg-white rounded-2xl border-2 border-primary p-6 shadow-sm space-y-6">

              {/* Payment badge */}
              {!isPaid && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-700 font-medium">
                  {tx.payment_pending}
                </div>
              )}

              {/* Status headline */}
              <div>
                <p className="text-xs font-bold text-secondary-lighter uppercase tracking-widest mb-1">
                  {tx.current_status}
                </p>
                <p className="font-black text-2xl text-primary tracking-tighter">
                  {result.statusLabel}
                </p>
                <p className="text-xs text-secondary-lighter mt-1">
                  {tx.order_created_on}{' '}
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
                          {tx[stage.labelKey]}
                        </p>
                        {active && (
                          <p className="text-xs text-secondary-lighter mt-0.5">
                            {tx[stage.descKey]}
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
      <PageFooter />
    </div>
  );
}
