import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estilos de Retrato',
  description: 'Elige entre Rick & Morty, Los Simpsons, Gravity Falls, Padrinos Mágicos y más estilos para tu retrato animado personalizado.',
  openGraph: { title: 'Estilos de Retrato Animado — NEGASVA', description: 'Rick & Morty, Simpsons, Gravity Falls y más. Elige tu estilo favorito.' },
};

export default function EstilosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
