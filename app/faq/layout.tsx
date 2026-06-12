import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes',
  description: '¿Cuánto tarda? ¿Qué formatos? ¿Puedo pedir cambios? Resolvemos todas tus dudas sobre los retratos animados de NEGASVA.',
  openGraph: { title: 'FAQ — Preguntas Frecuentes | NEGASVA' },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
