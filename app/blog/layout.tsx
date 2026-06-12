import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — Guías y Consejos',
  description: 'Artículos sobre retratos animados, estilos de caricatura, regalos originales y el proceso creativo de NEGASVA.',
  openGraph: { title: 'Blog NEGASVA — Guías y Consejos de Retratos Animados' },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
