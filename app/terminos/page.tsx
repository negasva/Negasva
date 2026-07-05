import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import TerminosContent from './Content';

export const metadata: Metadata = {
  title: 'Términos de Servicio',
  description: 'Condiciones de uso de NEGASVA: entrega en 48h, política de reembolsos, derechos de uso de tu retrato animado y tratamiento de tus fotos.',
  alternates: { canonical: '/terminos' },
  openGraph: {
    title: 'Términos de Servicio — NEGASVA',
    description: 'Entrega, reembolsos y derechos de uso de tu retrato.',
  },
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <TerminosContent />
      <PageFooter />
    </div>
  );
}
