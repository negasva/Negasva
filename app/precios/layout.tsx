import type { Metadata } from 'next';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';

export const metadata: Metadata = {
  title: 'Precios',
  description: 'Retratos animados desde $20 USD: torso o cuerpo completo, fondos tematicos y entrega expres en 24h. Descuentos automaticos para grupos y familias.',
  alternates: { canonical: '/precios' },
  openGraph: {
    title: 'Precios de Retratos Animados - NEGASVA',
    description: 'Desde $20 USD. Entrega en 48h. Descuentos familiares automaticos desde 3 personas.',
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
