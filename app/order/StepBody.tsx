'use client';

import { useEffect, useState } from 'react';
import { Minus, Plus, Flame } from 'lucide-react';
import type { CheckoutController } from './useCheckout';

/** Step 2 — body type + number of people. */
export default function StepBody({ c }: { c: CheckoutController }) {
  const {
    t, fmt, bodyTypes, selected, priceBreakdown,
    errorRing, errorShake, onShakeEnd,
    selectBodyType, decPeople, incPeople,
  } = c;

  // Recordatorio del descuento por cantidad: mientras todavía no se ha
  // desbloqueado ningún descuento (1–2 personas), mostramos un pop-up
  // informativo y animado para que el cliente vea que el descuento existe.
  // Una vez aplicado el descuento ya no hay pop-up: la información aparece de
  // forma permanente debajo del contador de personas.
  const FIRST_TIER_AT = 3;
  const FIRST_TIER_PCT = 15;
  const reminderActive = !!selected.bodyType && selected.peopleCount < FIRST_TIER_AT;
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    if (!reminderActive) { setPopupOpen(false); setPopupVisible(false); return; }
    setPopupOpen(true);
    setPopupVisible(false);
    const enter = setTimeout(() => setPopupVisible(true), 30);
    const leave = setTimeout(() => setPopupVisible(false), 3700);
    const done = setTimeout(() => setPopupOpen(false), 4100);
    return () => { clearTimeout(enter); clearTimeout(leave); clearTimeout(done); };
  }, [reminderActive, selected.peopleCount]);

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="font-black text-4xl text-secondary mb-3 tracking-tighter">{t.studio.step2.title}</h2>
        <p className="text-lg text-secondary-lighter">{t.studio.step2.subtitle}</p>
      </div>

      {/* Body Type selector */}
      <div id="required-field" onAnimationEnd={onShakeEnd} className={`grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10 ${errorRing} ${errorShake}`}>
        {bodyTypes.map((bt) => ({
          id: bt.slug,
          // The two default slugs keep their translated copy; admin-created
          // body types use the DB name/description directly.
          name: bt.slug === 'torso_only' ? t.studio.body_types.torso_name
              : bt.slug === 'full_body' ? t.studio.body_types.full_name
              : bt.name,
          desc: bt.slug === 'torso_only' ? t.studio.body_types.torso_desc
              : bt.slug === 'full_body' ? t.studio.body_types.full_desc
              : (bt.description ?? ''),
          price: bt.price_usd,
          original: bt.original_price_usd,
          bestValue: bt.is_best_value,
        })).map((b) => (
          <div
            key={b.id}
            className={`rounded-2xl border-2 p-6 text-center transition-all relative ${
              b.bestValue
                ? selected.bodyType === b.id
                  ? 'border-primary bg-gradient-to-br from-primary-lighter via-white to-primary-light ring-4 ring-primary shadow-2xl shadow-primary/50 animate-wiggle-slow'
                  : 'border-primary bg-gradient-to-br from-primary-lighter via-white to-primary-light shadow-xl shadow-primary/40 hover:shadow-2xl hover:shadow-primary/60 animate-wiggle-slow'
                : selected.bodyType === b.id
                  ? 'border-primary bg-primary-lighter ring-2 ring-primary shadow-xl'
                  : 'border-primary-lighter bg-white hover:border-primary hover:shadow-lg'
            }`}
          >
            <button
              type="button"
              onClick={() => selectBodyType(b.id)}
              className="block w-full text-center focus:outline-none"
            >
              {b.bestValue && (
                <div className="inline-flex items-center gap-1 bg-primary text-white px-3 py-1 rounded-full text-xs font-black mb-3 shadow-lg ring-2 ring-primary-light">
                  {t.studio.body_types.best_value}
                </div>
              )}
              {selected.bodyType === b.id && (
                <span className="block text-primary font-bold text-xs mb-2">{t.studio.body_types.selected}</span>
              )}
              <p className="font-black text-xl sm:text-2xl text-secondary mb-2 tracking-tighter">{b.name}</p>
              <p className="text-secondary-lighter text-sm mb-4">{b.desc}</p>
              {b.original && (
                <p className="text-xs text-secondary-lighter line-through mb-1">{fmt(b.original)}</p>
              )}
              <div className={`bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl px-2 py-3 font-black text-base sm:text-lg whitespace-nowrap ${b.bestValue ? 'shadow-lg shadow-primary/40' : ''}`}>
                <span className="block leading-tight">{fmt(b.price)}{t.studio.body_types.per_person}</span>
              </div>
            </button>

            {/* Contador de personas: dentro de la tarjeta seleccionada. */}
            {selected.bodyType === b.id && (
              <div className="mt-5 pt-4 border-t-2 border-primary/30">
                <p className="text-xs font-black text-secondary-lighter uppercase tracking-wide mb-2">
                  {t.studio.step2.people_title}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={decPeople}
                    disabled={selected.peopleCount <= 1}
                    aria-label="Quitar persona"
                    className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-black text-2xl text-secondary w-9 text-center tabular-nums">{selected.peopleCount}</span>
                  <button
                    type="button"
                    onClick={incPeople}
                    disabled={selected.peopleCount >= 8}
                    aria-label="Anadir persona"
                    className="w-9 h-9 rounded-full bg-primary text-white shadow flex items-center justify-center hover:bg-primary-dark transition-all disabled:opacity-30 disabled:bg-primary-lighter disabled:text-secondary"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-secondary-lighter mt-2">
                  {t.studio.step2.people_subtitle.replace('4', '8')}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pop-up recordatorio: avisa de que existe un descuento por cantidad */}
      {popupOpen && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] w-[90%] max-w-sm px-2 pointer-events-none">
          <div
            className={`flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-dark px-5 py-4 text-center text-white shadow-2xl shadow-primary/50 ring-2 ring-primary-light transition-all duration-300 ease-out ${
              popupVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 -translate-y-2'
            }`}
          >
            <Flame className="w-6 h-6 shrink-0" />
            <p className="font-black text-sm sm:text-base tracking-tight">
              {t.studio.step2.next_tier
                .replace('{n}', String(FIRST_TIER_AT - selected.peopleCount))
                .replace('{pct}', String(FIRST_TIER_PCT))}
            </p>
            <Flame className="w-6 h-6 shrink-0" />
          </div>
        </div>
      )}

      {/* Dynamic price breakdown */}
      <div className="max-w-2xl mx-auto">
        {selected.bodyType && (() => {
          const b = priceBreakdown();
          const nextTierAt = selected.peopleCount < 3 ? 3 : selected.peopleCount < 5 ? 5 : null;
          const nextRate = selected.peopleCount < 3 ? 15 : 25;
          return (
            <div className="mt-4 bg-primary-lighter rounded-2xl p-5 border-2 border-primary space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-secondary">
                  {selected.peopleCount} × {fmt(b.perPerson)}
                </span>
                <span className={`font-black text-xl ${b.discountRate ? 'text-secondary-lighter line-through text-base' : 'text-primary'}`}>
                  {fmt(b.peopleSubtotal)}
                </span>
              </div>
              {b.discountRate > 0 && (
                <div className="flex justify-between items-center bg-white rounded-xl px-3 py-2 animate-pop-in">
                  <span className="font-bold text-primary text-sm">
                    Pack familia −{Math.round(b.discountRate * 100)}%
                  </span>
                  <span className="font-black text-xl text-primary">{fmt(b.peopleSubtotal - b.discount)}</span>
                </div>
              )}
              {nextTierAt && (
                <div className="mt-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl px-4 py-3 flex items-center justify-center gap-2 shadow-lg shadow-primary/40 animate-pulse-slow">
                  <Flame className="w-5 h-5 shrink-0" />
                  <p className="font-black text-sm sm:text-base text-center tracking-tight">
                    {t.studio.step2.next_tier
                      .replace('{n}', String(nextTierAt - selected.peopleCount))
                      .replace('{pct}', String(nextRate))}
                  </p>
                  <Flame className="w-5 h-5 shrink-0" />
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
