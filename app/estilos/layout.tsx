import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estilos de Retrato',
  description: 'Elige tu estilo de retrato personalizado: cartoon sci-fi, familia amarilla, misterio del bosque o fantasia brillante. Desde $20 USD.',
  alternates: { canonical: '/estilos' },
  openGraph: {
    title: 'Estilos de Retrato Animado - NEGASVA',
    description: 'Elige un estilo visual claro para tu retrato personalizado y pide tu dibujo digital en 48h.',
  },
};

export default function EstilosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
