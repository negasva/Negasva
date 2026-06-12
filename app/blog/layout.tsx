import type { Metadata } from 'next';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';

export const metadata: Metadata = {
  title: 'Blog — Guías y Consejos',
  description: 'Guías sobre retratos animados: cómo elegir tu estilo, tomar la foto perfecta y regalar un retrato personalizado. Consejos del equipo NEGASVA.',
  openGraph: {
    title: 'Blog NEGASVA — Guías y Consejos de Retratos Animados',
    description: 'Guías sobre retratos animados, estilos de caricatura y regalos originales.',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbSchema name="Blog" path="/blog" />
      {children}
    </>
  );
}
