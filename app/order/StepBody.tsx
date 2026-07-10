'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Minus, Plus, Flame, ImageIcon, Hand } from 'lucide-react';
import { cachedFetchJSON } from '@/lib/cache/clientCache';
import type { SiteImages } from '@/lib/siteImages';
import FitText from '@/components/FitText';
import { MAX_PEOPLE, nextFamilyTier } from '@/lib/pricing/calc';
import type { CheckoutController } from './useCheckout';

// Imagen de ejemplo por tipo de cuerpo. Los archivos van en
// /public/body-types/<slug>.webp; mientras no existan se muestra un
// placeholder rosa con icono (las imágenes reales se suben desde
// /admin/imagenes → Pedido → Tipo de cuerpo, clave order_body_<slug>).
const BODY_TYPE_IMAGES: Record<string, string> = {
  torso_only: '/body-types/torso_only.webp',
  full_body: '/body-types/full_body.webp',
};

const GLOW = '0 0 30px 4px rgba(252,144,182,0.55)';
// Sombra sutil en los bordes internos: divide los paneles sin romper la
// continuidad del dibujo.
// Borde 1px sutil (inset ring) para separar el panel del fondo blanco sin
// romper el glow (que reemplaza el boxShadow) ni el estado seleccionado.
const PANEL_BORDER = 'inset 0 0 0 1px rgba(0,0,0,0.08)';
const EDGE_SHADE = `${PANEL_BORDER}, inset 9px 0 12px -9px rgba(0,0,0,0.14), inset -9px 0 12px -9px rgba(0,0,0,0.14)`;
// Variante vertical (móvil): los paneles se apilan, así que la sombra divide
// por los bordes horizontales (arriba/abajo).
const EDGE_SHADE_V = `${PANEL_BORDER}, inset 0 9px 12px -9px rgba(0,0,0,0.14), inset 0 -9px 12px -9px rgba(0,0,0,0.14)`;

/** Step 2 — body type + number of people. */
export default function StepBody({ c }: { c: CheckoutController }) {
  const {
    t, fmt, bodyTypes, selected, priceBreakdown,
    errorRing, errorShake, onShakeEnd,
    selectBodyType, decPeople, incPeople,
  } = c;

  // Overrides de imagen editables desde /admin/imagenes (clave order_body_<slug>).
  // Se cachean en localStorage para que al recargar se pinten las imágenes de
  // inmediato (sin el flash de placeholder mientras llega el fetch).
  const [siteImages, setSiteImages] = useState<SiteImages>({});
  useEffect(() => {
    try {
      const cached = localStorage.getItem('site_images_cache');
      if (cached) setSiteImages(JSON.parse(cached));
    } catch { /* no-op */ }
    cachedFetchJSON<{ site_images?: SiteImages }>('/api/landing-config')
      .then((data) => {
        if (data?.site_images) {
          setSiteImages(data.site_images);
          try { localStorage.setItem('site_images_cache', JSON.stringify(data.site_images)); } catch { /* no-op */ }
        }
      })
      .catch(() => null);
  }, []);

  // Hover acumulativo (solo desktop): índice de la opción bajo el cursor.
  const [hovered, setHovered] = useState<number | null>(null);

  // Pista táctil (solo móvil): icono de "tap" que desaparece tras el primer
  // toque de la sesión.
  const [showTap, setShowTap] = useState(false);
  useEffect(() => {
    try { setShowTap(sessionStorage.getItem('body_tap_hint') !== 'done'); } catch { /* no-op */ }
  }, []);
  const dismissTap = () => {
    setShowTap(false);
    try { sessionStorage.setItem('body_tap_hint', 'done'); } catch { /* no-op */ }
  };

  // Opciones normalizadas (mismo mapeo de copy que el diseño anterior).
  const options = bodyTypes.map((bt) => ({
    id: bt.slug,
    name: bt.slug === 'torso_only' ? t.studio.body_types.torso_name
        : bt.slug === 'full_body' ? t.studio.body_types.full_name
        : bt.name,
    price: bt.price_usd,
    bestValue: bt.is_best_value,
  }));
  const lastIndex = options.length - 1;
  const selectedIndex = options.findIndex((o) => o.id === selected.bodyType);

  const imgSrc = (id: string) =>
    siteImages[`order_body_${id}`] || BODY_TYPE_IMAGES[id] || `/body-types/${id}.webp`;

  const ariaLabel = (name: string, price: number) =>
    `Select ${name} - ${fmt(price)}${t.studio.body_types.per_person}`;

  // Placeholder rosa con icono + texto (igual al sistema actual), con la
  // imagen real encima cuando existe.
  const Panel = ({ id, name }: { id: string; name: string }) => (
    <>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-primary-lighter/50 text-primary/60">
        <ImageIcon className="w-8 h-8" aria-hidden />
        <span className="text-xs font-black">{name}</span>
      </div>
      <Image
        key={imgSrc(id)}
        src={imgSrc(id)}
        alt={name}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 40vw, 340px"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
    </>
  );

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="font-black text-4xl text-secondary mb-3 tracking-tighter">{t.studio.step2.title}</h2>
        <p className="text-lg text-secondary-lighter">{t.studio.step2.subtitle}</p>
      </div>

      {/* ── DESKTOP: ilustración continua con hover acumulativo ────────────── */}
      {/* px-10 deja aire para que el glow del panel exterior no se recorte. */}
      <div
        id="required-field"
        onAnimationEnd={onShakeEnd}
        className={`hidden sm:grid gap-1 max-w-5xl mx-auto mb-8 px-10 ${errorRing} ${errorShake}`}
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((b, i) => {
          const dimmed = hovered !== null && i > hovered;
          const ringed = selectedIndex >= 0 && i <= selectedIndex;
          // Panel activo (elevado + glow): al pasar el cursor o al quedar
          // seleccionado. La selección lo mantiene sin necesidad del hover.
          const lit = (hovered !== null && i <= hovered) || ringed;
          return (
            <div key={b.id} className="flex flex-col">
              <p className="font-black text-xl text-secondary mb-3 tracking-tighter text-center">{b.name}</p>

              <div className="relative">
                {b.bestValue && (
                  <div className="absolute -top-2 -right-2 z-20 inline-flex items-center gap-1 bg-primary text-white px-3 py-1 rounded-full text-xs font-black shadow-lg ring-2 ring-primary-light">
                    {t.studio.body_types.best_value}
                  </div>
                )}
                {/* El panel sube en hover (translateY) sin escalar: la foto no
                    cambia de tamaño y los bordes nunca se solapan. */}
                <button
                  type="button"
                  onClick={() => selectBodyType(b.id)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  aria-label={ariaLabel(b.name, b.price)}
                  aria-pressed={selected.bodyType === b.id}
                  className={`relative block w-full aspect-square overflow-hidden transition-all duration-200 ease-out outline-none focus-visible:ring-4 focus-visible:ring-primary/60 ${
                    ringed ? 'ring-4 ring-primary z-10' : ''
                  } ${dimmed ? 'opacity-40' : 'opacity-100'} ${i === 0 ? 'rounded-l-xl' : ''} ${i === lastIndex ? 'rounded-r-xl' : ''}`}
                  style={{
                    transform: lit ? 'translateY(-10px)' : 'translateY(0)',
                    boxShadow: lit ? GLOW : EDGE_SHADE,
                    zIndex: lit ? 10 : undefined,
                  }}
                >
                  <Panel id={b.id} name={b.name} />
                </button>
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => selectBodyType(b.id)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  tabIndex={-1}
                  className={`block w-full bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl px-3 py-3 font-black text-base sm:text-lg ${b.bestValue ? 'shadow-lg shadow-primary/40' : ''}`}
                >
                  <FitText className="leading-tight">{fmt(b.price)}{t.studio.body_types.per_person}</FitText>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── MÓVIL: la misma ilustración continua del desktop, apilada en
          vertical (panel izq · nombre/precio der). Ring acumulativo y sombras
          de borde como en desktop, adaptadas a la orientación. */}
      <div
        onAnimationEnd={onShakeEnd}
        className={`sm:hidden max-w-2xl mx-auto mb-8 ${errorRing} ${errorShake}`}
      >
        {options.map((b, i) => {
          const ringed = selectedIndex >= 0 && i <= selectedIndex;
          return (
            <div key={b.id} className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => { dismissTap(); selectBodyType(b.id); }}
                aria-label={ariaLabel(b.name, b.price)}
                aria-pressed={selected.bodyType === b.id}
                className={`relative block w-36 aspect-square shrink-0 overflow-hidden outline-none focus-visible:ring-4 focus-visible:ring-primary/60 ${
                  ringed ? 'ring-4 ring-primary z-10' : ''
                } ${i === 0 ? 'rounded-t-xl' : ''} ${i === lastIndex ? 'rounded-b-xl' : ''} ${showTap ? 'animate-breathe-twice' : ''}`}
                style={{ boxShadow: ringed ? GLOW : EDGE_SHADE_V }}
              >
                <Panel id={b.id} name={b.name} />
                {showTap && (
                  <span className="absolute bottom-1 right-1 z-10 w-6 h-6 rounded-full bg-white/90 text-primary flex items-center justify-center shadow">
                    <Hand className="w-3.5 h-3.5" aria-hidden />
                  </span>
                )}
              </button>
              <div className="flex-1 min-w-0">
                {b.bestValue && (
                  <span className="inline-flex items-center gap-1 bg-primary text-white px-2.5 py-0.5 rounded-full text-[11px] font-black mb-1 shadow ring-1 ring-primary-light">
                    {t.studio.body_types.best_value}
                  </span>
                )}
                <p className="font-black text-lg text-secondary tracking-tighter leading-tight">{b.name}</p>
                <p className="font-black text-lg text-primary">{fmt(b.price)}{t.studio.body_types.per_person}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stepper de personas — visible al seleccionar un tipo de cuerpo. */}
      {selected.bodyType && (
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={decPeople}
              disabled={selected.peopleCount <= 1}
              aria-label={t.studio.step2.remove_person}
              className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all disabled:opacity-30"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-black text-2xl text-secondary w-8 text-center tabular-nums">{selected.peopleCount}</span>
            <button
              type="button"
              onClick={incPeople}
              disabled={selected.peopleCount >= MAX_PEOPLE}
              aria-label={t.studio.step2.add_person}
              className="w-9 h-9 rounded-full bg-primary text-white shadow flex items-center justify-center hover:bg-primary-dark transition-all disabled:opacity-30 disabled:bg-primary-lighter disabled:text-secondary"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-secondary-lighter mt-1 leading-tight">
            {t.studio.step2.people_subtitle}
          </p>
        </div>
      )}

      {/* Dynamic price breakdown — solo móvil/tablet; en lg el sidebar
          OrderSummary ya muestra lo mismo. */}
      <div className="max-w-2xl mx-auto lg:hidden">
        {selected.bodyType && (() => {
          const b = priceBreakdown();
          const nextTier = nextFamilyTier(selected.peopleCount);
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
              {nextTier && (
                <div className="mt-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl px-4 py-3 flex items-center justify-center gap-2 shadow-lg shadow-primary/40 animate-pulse-slow">
                  <Flame className="w-5 h-5 shrink-0" />
                  <p className="font-black text-sm sm:text-base text-center tracking-tight">
                    {t.studio.step2.next_tier
                      .replace('{n}', String(nextTier.at - selected.peopleCount))
                      .replace('{pct}', String(Math.round(nextTier.rate * 100)))}
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
