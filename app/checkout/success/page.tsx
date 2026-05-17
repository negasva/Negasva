'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Brief delay so the page feels intentional, not instant
    const t = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Logo href="/" size="lg" />
      </div>

      <div className="max-w-md w-full text-center">
        {ready ? (
          <>
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="font-black text-3xl text-secondary tracking-tighter mb-3">
              ¡Pago recibido!
            </h1>
            <p className="text-secondary-lighter mb-2">
              Tu pedido está en camino. Te enviaremos un email de confirmación pronto.
            </p>
            {sessionId && (
              <p className="text-xs text-secondary-lighter mt-1 font-mono break-all">
                Ref: {sessionId.slice(-12)}
              </p>
            )}
            <div className="mt-8 space-y-3">
              <Link
                href="/track"
                className="block w-full rounded-lg bg-primary px-6 py-3 font-bold text-white hover:bg-primary-dark transition-colors"
              >
                Seguir mi pedido
              </Link>
              <Link
                href="/"
                className="block w-full rounded-lg border-2 border-primary-lighter px-6 py-3 font-bold text-secondary hover:border-primary hover:bg-primary-lighter transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-secondary-lighter font-bold">Confirmando pago…</p>
          </div>
        )}
      </div>
    </div>
  );
}
