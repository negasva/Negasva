'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles, Gift } from 'lucide-react';
import { getRecaptchaToken } from '@/lib/security/recaptchaClient';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const STORAGE_KEY = 'negasva-newsletter';

type Lang = 'es' | 'en' | 'fr';
const pick3 = (lang: Lang, es: string, en: string, fr: string) =>
  lang === 'fr' ? fr : lang === 'en' ? en : es;

export default function EmailCapturePopup() {
  const { lang } = useLanguage();
  const l = lang as Lang;
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  // Código ÚNICO de 20% que devuelve el server al suscribirse.
  const [code, setCode] = useState('');
  const [revealed, setRevealed] = useState(false);
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
    if (!code) localStorage.setItem(STORAGE_KEY, 'dismissed');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(pick3(l, 'Correo inválido', 'Invalid email', 'Email invalide'));
      return;
    }
    setLoading(true);
    try {
      const recaptchaToken = await getRecaptchaToken('newsletter');
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, recaptchaToken }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.code) throw new Error('no code');
      setCode(data.code);
      localStorage.setItem(STORAGE_KEY, 'subscribed');
    } catch {
      setError(pick3(l, 'No se pudo generar tu código. Inténtalo de nuevo.', 'Could not generate your code. Try again.', 'Impossible de générer ton code. Réessaie.'));
    }
    setLoading(false);
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
          aria-label={pick3(l, 'Cerrar', 'Close', 'Fermer')}
          className="absolute top-3 right-3 z-10 rounded-full bg-white/80 p-1.5 text-secondary hover:bg-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="bg-gradient-to-br from-primary via-primary-light to-primary-lighter p-6 text-center">
          <Sparkles className="w-10 h-10 text-white mx-auto mb-2" />
          <h3 className="font-black text-2xl text-white tracking-tighter">
            {code
              ? pick3(l, '¡Desbloqueaste un descuento!', 'You’ve unlocked a discount!', 'Tu as débloqué une réduction !')
              : pick3(l, '20% off en tu primer retrato', '20% off your first portrait', '−20% sur ton premier portrait')}
          </h3>
          <p className="text-white/90 text-sm mt-1">
            {code
              ? pick3(l, 'Tu código único de 20% está listo.', 'Your unique 20% code is ready.', 'Ton code unique de 20% est prêt.')
              : pick3(l, 'Suscríbete y revela tu código único al instante.', 'Subscribe and reveal your unique code instantly.', 'Abonne-toi et révèle ton code unique instantanément.')}
          </p>
        </div>

        <div className="p-6">
          {code ? (
            <div className="text-center">
              {revealed ? (
                <>
                  <p className="text-sm text-secondary-lighter mb-3">
                    {pick3(l, 'Úsalo en el checkout (un solo uso):', 'Use it at checkout (single use):', 'Utilise-le au paiement (usage unique) :')}
                  </p>
                  <div className="bg-primary-lighter border-2 border-dashed border-primary rounded-xl py-4 px-3 mb-2">
                    <p className="font-mono font-black text-xl text-primary tracking-widest select-all">
                      {code}
                    </p>
                  </div>
                  <p className="text-[10px] text-secondary-lighter mb-4">
                    {pick3(l, 'No acumulable con otras promociones.', 'Cannot be combined with other promotions.', 'Non cumulable avec d’autres promotions.')}
                  </p>
                  <button
                    onClick={close}
                    className="w-full rounded-lg bg-secondary text-white font-bold py-3 hover:bg-secondary-light transition-colors"
                  >
                    {pick3(l, 'Cerrar', 'Close', 'Fermer')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setRevealed(true)}
                  className="w-full rounded-xl bg-primary text-white font-black py-4 text-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 animate-pulse"
                >
                  <Gift className="w-5 h-5" />
                  {pick3(l, 'REVELAR MI CÓDIGO', 'REVEAL MY CODE', 'RÉVÉLER MON CODE')}
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={pick3(l, 'tu@correo.com', 'you@email.com', 'toi@email.com')}
                autoComplete="email"
                required
                className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-base text-secondary focus:border-primary focus:outline-none"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary text-white font-black py-3 hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {loading
                  ? pick3(l, 'Enviando…', 'Sending…', 'Envoi…')
                  : pick3(l, 'Quiero mi 20%', 'I want my 20%', 'Je veux mes 20%')}
              </button>
              <p className="text-[10px] text-secondary-lighter text-center">
                {pick3(l, 'Sin spam. Cancelas cuando quieras.', 'No spam. Unsubscribe anytime.', 'Pas de spam. Désabonne-toi quand tu veux.')}
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
