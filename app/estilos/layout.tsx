import type { Metadata } from 'next';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';

export const metadata: Metadata = {
  title: 'Estilos de Retrato',
  description: 'Elige tu estilo de retrato animado: Rick & Morty, Los Simpsons, Gravity Falls o Padrinos Mágicos. Mira ejemplos y pide el tuyo desde $20 USD.',
  openGraph: {
    title: 'Estilos de Retrato Animado — NEGASVA',
    description: 'Rick & Morty, Simpsons, Gravity Falls y más. Elige tu estilo favorito y pide tu retrato.',
  },
};

export default function EstilosLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbSchema name="Estilos" path="/estilos" />
      {children}
    </>
  );
}
