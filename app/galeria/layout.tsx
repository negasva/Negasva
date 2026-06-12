import type { Metadata, Viewport } from 'next';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Galería de Retratos',
  description: 'Explora ejemplos reales de retratos animados en estilos Rick & Morty, Simpsons y Gravity Falls. Mira el antes y después y pide el tuyo hoy.',
  openGraph: {
    title: 'Galería de Retratos — NEGASVA',
    description: 'Ejemplos reales de retratos animados personalizados, antes y después.',
  },
};

export default function GaleriaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbSchema name="Galería" path="/galeria" />
      {children}
    </>
  );
}
