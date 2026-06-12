import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Productos Físicos',
  description: 'Próximamente: tus retratos animados en productos físicos — tazas, cuadros, cojines y más.',
  openGraph: { title: 'Productos Físicos — NEGASVA' },
};

export default function ProductosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
