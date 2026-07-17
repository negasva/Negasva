import type { Metadata } from 'next';

// Página transaccional post-pago: no debe indexarse ni heredar el canonical.
export const metadata: Metadata = {
  title: 'Pago pendiente',
  robots: { index: false, follow: false },
  alternates: { canonical: '/checkout/pending' },
};

export default function CheckoutPendingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
