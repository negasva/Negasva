'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';

const FAQS = [
  {
    q: '¿Cuánto tarda mi retrato?',
    a: 'La entrega estándar es de 48 horas o menos. Con la opción exprés 24h (+30%), saltas la cola y lo recibes al día siguiente.',
  },
  {
    q: '¿Qué formatos recibo?',
    a: 'PNG y JPG en alta resolución, listos para imprimir o publicar en redes sociales. Si necesitas un tamaño específico, díganos en las notas.',
  },
  {
    q: '¿Puedo pedir cambios después de recibirlo?',
    a: 'Sí. Tienes 24 horas tras la entrega para solicitar ajustes. Los retoques menores (color de pelo, accesorio, expresión) están incluidos sin costo.',
  },
  {
    q: '¿Cómo funciona el descuento por pack familia?',
    a: 'Automático: 3 personas o más obtienen 15% off, 5 o más obtienen 25% off. Solo añade gente en el paso 2 y verás el descuento aplicado.',
  },
  {
    q: '¿Qué pasa si la foto no es de buena calidad?',
    a: 'Te contactamos antes de empezar. Si la foto no permite un buen resultado, te pedimos otra o devolvemos el pago completo. Sin compromiso.',
  },
  {
    q: '¿Aceptan otras divisas?',
    a: 'Sí: USD, EUR, GBP, MXN, CAD y COP. Detectamos tu país automáticamente y puedes cambiar la divisa con el selector arriba.',
  },
  {
    q: '¿Puedo regalar un retrato?',
    a: 'Sí. Compra normalmente y úsalo como regalo. Pronto vamos a tener tarjetas regalo con código por email.',
  },
  {
    q: '¿Cómo pago? ¿Es seguro?',
    a: 'Procesamos pagos con Stripe (tarjeta, Apple Pay, Google Pay). Nunca vemos los datos de tu tarjeta. Pago 100% seguro.',
  },
  {
    q: '¿Puedo usar mi retrato comercialmente?',
    a: 'Tu retrato es para uso personal (redes, regalos, decoración). Para uso comercial, escríbenos a hola@negasva.com y armamos una licencia.',
  },
  {
    q: '¿Hago seguimiento de mi pedido?',
    a: (
      <>
        Sí, en la página de{' '}
        <Link href="/seguimiento" className="text-primary font-bold underline">
          seguimiento
        </Link>{' '}
        con tu ID de pedido y email.
      </>
    ),
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-gradient-to-br from-white via-primary-lighter to-white py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-black text-5xl md:text-6xl tracking-tighter text-secondary mb-4">
            Preguntas frecuentes
          </h1>
          <p className="text-lg text-secondary-lighter">
            Las respuestas que más nos piden, en un solo lugar.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-3xl space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`rounded-2xl border-2 transition-all ${
                  isOpen ? 'border-primary bg-primary-lighter shadow-md' : 'border-primary-lighter bg-white'
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-secondary">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-secondary-lighter flex-shrink-0 transition-transform ${isOpen ? 'rotate-180 text-primary' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-secondary-lighter leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-secondary py-16 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-black text-3xl text-white tracking-tighter mb-4">
            ¿No encuentras tu respuesta?
          </h2>
          <p className="text-gray-300 mb-6">
            Escríbenos por Instagram, respondemos rápido.
          </p>
          <a
            href="https://instagram.com/negasva"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-primary px-8 py-4 font-bold text-white hover:bg-primary-dark transition-colors"
          >
            @negasva en Instagram
          </a>
        </div>
      </section>

      <PageFooter minimal />
    </div>
  );
}
