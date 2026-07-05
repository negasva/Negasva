import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seguimiento de Pedido',
  description: 'Consulta el estado de tu retrato animado con tu ID de pedido y correo electronico.',
  alternates: { canonical: '/seguimiento' },
  robots: { index: true, follow: true },
};

export default function SeguimientoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
