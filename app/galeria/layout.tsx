import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Galería de Retratos',
  description: 'Explora ejemplos reales de retratos animados en estilos Rick & Morty, Simpsons, Gravity Falls y más. Ve cómo quedaría tu retrato antes de pedirlo.',
  openGraph: { title: 'Galería de Retratos — NEGASVA', description: 'Ejemplos reales de retratos animados personalizados.' },
};

export default function GaleriaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
