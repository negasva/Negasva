'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useCurrency } from '@/lib/currency/CurrencyContext';
import { POD_PRODUCTS } from '@/lib/pricing/products';
import { Check, Camera } from 'lucide-react';

type Lang = 'es' | 'en' | 'fr';
const pick3 = (lang: Lang, es: string, en: string, fr: string) =>
  lang === 'fr' ? fr : lang === 'en' ? en : es;

// Entrega de fotos post-venta: solo si el pedido aún no las tiene. Consulta
// el estado por referencia y, si faltan, pide fotos + breve descripción como
// paso obligatorio DESPUÉS del pago (nunca lo bloquea).
function PhotoDelivery({ orderRef }: { orderRef: string }) {
  const { lang } = useLanguage();
  const l = lang as Lang;
  const [state, setState] = useState<'loading' | 'form' | 'done' | 'hidden'>('loading');
  const [photos, setPhotos] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/order/attach-photos?ref=${encodeURIComponent(orderRef)}`)
      .then((r) => r.json())
      .then((d) => setState(!d.found ? 'hidden' : d.hasPhotos ? 'done' : 'form'))
      .catch(() => setState('hidden'));
  }, [orderRef]);

  if (state === 'loading' || state === 'hidden') return null;

  if (state === 'done') {
    return (
      <div className="mt-8 rounded-2xl border-2 border-green-500/40 bg-green-50 p-5 flex items-center gap-3 text-left">
        <span className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0"><Check className="w-5 h-5" /></span>
        <p className="font-bold text-green-700 text-sm">
          {pick3(l, 'Recibimos tus fotos, ¡todo listo! Nuestro artista ya puede empezar.', 'We received your photos — all set! Our artist can get started.', 'Nous avons reçu tes photos, tout est prêt ! Notre artiste peut commencer.')}
        </p>
      </div>
    );
  }

  const submit = async () => {
    if (photos.length === 0) { setError(pick3(l, 'Sube al menos una foto.', 'Upload at least one photo.', 'Ajoute au moins une photo.')); return; }
    setSending(true);
    setError('');
    const fd = new FormData();
    fd.append('reference', orderRef);
    fd.append('description', description);
    for (const f of photos) fd.append('photos', f, f.name);
    try {
      const res = await fetch('/api/order/attach-photos', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('failed');
      setState('done');
    } catch {
      setError(pick3(l, 'No se pudieron subir las fotos. Inténtalo de nuevo.', 'Could not upload the photos. Try again.', 'Impossible d’envoyer les photos. Réessaie.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-8 rounded-2xl border-2 border-primary bg-primary-lighter p-5 text-left">
      <p className="font-black text-secondary text-lg tracking-tighter flex items-center gap-2">
        <Camera className="w-5 h-5 text-primary" />
        {pick3(l, 'Último paso: sube tus fotos', 'Last step: upload your photos', 'Dernière étape : envoie tes photos')}
      </p>
      <p className="text-sm text-secondary-lighter mt-1 mb-4">
        {pick3(l,
          'Para empezar tu retrato necesitamos las fotos de referencia y una breve descripción de tu pedido.',
          'To start your portrait we need your reference photos and a short description of your order.',
          'Pour commencer ton portrait, il nous faut tes photos de référence et une courte description.')}
      </p>
      <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-primary bg-white p-5 text-center hover:bg-primary-lighter transition-colors">
        <span className="font-bold text-primary text-sm">
          {photos.length > 0
            ? `${photos.length} ${pick3(l, photos.length > 1 ? 'fotos seleccionadas' : 'foto seleccionada', photos.length > 1 ? 'photos selected' : 'photo selected', photos.length > 1 ? 'photos sélectionnées' : 'photo sélectionnée')}`
            : pick3(l, 'Toca para elegir tus fotos', 'Tap to choose your photos', 'Touche pour choisir tes photos')}
        </span>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => setPhotos(Array.from(e.target.files ?? []).slice(0, 8))}
        />
      </label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={500}
        rows={3}
        placeholder={pick3(l, 'Breve descripción: quiénes salen, detalles importantes…', 'Short description: who’s in it, important details…', 'Courte description : qui apparaît, détails importants…')}
        className="mt-3 w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-sm text-secondary focus:border-primary focus:outline-none resize-none bg-white"
      />
      {error && <p className="text-xs text-red-500 font-bold mt-2">{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={sending}
        className="mt-3 w-full rounded-xl bg-primary px-6 py-3 font-black text-white hover:bg-primary-dark transition-all disabled:opacity-60"
      >
        {sending
          ? pick3(l, 'Enviando…', 'Sending…', 'Envoi…')
          : pick3(l, 'Enviar fotos', 'Send photos', 'Envoyer les photos')}
      </button>
    </div>
  );
}

// Upsell post-compra (#13): oferta ligera de versión impresa reutilizando
// pod_products. Se registra como nota en el pedido y el equipo lo cobra aparte.
function PrintUpsell({ orderRef }: { orderRef: string }) {
  const { lang } = useLanguage();
  const { fmt } = useCurrency();
  const l = lang as Lang;
  const [chosen, setChosen] = useState<string[]>([]);
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');

  if (state === 'done') {
    return (
      <p className="mt-6 text-sm font-bold text-green-600">
        ✅ {pick3(l, '¡Anotado! Te contactamos para coordinar tu versión impresa.', 'Got it! We’ll contact you to arrange your printed version.', 'C’est noté ! Nous te contactons pour ta version imprimée.')}
      </p>
    );
  }

  const send = async () => {
    setState('sending');
    const fd = new FormData();
    fd.append('reference', orderRef);
    fd.append('upsell', chosen.join(','));
    try {
      const res = await fetch('/api/order/attach-photos', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('failed');
      setState('done');
    } catch {
      setState('idle');
    }
  };

  return (
    <div className="mt-8 text-left">
      <p className="font-black text-secondary tracking-tighter">
        🖼️ {pick3(l, '¿Añades una versión impresa a tu pedido?', 'Add a printed version to your order?', 'Ajouter une version imprimée à ta commande ?')}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {POD_PRODUCTS.map((p) => {
          const active = chosen.includes(p.key);
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setChosen(active ? chosen.filter((k) => k !== p.key) : [...chosen, p.key])}
              className={`rounded-full border-2 px-3 py-1.5 text-xs font-black transition-all ${
                active ? 'border-primary bg-primary-lighter text-primary' : 'border-primary-lighter text-secondary hover:border-primary'
              }`}
            >
              {p.name[lang]} · {fmt(p.priceUsd)}
            </button>
          );
        })}
      </div>
      {chosen.length > 0 && (
        <button
          type="button"
          onClick={send}
          disabled={state === 'sending'}
          className="mt-3 rounded-xl border-2 border-primary px-5 py-2.5 text-sm font-black text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-60"
        >
          {pick3(l, 'Añadir a mi pedido', 'Add to my order', 'Ajouter à ma commande')}
        </button>
      )}
    </div>
  );
}

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');                  // Stripe — also the provider_reference
  const providerRef = params.get('ref');                        // MP/Wompi provider_reference (negasva-…)
  // Mercado Pago vuelve con collection_status/status (approved|pending|rejected);
  // Wompi (pedidos antiguos) con status APPROVED|DECLINED|… — se normalizan.
  const rawStatus = (params.get('collection_status') ?? params.get('status') ?? 'APPROVED').toUpperCase();
  // ref = the value stored as provider_reference in orders table — used for tracking
  const ref = sessionId ?? providerRef ?? '';
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(t);
  }, []);

  const isFailure = ['DECLINED', 'ERROR', 'VOIDED', 'REJECTED', 'CANCELLED'].includes(rawStatus);
  const isPending = ['PENDING', 'IN_PROCESS'].includes(rawStatus);

  const ui = isFailure
    ? { icon: 'fail', title: 'Pago no completado', body: 'Tu pago no se procesó. Puedes intentarlo de nuevo desde el estudio.' }
    : isPending
    ? { icon: 'pending', title: 'Pago pendiente', body: 'Tu pago está siendo procesado. Te enviaremos un email cuando se confirme.' }
    : { icon: 'success', title: '¡Pago recibido!', body: 'Tu pedido está en camino. Te enviaremos un email de confirmación pronto.' };

  if (!ready) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-secondary-lighter font-bold">Confirmando pago…</p>
      </div>
    );
  }

  return (
    <>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto ${ui.icon === 'success' ? 'bg-green-100' : ui.icon === 'pending' ? 'bg-yellow-100' : 'bg-red-100'}`}>
        <div className={`w-8 h-8 rounded-full ${ui.icon === 'success' ? 'bg-green-500' : ui.icon === 'pending' ? 'bg-yellow-500' : 'bg-red-400'}`} />
      </div>
      <h1 className="font-black text-3xl text-secondary tracking-tighter mb-3">
        {ui.title}
      </h1>
      <p className="text-secondary-lighter mb-2">{ui.body}</p>
      {ref && (
        <p className="text-xs text-secondary-lighter mt-1 font-mono break-all">
          Ref: <span className="select-all">{ref}</span>
        </p>
      )}
      {/* Post-venta (nunca bloquea el pago): entrega de fotos si faltan +
          upsell ligero de versión impresa, ligados al pedido por su ref. */}
      {!isFailure && ref && (
        <>
          <PhotoDelivery orderRef={ref} />
          <PrintUpsell orderRef={ref} />
        </>
      )}
      <div className="mt-8 space-y-3">
        {isFailure ? (
          <Link
            href="/order"
            className="block w-full rounded-xl bg-primary px-6 py-3 font-black text-white hover:bg-primary-dark hover:shadow-xl transition-all"
          >
            Volver al estudio
          </Link>
        ) : (
          <Link
            href={ref ? `/track-order?ref=${encodeURIComponent(ref)}` : '/track-order'}
            className="block w-full rounded-xl bg-primary px-6 py-3 font-black text-white hover:bg-primary-dark hover:shadow-xl transition-all"
          >
            Seguir mi pedido
          </Link>
        )}
        <Link
          href="/"
          className="block w-full rounded-lg border-2 border-primary-lighter px-6 py-3 font-bold text-secondary hover:border-primary hover:bg-primary-lighter transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Logo href="/" size="lg" />
      </div>

      <div className="max-w-md w-full text-center">
        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-secondary-lighter font-bold">Cargando…</p>
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
