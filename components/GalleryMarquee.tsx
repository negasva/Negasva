'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { cachedFetchJSON } from '@/lib/cache/clientCache';

// Carrusel auto-scroll (marquee) de la galería, editable desde el admin
// (/adminlanding/galeria → gallery_items). Below-the-fold y lazy-load: no
// afecta al LCP. Reutiliza el mismo endpoint y datos que /gallery.

interface Item {
  id: string;
  title: string;
  style: string | null;
  image_url: string | null;
}

// Alt pattern SEO pedido: "{estilo} style custom portrait hand drawn from photo".
const altFor = (i: Item) =>
  `${i.style ? `${i.style} style ` : ''}custom portrait hand drawn from photo`;

// Placeholders mientras no haya obras reales cargadas desde el admin.
const PLACEHOLDERS: Item[] = [
  { id: 'ph-1', title: 'Sample 1', style: 'Rick and Morty', image_url: null },
  { id: 'ph-2', title: 'Sample 2', style: 'Simpsons', image_url: null },
  { id: 'ph-3', title: 'Sample 3', style: 'Anime', image_url: null },
  { id: 'ph-4', title: 'Sample 4', style: 'Studio Ghibli', image_url: null },
];

function Card({ item }: { item: Item }) {
  return (
    <div className="relative w-[220px] sm:w-[260px] aspect-square flex-shrink-0 rounded-2xl overflow-hidden border-2 border-primary-lighter bg-primary-lighter/30">
      {item.image_url ? (
        <Image
          src={item.image_url}
          alt={altFor(item)}
          fill
          loading="lazy"
          className="object-cover"
          sizes="260px"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-primary-dark">
          <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">
            <rect x="3" y="7" width="18" height="13" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M8 7 L10 4 L14 4 L16 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="12" cy="13.5" r="3.2" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default function GalleryMarquee() {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    cachedFetchJSON<Item[]>('/api/gallery')
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]));
  }, []);

  const list = items && items.length > 0 ? items : PLACEHOLDERS;
  // Duplicamos la lista para que el marquee de -50% haga loop sin cortes.
  const track = [...list, ...list];

  return (
    <section className="bg-[#FFF1F7] py-14 md:py-16 overflow-hidden">
      <div className="mx-auto max-w-[1150px] px-6 mb-8 text-center">
        <h2 className="font-black text-[26px] sm:text-[34px] md:text-[40px] leading-tight">
          Real portraits, hand-drawn
        </h2>
      </div>
      <div className="group relative w-full overflow-hidden">
        <div className="flex gap-5 w-max animate-marquee-left group-hover:[animation-play-state:paused]">
          {track.map((item, i) => (
            <Card key={`${item.id}-${i}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
