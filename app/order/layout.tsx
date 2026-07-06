import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Your Custom Cartoon Portrait — From $15, Delivered in 48h',
  description:
    'Order your custom cartoon portrait: pick a style, upload your photo and get a 100% hand-drawn illustration — no AI — delivered in 48 hours, from $15.',
  alternates: { canonical: '/order' },
};

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
