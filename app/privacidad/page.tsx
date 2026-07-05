import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import PrivacidadContent from './Content';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Cómo NEGASVA recopila, usa y protege tu información personal y tus fotos al pedir tu retrato animado. Tus datos nunca se venden a terceros.',
  alternates: { canonical: '/privacidad' },
  openGraph: {
    title: 'Política de Privacidad — NEGASVA',
    description: 'Cómo protegemos tus datos y tus fotos.',
  },
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <PrivacidadContent />
      <PageFooter />
    </div>
  );
}
