'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { cachedFetchJSON } from '@/lib/cache/clientCache';

interface Item {
  id: string;
  title: string;
  style: string | null;
  image_url: string | null;
}

const altFor = (i: Item) =>
  `${i.style ? `${i.style} style ` : ''}custom portrait hand drawn from photo`;

const PLACEHOLDERS: Item[] = [
  { id: 'ph-1', title: 'Sample 1', style: 'Rick and Morty', image_url: null },
  { id: 'ph-2', title: 'Sample 2', style: 'Simpsons', image_url: null },
  { id: 'ph-3', title: 'Sample 3', style: 'Anime', image_url: null },
  { id: 'ph-4', title: 'Sample 4', style: 'Studio Ghibli', image_url: null },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Card({ item, onClick }: { item: Item; onClick?: () => void }) {
  return (
    <div
      className={`relative w-[220px] sm:w-[260px] aspect-square flex-shrink-0 rounded-2xl overflow-hidden border-2 border-primary-lighter bg-primary-lighter/30 ${item.image_url ? 'cursor-pointer' : ''}`}
      onClick={item.image_url ? onClick : undefined}
    >
      {item.image_url ? (
        <Image
          src={item.image_url}
          alt={altFor(item)}
          fill
          loading="lazy"
          className="object-cover hover:scale-105 transition-transform duration-300"
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

function Lightbox({ item, onClose }: { item: Item; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
    >
      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute top-4 right-4 text-white text-2xl font-black leading-none w-11 h-11 flex items-center justify-center rounded-full"
        style={{ textShadow: '0 0 12px #FC90B6, 0 0 24px #FC90B6' }}
      >
        ✕
      </button>
      <div className="relative max-w-[90vw] max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image_url!}
          alt={altFor(item)}
          className="block max-w-[90vw] max-h-[90vh] object-contain"
        />
      </div>
    </div>
  );
}

export default function GalleryMarquee() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [lightbox, setLightbox] = useState<Item | null>(null);

  useEffect(() => {
    cachedFetchJSON<Item[]>('/api/gallery', { ttlMs: 0, init: { cache: 'no-store' } })
      .then((d) => setItems(Array.isArray(d) ? shuffle(d) : []))
      .catch(() => setItems([]));
  }, []);

  const list = items && items.length > 0 ? items : PLACEHOLDERS;
  const half = list.length >= 12
    ? list
    : Array.from({ length: Math.ceil(12 / list.length) }, () => list).flat();
  const track = [...half, ...half];

  return (
    <>
      <section className="bg-[#FFF1F7] py-14 md:py-16 overflow-hidden">
        <div className="mx-auto max-w-[1150px] px-6 mb-8 text-center">
          <h2 className="font-black text-[26px] sm:text-[34px] md:text-[40px] leading-tight">
            Real portraits, hand-drawn
          </h2>
        </div>
        <div className="group relative w-full overflow-hidden">
          <div className="flex gap-5 w-max animate-marquee-left group-hover:[animation-play-state:paused]">
            {track.map((item, i) => (
              <Card key={`${item.id}-${i}`} item={item} onClick={() => setLightbox(item)} />
            ))}
          </div>
        </div>
      </section>

      {lightbox && <Lightbox item={lightbox} onClose={() => setLightbox(null)} />}
    </>
  );
}
