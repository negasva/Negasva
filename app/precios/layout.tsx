import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Precios',
  description: 'Retratos animados desde $20 USD. Torso o cuerpo completo, con o sin fondo, entrega en 48 horas. Descuentos por grupos.',
  openGraph: { title: 'Precios de Retratos Animados — NEGASVA', description: 'Desde $20 USD. Entrega en 48h. Descuentos familiares y por pack.' },
};

export default function PreciosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
