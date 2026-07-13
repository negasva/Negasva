'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[app/error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md w-full">
        <h1 className="font-black text-3xl text-secondary tracking-tighter mb-3">Algo salió mal</h1>
        <p className="text-secondary-lighter mb-8">
          Tuvimos un problema al cargar esta página. Puedes reintentar o volver al inicio.
        </p>
        <div className="space-y-3">
          <button
            type="button"
            onClick={reset}
            className="block w-full rounded-xl bg-primary px-6 py-3 font-black text-white hover:bg-primary-dark transition-all"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="block w-full rounded-lg border-2 border-primary-lighter px-6 py-3 font-bold text-secondary hover:border-primary hover:bg-primary-lighter transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
