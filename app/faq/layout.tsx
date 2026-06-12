import type { Metadata } from 'next';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes',
  description: '¿Cuánto tarda tu retrato animado? ¿Qué formatos recibes? ¿Puedes pedir cambios? Resolvemos todas tus dudas antes de pedir tu retrato en NEGASVA.',
  openGraph: {
    title: 'FAQ — Preguntas Frecuentes | NEGASVA',
    description: 'Tiempos de entrega, formatos, cambios, pagos y más. Todas tus dudas resueltas.',
  },
};

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { q: '¿Cuánto tarda mi retrato?', a: 'La entrega estándar es de 48 horas o menos. Con la opción exprés 24h (+30%), saltas la cola y lo recibes al día siguiente.' },
    { q: '¿Qué formatos recibo?', a: 'PNG y JPG en alta resolución, listos para imprimir o publicar en redes sociales.' },
    { q: '¿Puedo pedir cambios después de recibirlo?', a: 'Sí. Tienes 24 horas tras la entrega para solicitar ajustes. Los retoques menores están incluidos sin costo.' },
    { q: '¿Cómo funciona el descuento por pack familia?', a: 'Automático: 3 personas o más obtienen 15% off, 5 o más obtienen 25% off.' },
    { q: '¿Qué pasa si la foto no es de buena calidad?', a: 'Te contactamos antes de empezar. Si la foto no permite un buen resultado, te pedimos otra o devolvemos el pago completo.' },
    { q: '¿Aceptan otras divisas?', a: 'Sí: USD, EUR, GBP, MXN, CAD y COP. Detectamos tu país automáticamente.' },
    { q: '¿Cómo pago? ¿Es seguro?', a: 'Procesamos pagos con Stripe (tarjeta, Apple Pay, Google Pay). Pago 100% seguro.' },
    { q: '¿Puedo usar mi retrato comercialmente?', a: 'Tu retrato es para uso personal. Para uso comercial, escríbenos y armamos una licencia.' },
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
