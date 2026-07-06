'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

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
