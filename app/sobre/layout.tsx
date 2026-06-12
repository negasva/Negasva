import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre Nosotros',
  description: 'Conoce el equipo detrás de NEGASVA, el servicio de retratos animados personalizados con más de 1000 clientes felices.',
  openGraph: { title: 'Sobre NEGASVA — El equipo detrás de los retratos animados' },
};

export default function SobreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
