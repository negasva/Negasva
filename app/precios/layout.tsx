import type { Metadata } from 'next';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';

export const metadata: Metadata = {
  title: 'Precios',
  description: 'Retratos animados desde $20 USD: torso o cuerpo completo, fondos temáticos y entrega exprés en 24h. Descuentos automáticos para grupos y familias.',
  openGraph: {
    title: 'Precios de Retratos Animados — NEGASVA',
    description: 'Desde $20 USD. Entrega en 48h. Descuentos familiares automáticos desde 3 personas.',
  },
};

export default function PreciosLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbSchema name="Precios" path="/precios" />
      {children}
    </>
  );
}
