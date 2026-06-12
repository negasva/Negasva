'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';

interface Props {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  alt?: string;
}

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = 'Foto',
  afterLabel = 'NEGASVA',
  alt = 'Antes y después',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, x)));
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      updateFromClientX(e.clientX);
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [updateFromClientX]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square select-none overflow-hidden rounded-2xl shadow-lg border-2 border-primary-lighter touch-none"
      onPointerDown={(e) => {
        dragging.current = true;
        updateFromClientX(e.clientX);
      }}
    >
      {/* After (full) */}
      <Image
        src={afterSrc}
        alt={`${alt} — retrato animado terminado`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 600px"
        draggable={false}
      />

      {/* Before (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${pos}%` }}
      >
        <Image
          src={beforeSrc}
          alt={`${alt} — foto original`}
          className="absolute inset-0 h-full max-w-none object-cover"
          width={600}
          height={600}
          style={{ width: `${containerRef.current ? containerRef.current.clientWidth : 0}px` }}
          draggable={false}
        />
      </div>

      {/* Labels */}
      <span className="absolute top-3 left-3 bg-white/90 text-secondary text-xs font-bold px-2 py-1 rounded-full">
        {beforeLabel}
      </span>
      <span className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
        {afterLabel}
      </span>

      {/* Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
        style={{ left: `calc(${pos}% - 0.5px)` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-secondary font-black">
          ⇆
        </div>
      </div>
    </div>
  );
}
