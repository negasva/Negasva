import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact us about your custom cartoon portrait, collaborations or any question. We reply via Instagram and email.',
  alternates: { canonical: '/contact' },
  openGraph: { title: 'Contact - NEGASVA' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
