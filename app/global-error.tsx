'use client';

import { useEffect } from 'react';

// Reemplaza el root layout cuando el propio layout falla, así que renderiza su
// <html>/<body> y usa estilos inline (el CSS global no está disponible aquí).
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[app/global-error]', error);
  }, [error]);

  return (
    <html lang="es">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.75rem' }}>Algo salió mal</h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Tuvimos un problema inesperado. Puedes reintentar o volver al inicio.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ display: 'inline-block', padding: '0.75rem 1.5rem', borderRadius: 12, background: '#000', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer', marginRight: 8 }}
          >
            Reintentar
          </button>
          <a href="/" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', borderRadius: 12, fontWeight: 700, textDecoration: 'none', color: '#000', border: '2px solid #ddd' }}>
            Volver al inicio
          </a>
        </div>
      </body>
    </html>
  );
}
