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

const GALLERY_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ImageGallery',
  name: 'Galería de retratos animados personalizados — NEGASVA',
  url: 'https://negasva.shop/galeria',
  image: [
    {
      '@type': 'ImageObject',
      name: 'Retrato estilo Rick & Morty con portal interdimensional',
      description: 'Retrato animado personalizado dibujado a mano en estilo Rick & Morty con el portal verde de fondo.',
      contentUrl: 'https://negasva.shop/backgrounds/rm-1.jpg',
    },
    {
      '@type': 'ImageObject',
      name: 'Retrato estilo Rick & Morty en el garage de Rick',
      description: 'Retrato animado personalizado con el garage lleno de inventos como escenario.',
      contentUrl: 'https://negasva.shop/backgrounds/rm-3.jpg',
    },
    {
      '@type': 'ImageObject',
      name: 'Retrato animado con fondo espacial',
      description: 'Retrato personalizado estilo caricatura con fondo del espacio exterior.',
      contentUrl: 'https://negasva.shop/backgrounds/rm-4.jpg',
    },
  ],
};

export default function GaleriaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbSchema name="Galería" path="/galeria" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(GALLERY_SCHEMA) }} />
      {children}
    </>
  );
}
