import type { Metadata } from 'next';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';

export const metadata: Metadata = {
  title: 'Pricing — Custom Cartoon Portraits from $15',
  description:
    'Custom cartoon portrait pricing: torso from $15, full body from $25, custom backgrounds and 24h express delivery. Automatic discounts for groups and families.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Custom Cartoon Portrait Pricing - NEGASVA',
    description: 'From $15. Delivered in 48h. Automatic family discounts from 3 people.',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbSchema name="Pricing" path="/pricing" />
      {children}
    </>
  );
}
