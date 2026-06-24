import type { Metadata } from 'next';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes',
  description: 'Cuanto tarda tu retrato animado? Que formatos recibes? Puedes pedir cambios? Resolvemos todas tus dudas antes de pedir tu retrato en NEGASVA.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ - Preguntas Frecuentes | NEGASVA',
    description: 'Tiempos de entrega, formatos, cambios, pagos y mas. Todas tus dudas resueltas.',
  },
};

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { q: 'Cuanto tarda mi retrato?', a: 'La entrega estandar es de 48 horas o menos. Con la opcion expres 24h (+30%), saltas la cola y lo recibes al dia siguiente.' },
    { q: 'Que formatos recibo?', a: 'PNG y JPG en alta resolucion, listos para imprimir o publicar en redes sociales.' },
    { q: 'Puedo pedir cambios despues de recibirlo?', a: 'Si. Tienes 24 horas tras la entrega para solicitar ajustes. Los retoques menores estan incluidos sin costo.' },
    { q: 'Como funciona el descuento por pack familia?', a: 'Automatico: 3 personas o mas obtienen 15% off, 5 o mas obtienen 25% off.' },
    { q: 'Que pasa si la foto no es de buena calidad?', a: 'Te contactamos antes de empezar. Si la foto no permite un buen resultado, te pedimos otra o devolvemos el pago completo.' },
    { q: 'Aceptan otras divisas?', a: 'Si: USD, EUR, GBP, MXN, CAD y COP. Detectamos tu pais automaticamente.' },
    { q: 'Como pago? Es seguro?', a: 'Procesamos pagos con Stripe (tarjeta, Apple Pay, Google Pay). Pago 100% seguro.' },
    { q: 'Puedo usar mi retrato comercialmente?', a: 'Tu retrato es para uso personal. Para uso comercial, escribenos y armamos una licencia.' },
  ].map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbSchema name="Preguntas Frecuentes" path="/faq" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
      {children}
    </>
  );
}
