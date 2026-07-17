'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Checkout embebido de Mercado Pago (Payment Brick) para pagos en COP, dentro
 * de negasva.shop — equivalente al checkout embebido de Stripe. Soporta tarjeta
 * de crédito/débito y PSE (transferencia bancaria colombiana).
 *
 * Flujo:
 *   1. Se crea el pedido pendiente (POST /api/checkout) → { reference, amount }.
 *   2. Se renderiza el Brick con ese monto (autoritativo del servidor).
 *   3. Al enviar, los datos tokenizados van a /api/payments/mercadopago, que
 *      crea el pago real. Según el resultado se redirige a éxito, al banco (PSE)
 *      o se muestra el error para reintentar.
 */

const MP_SDK_SRC = 'https://sdk.mercadopago.com/js/v2';

// Carga el SDK una sola vez, compartiendo la promesa entre montajes.
let sdkPromise: Promise<void> | null = null;
function loadMpSdk(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as any).MercadoPago) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${MP_SDK_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('MP SDK failed')));
      return;
    }
    const s = document.createElement('script');
    s.src = MP_SDK_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('MP SDK failed'));
    document.head.appendChild(s);
  });
  return sdkPromise;
}

type Lang = 'es' | 'en' | 'fr';
const pick3 = (lang: Lang, es: string, en: string, fr: string) =>
  lang === 'fr' ? fr : lang === 'en' ? en : es;
const LOCALE: Record<Lang, string> = { es: 'es-CO', en: 'en-US', fr: 'fr-FR' };

export default function MercadoPagoBrick({
  lang,
  createOrder,
  onError,
}: {
  lang: Lang;
  /** Crea el pedido pendiente y devuelve { reference, amount }. */
  createOrder: () => Promise<{ reference: string; amount: number } | null>;
  onError?: (message: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

  useEffect(() => {
    let cancelled = false;

    const fail = (msg: string) => {
      if (cancelled) return;
      setStatus('error');
      setMessage(msg);
      onError?.(msg);
    };

    (async () => {
      if (!publicKey) {
        fail(pick3(lang, 'Pago no configurado. Contáctanos para completar tu compra.', 'Payment not configured. Contact us to complete your purchase.', 'Paiement non configuré. Contacte-nous pour finaliser.'));
        return;
      }
      try {
        const order = await createOrder();
        if (cancelled) return;
        if (!order) { fail(pick3(lang, 'No se pudo iniciar el pago.', 'Could not start payment.', 'Impossible de démarrer le paiement.')); return; }

        await loadMpSdk();
        if (cancelled) return;

        const mp = new (window as any).MercadoPago(publicKey, { locale: LOCALE[lang] });
        const builder = mp.bricks();

        controllerRef.current = await builder.create('payment', 'mp-brick-container', {
          initialization: { amount: order.amount },
          customization: {
            // Tarjeta de crédito/débito + PSE (bankTransfer en Colombia).
            paymentMethods: {
              creditCard: 'all',
              debitCard: 'all',
              bankTransfer: 'all',
              // Hasta 3 cuotas sin interés (el Brick muestra el selector y el
              // valor viaja en formData.installments a /api/payments/mercadopago).
              maxInstallments: 3,
            },
          },
          callbacks: {
            onReady: () => { if (!cancelled) setStatus('ready'); },
            onError: (error: any) => {
              fail(error?.message || pick3(lang, 'Error al cargar el pago.', 'Error loading payment.', 'Erreur de chargement du paiement.'));
            },
            onSubmit: ({ formData }: { formData: any }) =>
              new Promise<void>((resolve, reject) => {
                setMessage('');
                fetch('/api/payments/mercadopago', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ reference: order.reference, formData }),
                })
                  .then((res) => res.json().catch(() => null))
                  .then((data) => {
                    if (!data) throw new Error('bad response');
                    // PSE u otros métodos con redirección al banco.
                    if (data.redirectUrl) {
                      window.location.href = data.redirectUrl;
                      resolve();
                      return;
                    }
                    // Enrutado por estado: solo pagos aprobados llegan a
                    // /checkout/success (Meta cuenta la compra por esa URL).
                    const s = String(data.status ?? '');
                    const path = ['approved', 'authorized'].includes(s)
                      ? '/checkout/success'
                      : ['pending', 'in_process'].includes(s)
                      ? '/checkout/pending'
                      : '/checkout/invalid';
                    if (path === '/checkout/invalid') {
                      // Rechazado: mensaje visible antes de salir del Brick.
                      const msg = pick3(lang, 'El pago fue rechazado. Prueba con otro medio de pago.', 'Payment was rejected. Try another payment method.', 'Le paiement a été refusé. Essaie un autre moyen.');
                      setMessage(msg);
                      onError?.(msg);
                    }
                    window.location.href =
                      `${path}?provider=mercadopago&ref=${encodeURIComponent(order.reference)}&collection_status=${encodeURIComponent(s)}`;
                    resolve();
                  })
                  .catch(() => {
                    const msg = pick3(lang, 'No se pudo procesar el pago. Inténtalo de nuevo.', 'Could not process the payment. Try again.', 'Impossible de traiter le paiement. Réessaie.');
                    setMessage(msg);
                    onError?.(msg);
                    reject(new Error('network'));
                  });
              }),
          },
        });
      } catch {
        fail(pick3(lang, 'No se pudo cargar el pago. Inténtalo de nuevo.', 'Could not load payment. Try again.', 'Impossible de charger le paiement. Réessaie.'));
      }
    })();

    return () => {
      cancelled = true;
      try { controllerRef.current?.unmount?.(); } catch { /* no-op */ }
    };
    // Solo se monta una vez por paso de pago.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-3 py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-secondary-lighter font-bold">
            {pick3(lang, 'Cargando el pago seguro…', 'Loading secure payment…', 'Chargement du paiement sécurisé…')}
          </p>
        </div>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-500 font-bold text-center py-6">{message}</p>
      )}
      <div id="mp-brick-container" ref={containerRef} />
      {status === 'ready' && message && (
        <p className="text-sm text-red-500 font-bold text-center mt-3">{message}</p>
      )}
    </div>
  );
}
