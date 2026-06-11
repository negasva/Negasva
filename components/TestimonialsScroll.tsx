'use client';

import { memo } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const REVIEWS = [
  { name: 'María González', comment: 'El retrato quedó exactamente como lo pedí. Muy buen trabajo.', stars: 5 },
  { name: 'Emma Thompson', comment: 'Got my Rick & Morty portrait in under 24 hours. Looks exactly like the show.', stars: 5 },
  { name: 'Lucas Müller', comment: 'My Gravity Falls portrait is spot on. The style is perfect.', stars: 5 },
  { name: 'Carlos Reyes', comment: 'Lo pedí para regalarle a mi hermano. No podía creer lo bien que quedó.', stars: 5 },
  { name: 'Camille Dubois', comment: 'La ressemblance est frappante. Livraison rapide et qualité au rendez-vous.', stars: 5 },
  { name: 'Valentina Sánchez', comment: 'El nivel de detalle es increíble. Se nota que no es IA.', stars: 5 },
  { name: "James O'Brien", comment: "Best gift I've ever given. My wife cried happy tears when she saw it.", stars: 5 },
  { name: 'Alejandro García', comment: 'Capturó perfectamente mi estilo. Proceso muy claro de principio a fin.', stars: 5 },
  { name: 'Isabella Rossi', comment: 'Ho ordinato in stile Simpsons. Il risultato ha superato le aspettative.', stars: 5 },
  { name: 'Noah Williams', comment: 'Ordered the Gravity Falls style for my kids. They absolutely love it.', stars: 5 },
  { name: 'Sofía Lindström', comment: 'My Simpsons portrait is now framed on my wall. Worth every penny.', stars: 5 },
  { name: 'Pierre Laurent', comment: 'Professionnel et rapide. Le résultat dépasse toutes mes attentes.', stars: 5 },
  { name: 'Oliver Schneider', comment: 'Outstanding quality. Every single detail was exactly right.', stars: 5 },
  { name: 'Sofía Martínez', comment: 'Entrega rápida y bien comunicado todo el proceso. Muy recomendado.', stars: 5 },
  { name: 'Catalina Herrera', comment: 'El retrato de Rick & Morty le encantó a toda la familia.', stars: 5 },
];

const row1 = REVIEWS.slice(0, 9);
const row2 = REVIEWS.slice(6, 15);

const ReviewCard = memo(function ReviewCard({ name, comment, stars }: { name: string; comment: string; stars: number }) {
  return (
    <div className="w-72 flex-shrink-0 bg-cream border-2 border-secondary/15 p-6 mx-3">
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: stars }).map((_, i) => (
          <span key={i} className="text-primary text-base">★</span>
        ))}
      </div>
      <p className="text-secondary-lighter text-sm mb-4 leading-relaxed">"{comment}"</p>
      <p className="font-bold text-secondary text-sm">{name}</p>
    </div>
  );
});

function TestimonialsScroll() {
  const { t } = useLanguage();

  return (
    <section className="py-20 overflow-hidden bg-cream">
      <div className="mx-auto max-w-7xl px-4 mb-16">
        <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary">
          {t.home.testimonials.title}
        </h2>
      </div>

      <div className="mb-4 overflow-hidden">
        <div
          className="flex animate-marquee-left hover:[animation-play-state:paused]"
          style={{ width: 'max-content' }}
        >
          {[...row1, ...row1].map((r, i) => (
            <ReviewCard key={i} {...r} />
          ))}
        </div>
      </div>

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
