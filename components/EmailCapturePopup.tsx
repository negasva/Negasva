'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'negasva-newsletter';
const COUPON_CODE = 'BIENVENIDA10';

export default function EmailCapturePopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const state = localStorage.getItem(STORAGE_KEY);
    if (state === 'subscribed' || state === 'dismissed') return;
    const t = setTimeout(() => setVisible(true), 12000);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setVisible(false);
    if (!submitted) localStorage.setItem(STORAGE_KEY, 'dismissed');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Correo inválido');
      return;
    }
    setLoading(true);
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch {
      // non-blocking; coupon is still shown
    }
    setLoading(false);
    setSubmitted(true);
    localStorage.setItem(STORAGE_KEY, 'subscribed');
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={close}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden"
      >
        <button
          onClick={close}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-10 rounded-full bg-white/80 p-1.5 text-secondary hover:bg-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="bg-gradient-to-br from-primary via-primary-light to-primary-lighter p-6 text-center">
          <Sparkles className="w-10 h-10 text-white mx-auto mb-2" />
          <h3 className="font-black text-2xl text-white tracking-tighter">
            10% off en tu primer retrato
          </h3>
          <p className="text-white/90 text-sm mt-1">
            Suscríbete y recibe el cupón al instante.
          </p>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center">
              <p className="font-bold text-secondary mb-2">¡Listo! 🎉</p>
              <p className="text-sm text-secondary-lighter mb-4">
                Usa este código en el checkout:
              </p>
              <div className="bg-primary-lighter border-2 border-dashed border-primary rounded-xl py-4 px-3 mb-4">
                <p className="font-mono font-black text-xl text-primary tracking-widest">
                  {COUPON_CODE}
                </p>
              </div>
              <button
                onClick={close}
                className="w-full rounded-lg bg-secondary text-white font-bold py-3 hover:bg-secondary-light transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                autoComplete="email"
                required
                className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-sm text-secondary focus:border-primary focus:outline-none"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary text-white font-black py-3 hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Enviando…' : 'Quiero mi cupón'}
              </button>
              <p className="text-[10px] text-secondary-lighter text-center">
                Sin spam. Cancelas cuando quieras.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
