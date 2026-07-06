'use client';

import Image from 'next/image';
import { Check, Sparkles } from 'lucide-react';
import type { CheckoutController } from './useCheckout';

/** Step 3 — choose the background. */
export default function StepBackground({ c }: { c: CheckoutController }) {
  const {
    t, fmt, selected, priceMap, getStyleBgs,
    errorRing, errorShake, onShakeEnd, selectBackground,
  } = c;

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="font-black text-4xl text-secondary mb-3 tracking-tighter">{t.studio.step3.title}</h2>
        <p className="text-lg text-secondary-lighter">{t.studio.step3.subtitle}</p>
      </div>
      <div id="required-field" onAnimationEnd={onShakeEnd} className={`grid grid-cols-2 gap-3 ${errorRing} ${errorShake}`}>
        {getStyleBgs().map((bg) => {
          const isSelected = selected.background === bg.id;

          if (bg.id === 'none') {
            return (
              <button
                key={bg.id}
                onClick={() => selectBackground(bg.id)}
                className={`rounded-2xl border-2 text-center transition-all focus:outline-none overflow-hidden flex flex-col items-center justify-center min-h-[152px] ${
                  isSelected
                    ? 'border-secondary bg-secondary-light ring-2 ring-secondary shadow-lg'
                    : 'border-secondary bg-secondary hover:bg-secondary-light hover:shadow-md'
                }`}
              >
                {isSelected && (
                  <Check className="w-5 h-5 text-white mb-2" />
                )}
                <p className="font-montserrat font-black text-white text-sm uppercase tracking-[0.12em] leading-tight px-3">
                  {bg.name}
                </p>
              </button>
            );
          }

          if (bg.id === 'custom') {
            return (
              <button
                key={bg.id}
                onClick={() => selectBackground(bg.id)}
                className={`rounded-2xl border-2 text-center transition-all focus:outline-none overflow-hidden flex flex-col animate-wiggle-slow ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary shadow-lg'
                    : 'border-primary-lighter bg-white hover:border-primary'
                }`}
              >
                <div className="relative h-24 w-full flex items-center justify-center bg-gradient-to-br from-primary-lighter via-white to-primary-light flex-shrink-0">
                  <Sparkles className="w-9 h-9 text-primary select-none" style={{ filter: 'drop-shadow(0 0 6px rgba(255,158,197,0.8))' }} />
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check className="w-6 h-6 text-white drop-shadow" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-black text-secondary leading-tight uppercase tracking-tight">
                    {bg.name}
                  </p>
                  <p className="text-xs text-primary mt-1 font-bold">+{fmt(bg.price ?? priceMap.background_custom ?? 15)}</p>
                </div>
              </button>
            );
          }

          return (
            <button
              key={bg.id}
              onClick={() => selectBackground(bg.id)}
              className={`rounded-2xl border-2 text-center transition-all focus:outline-none overflow-hidden flex flex-col ${
                isSelected
                  ? 'border-primary ring-2 ring-primary shadow-lg'
                  : 'border-primary-lighter bg-white hover:border-primary hover:shadow-md'
              }`}
            >
              <div className="relative w-full h-24 flex-shrink-0">
                <Image
                  src={bg.url}
                  alt={bg.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-white drop-shadow" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-bold text-secondary leading-tight">{bg.name}</p>
                <p className="text-xs text-primary mt-1 font-bold">+{fmt(bg.price ?? priceMap.background_standard ?? 15)}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
