import type { Metadata } from 'next';

// Metadata por defecto de la sección — /estilos/[slug] la sobreescribe con
// generateMetadata. El breadcrumb schema vive en cada página para no duplicarse.
export const metadata: Metadata = {
  title: 'Estilos de Retrato',
  description: 'Elige tu estilo de retrato animado: Rick & Morty, Los Simpsons, Gravity Falls o Padrinos Mágicos. Mira ejemplos y pide el tuyo desde $20 USD.',
  alternates: { canonical: '/estilos' },
  openGraph: {
    title: 'Estilos de Retrato Animado — NEGASVA',
    description: 'Rick & Morty, Simpsons, Gravity Falls y más. Elige tu estilo favorito y pide tu retrato.',
  },
};

export default function EstilosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
