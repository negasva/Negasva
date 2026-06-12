'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Lock, ShieldCheck } from 'lucide-react';
import Logo from '@/components/Logo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useCurrency } from '@/lib/currency/CurrencyContext';
import { cachedFetchJson, TTL } from '@/lib/cache/clientCache';
import CurrencySwitcher from '@/components/CurrencySwitcher';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const FALLBACK_STYLES = [
  { id: 'rick-morty',    name: 'Rick & Morty'          },
  { id: 'gravity-falls', name: 'Gravity Falls'          },
  { id: 'simpsons',      name: 'Los Simpsons'           },
  { id: 'fairly-odd',    name: 'Los Padrinos Magicos'   },
  { id: 'negasva',       name: 'Estilo NEGASVA'         },
];

// Fallback backgrounds if API is unavailable
const FALLBACK_BACKGROUNDS: Record<string, { id: string; url: string; name: string; price?: number }[]> = {
  'rick-morty': [
    { id: 'rm-1', url: '/backgrounds/rm-1.jpg', name: 'Portal' },
    { id: 'rm-3', url: '/backgrounds/rm-3.jpg', name: 'Garage' },
    { id: 'rm-4', url: '/backgrounds/rm-4.jpg', name: 'Espacio' },
    { id: 'rm-5', url: '/backgrounds/rm-5.jpg', name: 'Planeta C-137' },
    { id: 'rm-6', url: '/backgrounds/rm-6.jpg', name: 'Nave espacial' },
    { id: 'rm-10', url: '/backgrounds/rm-10.jpg', name: 'Dimensión' },
  ],
  'gravity-falls': [
    { id: 'gf-1', url: '/backgrounds/gf-1.jpg', name: 'Bosque' },
    { id: 'gf-2', url: '/backgrounds/gf-2.jpg', name: 'Cabaña' },
    { id: 'gf-3', url: '/backgrounds/gf-3.jpg', name: 'Pueblo' },
    { id: 'gf-4', url: '/backgrounds/gf-4.jpg', name: 'Lago' },
    { id: 'gf-5', url: '/backgrounds/gf-5.jpg', name: 'Cueva' },
    { id: 'gf-8', url: '/backgrounds/gf-8.jpg', name: 'Noche' },
    { id: 'gf-9', url: '/backgrounds/gf-9.jpg', name: 'Misterio' },
  ],
  'simpsons': [
    { id: 'sp-1', url: '/backgrounds/sp-1.jpg', name: 'Springfield' },
    { id: 'sp-2', url: '/backgrounds/sp-2.jpg', name: 'Casa' },
    { id: 'sp-3', url: '/backgrounds/sp-3.jpg', name: "Bar de Moe" },
    { id: 'sp-4', url: '/backgrounds/sp-4.jpg', name: 'Nuclear' },
    { id: 'sp-5', url: '/backgrounds/sp-5.jpg', name: 'Escuela' },
    { id: 'sp-6', url: '/backgrounds/sp-6.jpg', name: 'Calle' },
    { id: 'sp-10', url: '/backgrounds/sp-10.jpg', name: 'Noche Springfield' },
  ],
  'fairly-odd': [
    { id: 'fo-1', url: '/backgrounds/fo-1.jpg', name: 'Dimmsdale' },
    { id: 'fo-2', url: '/backgrounds/fo-2.jpg', name: 'Casa Turner' },
    { id: 'fo-3', url: '/backgrounds/fo-3.jpg', name: 'Hada World' },
    { id: 'fo-5', url: '/backgrounds/fo-5.jpg', name: 'Escuela' },
    { id: 'fo-10', url: '/backgrounds/fo-10.jpg', name: 'Cosmos' },
  ],
  'negasva': [],
  'custom': [],
};

interface BgItem { id: string; url: string; name: string; price?: number; }

export default function StudioPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { fmt, currency, rates } = useCurrency();
  const STEPS = t.studio.steps as unknown as string[];

  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState({
    style: '',
    bodyType: '',
    background: '',
    peopleCount: 1,
    specialRequests: '',
    photos: [] as File[],
    express: false,
  });
  const [dynamicBgs, setDynamicBgs] = useState<Record<string, BgItem[]>>({});
  const [styles, setStyles] = useState<{ id: string; name: string }[]>(FALLBACK_STYLES);

  useEffect(() => {
    cachedFetchJson<Array<{ slug: string; name: string }>>('/api/styles', { ttlMs: TTL.catalog })
      .then((data) => {
        if (data && data.length > 0) {
          setStyles(data.map(s => ({ id: s.slug, name: s.name })));
        }
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (!selected.style || selected.style === 'negasva' || selected.style === 'custom') return;
    cachedFetchJson<Array<{ id: string; name: string; image_url: string }>>(
      `/api/backgrounds?style=${selected.style}`,
      { ttlMs: TTL.catalog },
    )
      .then((data) => {
        if (data && data.length > 0) {
          setDynamicBgs(prev => ({
            ...prev,
            [selected.style]: data.map(b => ({ id: b.id, url: b.image_url, name: b.name })),
          }));
        }
      })
      .catch(() => null);
  }, [selected.style]);

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutParams, setCheckoutParams] = useState<Record<string, unknown> | null>(null);

  const canAdvance = () => {
    if (step === 1) return !!selected.style;
    if (step === 2) return !!selected.bodyType;
    if (step === 3) return !!selected.background;
    if (step === 4) return true;
    if (step === 5) return selected.photos.length >= selected.peopleCount;
    return true;
  };

  const nextStep = async () => {
    if (step < 5) { setStep(step + 1); return; }

    const params = {
      style: selected.style,
      bodyType: selected.bodyType,
      background: selected.background,
      peopleCount: selected.peopleCount,
      express: selected.express,
      specialRequests: selected.specialRequests,
      currency: currency.toLowerCase(),
      rate: rates[currency] ?? 1,
    };

    // COP: Wompi redirect (unchanged)
    if (currency === 'COP') {
      setCheckoutLoading(true);
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          alert('Error al iniciar el pago. Intenta de nuevo.');
          setCheckoutLoading(false);
        }
      } catch {
        alert('Error de red. Intenta de nuevo.');
        setCheckoutLoading(false);
      }
      return;
    }

    // Stripe: embedded checkout (step 6)
    setCheckoutParams(params);
    setStep(6);
  };

  const fetchClientSecret = useCallback(async () => {
    if (!checkoutParams) return '';
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutParams),
    });
    const data = await res.json();
    return data.client_secret ?? '';
  }, [checkoutParams]);

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const familyDiscount = (count: number) => {
    if (count >= 5) return 0.25;
    if (count >= 3) return 0.15;
    return 0;
  };

  const priceBreakdown = () => {
    const perPerson = selected.bodyType === 'full_body' ? 29.99 : 25;
    const peopleSubtotal = selected.peopleCount * perPerson;
    const discountRate = familyDiscount(selected.peopleCount);
    const discount = peopleSubtotal * discountRate;
    const peopleAfterDiscount = peopleSubtotal - discount;
    const bgCost = selected.background === 'custom' ? 25 : selected.background && selected.background !== 'none' ? 15 : 0;
    const subtotal = peopleAfterDiscount + bgCost;
    const expressSurcharge = selected.express ? subtotal * 0.30 : 0;
    return {
      perPerson,
      peopleSubtotal,
      discountRate,
      discount,
      bgCost,
      subtotal,
      expressSurcharge,
      total: subtotal + expressSurcharge,
    };
  };

  const totalPrice = () => priceBreakdown().total;

  const getBgName = (id: string) =>
    (t.studio.backgrounds as Record<string, string>)[id] ?? id;

  const getStyleBgs = (): BgItem[] => {
    const fromApi = dynamicBgs[selected.style];
    const fallback = FALLBACK_BACKGROUNDS[selected.style] ?? [];
    const base = fromApi && fromApi.length > 0 ? fromApi : fallback;
    return [
      ...base,
      { id: 'custom', url: '', name: getBgName('custom'), price: 25 },
      { id: 'none', url: '', name: getBgName('none') },
    ];
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelected({ ...selected, photos: files });
  };

  // Order summary sidebar — shown from step 2 onward
  const OrderSummary = () => {
    const b = priceBreakdown();
    const styleName = styles.find(s => s.id === selected.style)?.name;
    const hasAnyContent = !!selected.style;
    if (!hasAnyContent) return null;

    return (
      <div className="rounded-2xl bg-primary-lighter border-2 border-primary p-5 sticky top-24 space-y-3 text-sm">
        <p className="font-black text-secondary text-base tracking-tighter">{t.studio.summary.title}</p>
        <div className="space-y-2">
          {selected.style && (
            <div className="flex justify-between">
              <span className="text-secondary-lighter">{t.studio.summary.style}</span>
              <span className="font-bold text-secondary">{styleName}</span>
            </div>
          )}
          {selected.bodyType && (
            <div className="flex justify-between">
              <span className="text-secondary-lighter">{t.studio.summary.type}</span>
              <span className="font-bold text-secondary">
                {selected.bodyType === 'full_body' ? t.studio.summary.full_body : t.studio.summary.torso}
              </span>
            </div>
          )}
          {selected.bodyType && (
            <>
              <div className="flex justify-between">
                <span className="text-secondary-lighter">
                  {selected.peopleCount} {t.studio.summary.people_count} × {fmt(b.perPerson)}
                </span>
                <span className={`font-bold ${b.discountRate > 0 ? 'line-through text-secondary-lighter' : 'text-secondary'}`}>
                  {fmt(b.peopleSubtotal)}
                </span>
              </div>
              {b.discountRate > 0 && (
                <div className="flex justify-between bg-white rounded-xl px-3 py-1.5">
                  <span className="text-primary font-bold">−{Math.round(b.discountRate * 100)}%</span>
                  <span className="font-bold text-primary">−{fmt(b.discount)}</span>
                </div>
              )}
            </>
          )}
          {selected.background && selected.background !== 'none' && (
            <div className="flex justify-between">
              <span className="text-secondary-lighter">{t.studio.summary.background}</span>
              <span className="font-bold text-secondary">+{fmt(b.bgCost)}</span>
            </div>
          )}
          {selected.background && selected.background !== 'none' && (
            <div className="flex justify-between text-xs text-secondary-lighter pl-2">
              <span>{getStyleBgs().find(b => b.id === selected.background)?.name ?? getBgName(selected.background)}</span>
            </div>
          )}
          {selected.express && (
            <div className="flex justify-between">
              <span className="text-secondary-lighter">{t.studio.summary.express}</span>
              <span className="font-bold text-secondary">+{fmt(b.expressSurcharge)}</span>
            </div>
          )}
        </div>
        {selected.bodyType && (
          <div className="flex justify-between border-t-2 border-primary pt-3 font-black text-lg">
            <span className="text-secondary">{t.studio.summary.total}</span>
            <span className="text-primary">{fmt(totalPrice())}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-white border-b border-primary-lighter sticky top-0 z-[60] w-full">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Logo href="/" size="md" />
          <div className="flex items-center gap-4">
            <CurrencySwitcher />
            <LanguageSwitcher />
            {selected.bodyType && (
              <span className="text-sm font-bold text-white bg-primary px-4 py-2 rounded-full">
                Total: {fmt(totalPrice())}
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Progress (hidden on payment step) */}
      <div className={`bg-white border-b-2 border-primary-lighter w-full overflow-x-hidden ${step === 6 ? 'hidden' : ''}`}>
        <div className="mx-auto max-w-6xl px-4 py-4 flex justify-center">
          <div className="flex items-center gap-1 sm:gap-3">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center">
                <button
                  onClick={() => i + 1 <= step && setStep(i + 1)}
                  disabled={i + 1 > step}
                  className="flex flex-col items-center focus:outline-none disabled:cursor-not-allowed group"
                >
                  <div className={`flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all ${
                    i + 1 < step ? 'bg-primary text-white group-hover:bg-primary-dark cursor-pointer' :
                    i + 1 === step ? 'bg-primary text-white ring-4 ring-primary-lighter' :
                    'bg-primary-lighter text-secondary'
                  }`}>
                    {i + 1 < step ? '✓' : i + 1}
                  </div>
                  <span className={`mt-1 text-xs hidden sm:block font-bold ${i + 1 === step ? 'text-primary' : 'text-secondary-lighter'}`}>
                    {label}
                  </span>
                </button>
                {i < 4 && (
                  <div className={`w-4 sm:w-10 h-1 mx-1 sm:mx-2 ${i + 1 < step ? 'bg-primary' : 'bg-primary-lighter'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 w-full overflow-x-hidden">
        <div className={`${step > 1 && step < 6 ? 'lg:grid lg:grid-cols-3 lg:gap-8' : ''}`}>
          {/* Main step content */}
          <div className={step > 1 && step < 6 ? 'lg:col-span-2' : ''}>

            {/* PASO 1: Estilo */}
            {step === 1 && (
              <div>
                <div className="text-center mb-10">
                  <h1 className="font-black text-4xl text-secondary mb-3 tracking-tighter">{t.studio.step1.title}</h1>
                  <p className="text-lg text-secondary-lighter">{t.studio.step1.subtitle}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {styles.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelected({ ...selected, style: s.id, background: '' });
                        setTimeout(() => setStep(2), 300);
                      }}
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
            )}

            {/* PASO 2: Cuerpo + Personas */}
            {step === 2 && (
              <div>
                <div className="text-center mb-10">
                  <h1 className="font-black text-4xl text-secondary mb-3 tracking-tighter">{t.studio.step2.title}</h1>
                  <p className="text-lg text-secondary-lighter">{t.studio.step2.subtitle}</p>
                </div>

                {/* Body Type selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
                  {[
                    {
                      id: 'torso_only',
                      name: t.studio.body_types.torso_name,
                      desc: t.studio.body_types.torso_desc,
                      price: 25,
                      original: null as null,
                      bestValue: false,
                    },
                    {
                      id: 'full_body',
                      name: t.studio.body_types.full_name,
                      desc: t.studio.body_types.full_desc,
                      price: 29.99,
                      original: 39.99,
                      bestValue: true,
                    },
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelected({ ...selected, bodyType: b.id })}
                      className={`rounded-2xl border-2 p-6 text-center transition-all focus:outline-none relative ${
                        b.bestValue
                          ? selected.bodyType === b.id
                            ? 'border-primary bg-gradient-to-br from-primary-lighter via-white to-primary-light ring-4 ring-primary shadow-2xl shadow-primary/50 animate-wiggle-slow'
                            : 'border-primary bg-gradient-to-br from-primary-lighter via-white to-primary-light shadow-xl shadow-primary/40 hover:shadow-2xl hover:shadow-primary/60 animate-wiggle-slow'
                          : selected.bodyType === b.id
                            ? 'border-primary bg-primary-lighter ring-2 ring-primary shadow-xl'
                            : 'border-primary-lighter bg-white hover:border-primary hover:shadow-lg'
                      }`}
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
                  ))}
                </div>

                {/* Personas counter */}
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-black text-2xl text-secondary tracking-tighter">{t.studio.step2.people_title}</h2>
                      <p className="text-secondary-lighter text-sm mt-1">
                        {t.studio.step2.people_subtitle.replace('4', '8')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-primary-lighter rounded-2xl px-4 py-2">
                      <button
                        onClick={() => selected.peopleCount > 1 && setSelected({ ...selected, peopleCount: selected.peopleCount - 1 })}
                        disabled={selected.peopleCount <= 1}
                        className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all disabled:opacity-30"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-black text-xl text-secondary w-6 text-center">{selected.peopleCount}</span>
                      <button
                        onClick={() => selected.peopleCount < 8 && setSelected({ ...selected, peopleCount: selected.peopleCount + 1 })}
                        disabled={selected.peopleCount >= 8}
                        className="w-8 h-8 rounded-full bg-primary text-white shadow flex items-center justify-center hover:bg-primary-dark transition-all disabled:opacity-30 disabled:bg-primary-lighter disabled:text-secondary"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Dynamic price breakdown */}
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
                          <div className="flex justify-between items-center bg-white rounded-xl px-3 py-2">
                            <span className="font-bold text-primary text-sm">
                              Pack familia −{Math.round(b.discountRate * 100)}%
                            </span>
                            <span className="font-black text-xl text-primary">{fmt(b.peopleSubtotal - b.discount)}</span>
                          </div>
                        )}
                        {nextTierAt && (
                          <div className="mt-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl px-4 py-3 flex items-center justify-center gap-2 shadow-lg shadow-primary/40 animate-pulse-slow">
                            <span className="text-xl">🔥</span>
                            <p className="font-black text-sm sm:text-base text-center tracking-tight">
                              {t.studio.step2.next_tier
                                .replace('{n}', String(nextTierAt - selected.peopleCount))
                                .replace('{pct}', String(nextRate))}
                            </p>
                            <span className="text-xl">🔥</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* PASO 3: Fondo */}
            {step === 3 && (
              <div>
                <div className="text-center mb-10">
                  <h1 className="font-black text-4xl text-secondary mb-3 tracking-tighter">{t.studio.step3.title}</h1>
                  <p className="text-lg text-secondary-lighter">{t.studio.step3.subtitle}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {getStyleBgs().map((bg) => {
                    const isSelected = selected.background === bg.id;

                    if (bg.id === 'none') {
                      return (
                        <button
                          key={bg.id}
                          onClick={() => setSelected({ ...selected, background: bg.id })}
                          className={`rounded-2xl border-2 text-center transition-all focus:outline-none overflow-hidden flex flex-col items-center justify-center min-h-[152px] ${
                            isSelected
                              ? 'border-secondary bg-secondary-light ring-2 ring-secondary shadow-lg'
                              : 'border-secondary bg-secondary hover:bg-secondary-light hover:shadow-md'
                          }`}
                        >
                          {isSelected && (
                            <span className="block text-white text-base font-black mb-2 tracking-widest">✓</span>
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
                          onClick={() => setSelected({ ...selected, background: bg.id })}
                          className={`rounded-2xl border-2 text-center transition-all focus:outline-none overflow-hidden flex flex-col animate-wiggle-slow ${
                            isSelected
                              ? 'border-primary ring-2 ring-primary shadow-lg'
                              : 'border-primary-lighter bg-white hover:border-primary'
                          }`}
                        >
                          <div className="relative h-24 w-full flex items-center justify-center bg-gradient-to-br from-primary-lighter via-white to-primary-light flex-shrink-0">
                            <span className="text-4xl select-none" style={{ filter: 'drop-shadow(0 0 6px rgba(255,158,197,0.8))' }}>✦</span>
                            {isSelected && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <span className="text-white text-lg font-black drop-shadow">✓</span>
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="text-sm font-black text-secondary leading-tight uppercase tracking-tight">
                              {bg.name}
                            </p>
                            <p className="text-xs text-primary mt-1 font-bold">+{fmt(bg.price ?? 25)}</p>
                          </div>
                        </button>
                      );
                    }

                    return (
                      <button
                        key={bg.id}
                        onClick={() => setSelected({ ...selected, background: bg.id })}
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
                              <span className="text-white text-lg font-bold drop-shadow">✓</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-bold text-secondary leading-tight">{bg.name}</p>
                          <p className="text-xs text-primary mt-1 font-bold">+{fmt(bg.price ?? 15)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PASO 4: Detalles */}
            {step === 4 && (
              <div>
                <div className="text-center mb-10">
                  <h1 className="font-black text-4xl text-secondary mb-3 tracking-tighter">{t.studio.step4.title}</h1>
                  <p className="text-lg text-secondary-lighter">{t.studio.step4.subtitle}</p>
                </div>
                <div className="max-w-2xl mx-auto">
                  <label className="block font-bold text-secondary mb-3">
                    {t.studio.step4.notes_label} <span className="font-normal text-secondary-lighter">{t.studio.step4.notes_optional}</span>
                  </label>
                  <textarea
                    value={selected.specialRequests}
                    onChange={(e) => setSelected({ ...selected, specialRequests: e.target.value })}
                    placeholder={t.studio.step4.notes_placeholder}
                    rows={6}
                    maxLength={500}
                    className="w-full rounded-lg border-2 border-primary-lighter px-4 py-3 text-sm text-secondary focus:border-primary focus:outline-none resize-none"
                  />
                  <p className="text-right text-xs text-secondary-lighter mt-2">{selected.specialRequests.length}/500</p>

                  {/* Express 24h */}
                  <button
                    type="button"
                    onClick={() => setSelected({ ...selected, express: !selected.express })}
                    className={`mt-6 w-full rounded-2xl border-2 p-5 text-left transition-all ${
                      selected.express
                        ? 'border-primary bg-primary-lighter ring-2 ring-primary'
                        : 'border-primary-lighter bg-white hover:border-primary'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${selected.express ? 'bg-primary border-primary text-white' : 'border-secondary-lighter'}`}>
                        {selected.express && '✓'}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-secondary text-lg tracking-tighter">{t.studio.step4.express_title}</p>
                        <p className="text-sm text-secondary-lighter mt-1">{t.studio.step4.express_desc}</p>
                      </div>
                      <span className="font-black text-secondary text-xl whitespace-nowrap">{t.studio.step4.express_surcharge}</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* PASO 5: Fotos */}
            {step === 5 && (
              <div>
                <div className="text-center mb-10">
                  <h1 className="font-black text-4xl text-secondary mb-3 tracking-tighter">{t.studio.step5.title}</h1>
                  <p className="text-lg text-secondary-lighter">{t.studio.step5.subtitle}</p>
                </div>
                <div className="max-w-2xl mx-auto">
                  <div className="rounded-2xl border-2 border-dashed border-primary-lighter bg-white p-12 text-center hover:border-primary hover:bg-primary-lighter transition-all cursor-pointer">
                    <p className="font-bold text-secondary mb-2">{t.studio.step5.drag}</p>
                    <p className="text-secondary-lighter mb-6">{t.studio.step5.or}</p>
                    <label className="inline-block cursor-pointer rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark transition-colors">
                      {t.studio.step5.select_btn}
                      <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                    {selected.photos.length > 0 && (
                      <div className="mt-6 text-sm text-primary font-bold">
                        {selected.photos.length} {selected.photos.length > 1 ? t.studio.step5.selected_plural : t.studio.step5.selected}
                      </div>
                    )}
                    <p className="mt-6 text-xs text-secondary-lighter">
                      {t.studio.step5.max_size} · {selected.peopleCount} {selected.peopleCount > 1 ? t.studio.step5.required_photos_plural : t.studio.step5.required_photos}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 6: Embedded Checkout */}
            {step === 6 && checkoutParams && (
              <div>
                <div className="text-center mb-8">
                  <h1 className="font-black text-3xl text-secondary mb-2 tracking-tighter">Pago seguro</h1>
                  <div className="flex items-center justify-center gap-4 text-xs text-secondary-lighter flex-wrap">
                    <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-primary" /> Cifrado SSL 256-bit</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-primary" /> Procesado por Stripe</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-primary" /> Nunca guardamos tu tarjeta</span>
                  </div>
                </div>
                <div className="max-w-xl mx-auto bg-white rounded-2xl border-2 border-primary-lighter shadow-lg overflow-hidden">
                  <div className="bg-primary-lighter px-6 py-4 flex items-center justify-between">
                    <span className="font-black text-secondary text-sm">Total: {fmt(totalPrice())}</span>
                    <div className="flex items-center gap-2 text-xs text-secondary-lighter">
                      <Lock className="w-3 h-3" />
                      <span>Pago seguro</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <button onClick={() => setStep(5)} className="text-secondary-lighter hover:text-primary text-sm font-bold transition-colors">
                    Volver al paso anterior
                  </button>
                </div>
              </div>
            )}

            {/* Navigation (steps 1–5 only) */}
            {step < 6 && (
              <>
                <div className="flex justify-between items-center mt-14">
                  <button
                    onClick={prevStep}
                    className="text-secondary-lighter hover:text-primary text-sm font-bold px-6 py-3 rounded-lg hover:bg-primary-lighter transition-colors"
                  >
                    {step === 1 ? <Link href="/">{t.studio.nav.back_home}</Link> : t.studio.nav.prev}
                  </button>
                  {step > 1 && (
                    <button
                      onClick={nextStep}
                      disabled={!canAdvance() || checkoutLoading}
                      className={`rounded-lg px-10 py-3 font-bold text-white transition-all flex items-center gap-2 ${
                        canAdvance() && !checkoutLoading
                          ? 'bg-primary hover:bg-primary-dark shadow-lg hover:shadow-xl'
                          : 'bg-secondary-lighter text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {checkoutLoading && (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      {step === 5 ? t.studio.nav.checkout : t.studio.nav.next}
                    </button>
                  )}
                </div>

                <p className="text-center text-xs text-secondary-lighter mt-8">
                  {t.studio.nav.secure}
                </p>
              </>
            )}
          </div>

          {/* Sidebar: Order Summary */}
          {step > 1 && step < 6 && (
            <div className="hidden lg:block">
              <OrderSummary />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
