'use client';

import { memo } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const REVIEWS = [
  { name: 'María González', comment: '¡Mi retrato quedó increíble! La calidad es asombrosa.', stars: 5 },
  { name: 'Emma Thompson', comment: 'Absolutely stunning! Got my Rick & Morty portrait in under 24 hours.', stars: 5 },
  { name: 'Lucas Müller', comment: 'Incredible quality! My Gravity Falls portrait looks exactly like the show.', stars: 5 },
  { name: 'Carlos Reyes', comment: 'Perfecto para regalo. Mi hermano quedó sin palabras al verlo.', stars: 5 },
  { name: 'Camille Dubois', comment: 'Portrait magnifique! La ressemblance est frappante. Je recommande à tous!', stars: 5 },
  { name: 'Valentina Sánchez', comment: '¡Me quedé sin palabras! El nivel de detalle es increíble.', stars: 5 },
  { name: "James O'Brien", comment: "Best gift I've ever given. My wife cried happy tears when she saw it!", stars: 5 },
  { name: 'Alejandro García', comment: 'Excelente trabajo. Capturó perfectamente mi estilo. Lo recomiendo al 100%.', stars: 5 },
  { name: 'Isabella Rossi', comment: 'Ho ordinato in stile Simpsons e sono rimasta senza parole. Eccellente!', stars: 5 },
  { name: 'Noah Williams', comment: 'Ordered the Gravity Falls style for my kids. They absolutely love it!', stars: 5 },
  { name: 'Sofía Lindström', comment: 'Fantastic quality! My Simpsons portrait is now framed on my wall.', stars: 5 },
  { name: 'Pierre Laurent', comment: 'Très professionnel et rapide. Le résultat dépasse toutes mes attentes!', stars: 5 },
  { name: 'Oliver Schneider', comment: 'Outstanding quality and super fast! Every single detail was perfect.', stars: 5 },
  { name: 'Sofía Martínez', comment: 'Proceso muy fácil y entrega rápida. ¡Muy recomendado a todos!', stars: 5 },
  { name: 'Catalina Herrera', comment: '¡El mejor regalo! El retrato de Rick & Morty le encantó a toda mi familia.', stars: 5 },
];

const row1 = REVIEWS.slice(0, 9);
const row2 = REVIEWS.slice(6, 15);

const AVATAR_GRADIENTS = [
  'from-pink-400 to-rose-500',
  'from-violet-400 to-purple-600',
  'from-sky-400 to-blue-600',
  'from-emerald-400 to-teal-600',
  'from-amber-400 to-orange-500',
  'from-fuchsia-400 to-pink-600',
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

const ReviewCard = memo(function ReviewCard({ name, comment, stars }: { name: string; comment: string; stars: number }) {
  return (
    <div className="w-72 flex-shrink-0 bg-white rounded-2xl border-2 border-primary-lighter p-6 mx-3 shadow-sm">
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
            <ReviewCard key={i} {...r} />
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
            <ReviewCard key={i} {...r} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(TestimonialsScroll);
