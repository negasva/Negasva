import type { Metadata } from 'next';

// Metadata por defecto de la sección — /blog/[slug] la sobreescribe con
// generateMetadata. El breadcrumb schema vive en cada página para no duplicarse.
export const metadata: Metadata = {
  title: 'Blog — Guías y Consejos',
  description: 'Guías sobre retratos animados: cómo elegir tu estilo, tomar la foto perfecta y regalar un retrato personalizado. Consejos del equipo NEGASVA.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog NEGASVA — Guías y Consejos de Retratos Animados',
    description: 'Guías sobre retratos animados, estilos de caricatura y regalos originales.',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
