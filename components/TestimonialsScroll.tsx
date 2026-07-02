'use client';

import { memo, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// 20 reseñas, comentario de UNA línea. `photo` es la ruta de la foto del
// retrato entregado (14 tarjetas la llevan); mientras el archivo no exista se
// muestra un espacio reservado — las rutas se rellenan cuando lleguen las
// imágenes reales a /public/reviews/.
const REVIEWS: Array<{ name: string; comment: string; photo: string | null }> = [
  { name: 'Maria Gonzalez', comment: 'Mi retrato quedó increíble, la calidad es asombrosa.', photo: '/reviews/r1.webp' },
  { name: 'Emma Thompson', comment: 'Absolutely stunning! Got my portrait in under 24 hours.', photo: '/reviews/r2.webp' },
  { name: 'Lucas Muller', comment: 'Incredible quality, so much personality.', photo: '/reviews/r3.webp' },
  { name: 'Carlos Reyes', comment: 'Perfecto para regalo, mi hermano quedó sin palabras.', photo: '/reviews/r4.webp' },
  { name: 'Camille Dubois', comment: 'Portrait magnifique, la ressemblance est frappante.', photo: '/reviews/r5.webp' },
  { name: 'Valentina Sanchez', comment: 'El nivel de detalle es increíble.', photo: '/reviews/r6.webp' },
  { name: "James O'Brien", comment: 'Best gift ever, my wife cried happy tears.', photo: '/reviews/r7.webp' },
  { name: 'Alejandro Garcia', comment: 'Capturó perfectamente mi estilo, lo recomiendo al 100%.', photo: '/reviews/r8.webp' },
  { name: 'Isabella Rossi', comment: 'Sono rimasta senza parole, bellissimo.', photo: '/reviews/r9.webp' },
  { name: 'Noah Williams', comment: 'My kids absolutely love it.', photo: '/reviews/r10.webp' },
  { name: 'Sofia Lindstrom', comment: 'My family portrait is now framed on my wall.', photo: '/reviews/r11.webp' },
  { name: 'Pierre Laurent', comment: 'Le résultat dépasse toutes mes attentes.', photo: '/reviews/r12.webp' },
  { name: 'Oliver Schneider', comment: 'Every single detail was perfect.', photo: '/reviews/r13.webp' },
  { name: 'Catalina Herrera', comment: 'El retrato le encantó a toda mi familia.', photo: '/reviews/r14.webp' },
  { name: 'Sofia Martinez', comment: 'Proceso muy fácil y entrega rápida.', photo: null },
  { name: 'Daniel Kim', comment: 'Great communication and a flawless result.', photo: null },
  { name: 'Laura Pérez', comment: 'Superó lo que imaginaba, volveré a pedir.', photo: null },
  { name: 'Tom Becker', comment: 'Fast, friendly and incredibly talented artists.', photo: null },
  { name: 'Ana Suárez', comment: 'El mejor regalo de aniversario que he dado.', photo: null },
  { name: 'Chloé Martin', comment: 'Très professionnel et rapide, je recommande.', photo: null },
];

const AVATAR_GRADIENTS = [
  'from-primary to-primary-dark',
  'from-primary-light to-primary',
  'from-secondary-light to-secondary',
  'from-primary-dark to-secondary',
  'from-rose-400 to-primary-dark',
  'from-primary to-rose-500',
];

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function gradientFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

const ReviewCard = memo(function ReviewCard({ name, comment, photo }: { name: string; comment: string; photo: string | null }) {
  return (
    <div className="w-[340px] sm:w-[400px] flex-shrink-0 snap-start rounded-2xl border-2 border-primary-lighter bg-white overflow-hidden shadow-sm">
      {/* Foto del retrato entregado — espacio reservado si aún no hay imagen */}
      {photo !== null && (
        <div className="relative h-44 w-full bg-primary-lighter/40 flex items-center justify-center">
          <Camera className="w-8 h-8 text-primary/40" aria-hidden />
          <Image
            src={photo}
            alt={`Retrato entregado a ${name}`}
            fill
            className="object-cover"
            sizes="400px"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="text-primary text-xl">★</span>
          ))}
        </div>
        <p className="text-secondary text-base font-semibold mb-4 whitespace-nowrap overflow-hidden text-ellipsis">
          "{comment}"
        </p>
        <div className="flex items-center gap-3">
          <span
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradientFor(name)} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}
            aria-hidden
          >
            {initials(name)}
          </span>
          <div>
            <p className="font-bold text-secondary text-base leading-tight">{name}</p>
            <p className="text-xs text-secondary-lighter">✓ Compra verificada</p>
          </div>
        </div>
      </div>
    </div>
  );
});

function TestimonialsScroll() {
  const { t } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);

  // Sin animación: carrusel manual con scroll lateral o flechas.
  const scrollBy = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 420, behavior: 'smooth' });
  };

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 mb-12 text-center">
        <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary">
          {t.home.testimonials.title}
        </h2>
      </div>

      <div className="relative mx-auto max-w-7xl px-4">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Anterior"
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center rounded-full bg-white border-2 border-primary text-primary shadow-lg hover:bg-primary hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div
          ref={trackRef}
          className="reviews-track flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 sm:mx-8"
        >
          {REVIEWS.map((r) => (
            <ReviewCard key={r.name} {...r} />
          ))}
        </div>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Siguiente"
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center rounded-full bg-white border-2 border-primary text-primary shadow-lg hover:bg-primary hover:text-white transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}

export default memo(TestimonialsScroll);
