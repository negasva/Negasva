import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seguimiento de Pedido',
  description: 'Consulta el estado de tu retrato animado con tu ID de pedido y correo electrónico.',
  robots: { index: false, follow: false },
};

export default function SeguimientoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
