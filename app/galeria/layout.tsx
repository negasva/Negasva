import type { Metadata, Viewport } from 'next';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Galeria de Retratos',
  description: 'Explora ejemplos reales de retratos personalizados en estilos cartoon, familiares y de fantasia. Mira ideas y pide el tuyo en 48h.',
  alternates: { canonical: '/galeria' },
  openGraph: {
    title: 'Galeria de Retratos - NEGASVA',
    description: 'Ejemplos reales de retratos animados personalizados, antes y despues.',
  },
};

const GALLERY_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ImageGallery',
  name: 'Galeria de retratos animados personalizados - NEGASVA',
  url: 'https://negasva.shop/galeria',
  image: [
    {
      '@type': 'ImageObject',
      name: 'Retrato cartoon sci-fi con portal verde',
      description: 'Retrato animado personalizado dibujado a mano con colores intensos y fondo de portal.',
      contentUrl: 'https://negasva.shop/backgrounds/rm-1.jpg',
    },
    {
      '@type': 'ImageObject',
      name: 'Retrato cartoon sci-fi con fondo de laboratorio',
      description: 'Retrato animado personalizado con escenario de laboratorio futurista.',
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
      <BreadcrumbSchema name="Galeria" path="/galeria" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(GALLERY_SCHEMA) }} />
      {children}
    </>
  );
}
