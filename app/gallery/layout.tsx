import type { Metadata, Viewport } from 'next';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Gallery — Custom Cartoon Portrait Examples',
  description:
    'Real examples of hand-drawn custom cartoon portraits: couples, families and pets in Simpsons, Rick and Morty, anime and more styles. Get yours in 48h.',
  alternates: { canonical: '/gallery' },
  openGraph: {
    title: 'Custom Cartoon Portrait Gallery - NEGASVA',
    description: 'Real examples of personalized hand-drawn cartoon portraits, before and after.',
  },
};

const GALLERY_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ImageGallery',
  name: 'Custom cartoon portrait gallery - NEGASVA',
  url: 'https://negasva.shop/gallery',
  image: [
    {
      '@type': 'ImageObject',
      name: 'Sci-fi cartoon portrait with green portal',
      description: 'Custom hand-drawn cartoon portrait with vivid colors and a portal background.',
      contentUrl: 'https://negasva.shop/backgrounds/rm-1.jpg',
    },
    {
      '@type': 'ImageObject',
      name: 'Sci-fi cartoon portrait with lab background',
      description: 'Custom cartoon portrait set in a futuristic laboratory scene.',
      contentUrl: 'https://negasva.shop/backgrounds/rm-3.jpg',
    },
    {
      '@type': 'ImageObject',
      name: 'Cartoon portrait with outer space background',
      description: 'Personalized cartoon-style portrait with an outer space backdrop.',
      contentUrl: 'https://negasva.shop/backgrounds/rm-4.jpg',
    },
  ],
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbSchema name="Gallery" path="/gallery" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(GALLERY_SCHEMA) }} />
      {children}
    </>
  );
}
