import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contactanos para dudas sobre tu retrato animado, colaboraciones o consultas. Respondemos por Instagram y correo.',
  alternates: { canonical: '/contacto' },
  openGraph: { title: 'Contacto - NEGASVA' },
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
