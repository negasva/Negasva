'use client';

import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import type { CheckoutController } from './useCheckout';

/** Step 1 — pick the cartoon style. */
export default function StepStyle({ c }: { c: CheckoutController }) {
  const { t, styles, selected, selectStyle } = c;

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="font-black text-4xl text-secondary mb-3 tracking-tighter">{t.studio.step1.title}</h1>
        <p className="text-lg text-secondary-lighter">{t.studio.step1.subtitle}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {styles.map((s) => (
          <button
            key={s.id}
            onClick={() => selectStyle(s.id)}
            className={`rounded-2xl border-2 overflow-hidden text-center transition-all focus:outline-none ${
              selected.style === s.id
                ? 'border-primary bg-primary-lighter ring-2 ring-primary shadow-lg'
                : 'border-primary-lighter bg-white hover:border-primary hover:shadow-md'
            }`}
          >
            {/* Placeholder rosa con icono (como StepBody); la imagen real —
                resuelta en /api/styles igual que en la home — encima cuando existe. */}
            <div className="relative aspect-[4/3]">
              <div className="absolute inset-0 flex items-center justify-center bg-primary-lighter/50 text-primary/60">
                <ImageIcon className="w-8 h-8" aria-hidden />
              </div>
              {s.image && (
                <Image
                  src={s.image}
                  alt={s.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 20vw"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              )}
            </div>
            <p className="font-bold text-secondary px-2 py-3">{s.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
