import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import CookiesContent from './Content';

export const metadata: Metadata = {
  title: 'Política de Cookies',
  description: 'Conoce qué cookies utiliza NEGASVA (esenciales, analíticas y funcionales), para qué sirven y cómo puedes controlarlas desde tu navegador.',
  alternates: { canonical: '/cookies' },
  openGraph: {
    title: 'Política de Cookies — NEGASVA',
    description: 'Qué cookies usamos y cómo controlarlas.',
  },
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <CookiesContent />
      <PageFooter />
    </div>
  );
}
