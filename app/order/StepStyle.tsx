'use client';

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
            className={`rounded-2xl border-2 p-8 text-center transition-all focus:outline-none ${
              selected.style === s.id
                ? 'border-primary bg-primary-lighter ring-2 ring-primary shadow-lg'
                : 'border-primary-lighter bg-white hover:border-primary hover:shadow-md'
            }`}
          >
            <p className="font-bold text-secondary">{s.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
