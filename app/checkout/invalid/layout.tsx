import type { Metadata } from 'next';

// Página transaccional post-pago: no debe indexarse ni heredar el canonical.
export const metadata: Metadata = {
  title: 'Pago rechazado',
  robots: { index: false, follow: false },
  alternates: { canonical: '/checkout/invalid' },
};

export default function CheckoutInvalidLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
