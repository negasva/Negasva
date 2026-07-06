import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Your Order',
  description: 'Check the status of your custom cartoon portrait with your order ID and email address.',
  alternates: { canonical: '/track-order' },
  robots: { index: true, follow: true },
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
