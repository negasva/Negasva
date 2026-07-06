'use client';

import { memo, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { DEFAULT_HOME_CONTENT, type HomeTestimonial } from '@/lib/content/homeContent';

// Las reseñas se editan en /adminlanding/landing (landing_config.home_content)
// y llegan por props desde la home; el default de lib/content/homeContent.ts
// es solo el fallback para consumidores sin props.

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
      {!!photo && (
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

function TestimonialsScroll({ reviews = DEFAULT_HOME_CONTENT.testimonials }: { reviews?: HomeTestimonial[] }) {
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
          {reviews.map((r) => (
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
