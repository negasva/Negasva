'use client';

import { memo } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const REVIEWS = [
  { name: 'Maria Gonzalez', comment: 'Mi retrato quedo increible. La calidad es asombrosa.', stars: 5 },
  { name: 'Emma Thompson', comment: 'Absolutely stunning! Got my sci-fi cartoon portrait in under 24 hours.', stars: 5 },
  { name: 'Lucas Muller', comment: 'Incredible quality! My forest mystery portrait has so much personality.', stars: 5 },
  { name: 'Carlos Reyes', comment: 'Perfecto para regalo. Mi hermano quedo sin palabras al verlo.', stars: 5 },
  { name: 'Camille Dubois', comment: 'Portrait magnifique. La ressemblance est frappante. Je recommande a tous.', stars: 5 },
  { name: 'Valentina Sanchez', comment: 'Me quede sin palabras. El nivel de detalle es increible.', stars: 5 },
  { name: "James O'Brien", comment: "Best gift I've ever given. My wife cried happy tears when she saw it.", stars: 5 },
  { name: 'Alejandro Garcia', comment: 'Excelente trabajo. Capturo perfectamente mi estilo. Lo recomiendo al 100%.', stars: 5 },
  { name: 'Isabella Rossi', comment: 'Ho ordinato un ritratto cartoon familiare e sono rimasta senza parole.', stars: 5 },
  { name: 'Noah Williams', comment: 'Ordered the forest mystery style for my kids. They absolutely love it.', stars: 5 },
  { name: 'Sofia Lindstrom', comment: 'Fantastic quality! My yellow family portrait is now framed on my wall.', stars: 5 },
  { name: 'Pierre Laurent', comment: 'Tres professionnel et rapide. Le resultat depasse toutes mes attentes.', stars: 5 },
  { name: 'Oliver Schneider', comment: 'Outstanding quality and super fast. Every single detail was perfect.', stars: 5 },
  { name: 'Sofia Martinez', comment: 'Proceso muy facil y entrega rapida. Muy recomendado.', stars: 5 },
  { name: 'Catalina Herrera', comment: 'El mejor regalo. El retrato cartoon sci-fi le encanto a toda mi familia.', stars: 5 },
];

const row1 = REVIEWS.slice(0, 9);
const row2 = REVIEWS.slice(6, 15);

const AVATAR_GRADIENTS = [
  'from-primary to-primary-dark',
  'from-primary-light to-primary',
  'from-secondary-light to-secondary',
  'from-primary-dark to-secondary',
  'from-rose-400 to-primary-dark',
  'from-primary to-rose-500',
];

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function gradientFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

const ReviewCard = memo(function ReviewCard({ name, comment, stars, variant }: { name: string; comment: string; stars: number; variant: 1 | 2 }) {
  const shape = variant === 1 ? 'forma-cuadro1' : 'forma-cuadro2';
  return (
    // Envoltorio con sombra (no enmascarado) → separa la tarjeta del fondo.
    <div className="caja-review w-72 flex-shrink-0 mx-3">
      {/* Capa de color = borde que sigue la silueta hecha a mano (el padding
          crea la franja de color que asoma alrededor de la capa blanca). */}
      <div className={`${shape} bg-primary p-[3px]`}>
        {/* Capa blanca de contenido. */}
        <div className={`${shape} bg-white p-6`}>
          <div className="flex gap-1 mb-3">
            {Array.from({ length: stars }).map((_, i) => (
              <span key={i} className="text-primary text-lg">★</span>
            ))}
          </div>
          <p className="text-secondary-lighter text-sm mb-4 leading-relaxed">"{comment}"</p>
          <div className="flex items-center gap-3">
            <span
              className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradientFor(name)} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}
              aria-hidden
            >
              {initials(name)}
            </span>
            <div>
              <p className="font-bold text-secondary text-sm leading-tight">{name}</p>
              <p className="text-[11px] text-secondary-lighter">✓ Compra verificada</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

function TestimonialsScroll() {
  const { t } = useLanguage();

  return (
    <section className="py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 mb-16 text-center">
        <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary">
          {t.home.testimonials.title}
        </h2>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="mb-6 overflow-hidden">
        <div
          className="flex animate-marquee-left hover:[animation-play-state:paused]"
          style={{ width: 'max-content' }}
        >
          {[...row1, ...row1].map((r, i) => (
            <ReviewCard key={i} {...r} variant={i % 2 === 0 ? 1 : 2} />
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div className="overflow-hidden">
        <div
          className="flex animate-marquee-right hover:[animation-play-state:paused]"
          style={{ width: 'max-content' }}
        >
          {[...row2, ...row2].map((r, i) => (
            <ReviewCard key={i} {...r} variant={i % 2 === 0 ? 2 : 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(TestimonialsScroll);
