import type { Metadata } from 'next';

// Página transaccional post-pago: no debe indexarse ni heredar el canonical
// del home. robots noindex evita que Ahrefs/Google la traten como duplicado.
export const metadata: Metadata = {
  title: 'Pago confirmado',
  robots: { index: false, follow: false },
  alternates: { canonical: '/checkout/success' },
};

export default function CheckoutSuccessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
