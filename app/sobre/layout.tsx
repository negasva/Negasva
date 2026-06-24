import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre Nosotros',
  description: 'Conoce el equipo detras de NEGASVA, el servicio de retratos animados personalizados con mas de 1000 clientes felices.',
  alternates: { canonical: '/sobre' },
  openGraph: { title: 'Sobre NEGASVA - El equipo detras de los retratos animados' },
};

export default function SobreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
