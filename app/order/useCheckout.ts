'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useCurrency } from '@/lib/currency/CurrencyContext';
import { cachedFetchJSON } from '@/lib/cache/clientCache';
import { getRecaptchaToken } from '@/lib/security/recaptchaClient';
import {
  FALLBACK_BODY_TYPES,
  FALLBACK_PRICES,
  type BodyTypeItem,
} from '@/lib/pricing/fallbacks';

export type { BodyTypeItem };

export interface BgItem {
  id: string;
  url: string;
  name: string;
  price?: number;
}

export interface AppliedCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  amount: number;
}

export interface CheckoutSelection {
  style: string;
  bodyType: string;
  background: string;
  peopleCount: number;
  specialRequests: string;
  photos: File[];
  express: boolean;
}

export interface PriceBreakdown {
  perPerson: number;
  peopleSubtotal: number;
  discountRate: number;
  discount: number;
  bgCost: number;
  subtotal: number;
  expressSurcharge: number;
  codeDiscount: number;
  preCodeTotal: number;
  total: number;
}

const ZERO_QUOTE: PriceBreakdown = {
  perPerson: 0, peopleSubtotal: 0, discountRate: 0, discount: 0, bgCost: 0,
  subtotal: 0, expressSurcharge: 0, codeDiscount: 0, preCodeTotal: 0, total: 0,
};

const FALLBACK_STYLES = [
  { id: 'rick-morty',    name: 'Cartoon sci-fi'         },
  { id: 'gravity-falls', name: 'Misterio del bosque'    },
  { id: 'simpsons',      name: 'Familia amarilla clasica' },
  { id: 'fairly-odd',    name: 'Fantasia brillante'     },
  { id: 'negasva',       name: 'Estilo NEGASVA'         },
];

// Fallback backgrounds if API is unavailable
const FALLBACK_BACKGROUNDS: Record<string, BgItem[]> = {
  'rick-morty': [
    { id: 'rm-1', url: '/backgrounds/rm-1.jpg', name: 'Portal' },
    { id: 'rm-3', url: '/backgrounds/rm-3.jpg', name: 'Garage' },
    { id: 'rm-4', url: '/backgrounds/rm-4.jpg', name: 'Espacio' },
    { id: 'rm-5', url: '/backgrounds/rm-5.jpg', name: 'Planeta alienigena' },
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
    { id: 'sp-1', url: '/backgrounds/sp-1.jpg', name: 'Ciudad familiar' },
    { id: 'sp-2', url: '/backgrounds/sp-2.jpg', name: 'Casa' },
    { id: 'sp-3', url: '/backgrounds/sp-3.jpg', name: 'Bar clasico' },
    { id: 'sp-4', url: '/backgrounds/sp-4.jpg', name: 'Nuclear' },
    { id: 'sp-5', url: '/backgrounds/sp-5.jpg', name: 'Escuela' },
    { id: 'sp-6', url: '/backgrounds/sp-6.jpg', name: 'Calle' },
    { id: 'sp-10', url: '/backgrounds/sp-10.jpg', name: 'Ciudad de noche' },
  ],
  'fairly-odd': [
    { id: 'fo-1', url: '/backgrounds/fo-1.jpg', name: 'Ciudad brillante' },
    { id: 'fo-2', url: '/backgrounds/fo-2.jpg', name: 'Casa Turner' },
    { id: 'fo-3', url: '/backgrounds/fo-3.jpg', name: 'Hada World' },
    { id: 'fo-5', url: '/backgrounds/fo-5.jpg', name: 'Escuela' },
    { id: 'fo-10', url: '/backgrounds/fo-10.jpg', name: 'Cielo magico' },
  ],
  'negasva': [],
  'custom': [],
};

/**
 * All state and logic for the multi-step order wizard. Extracted from the
 * page so the step components stay presentational. Behaviour is identical to
 * the previous inline implementation.
 */
export function useCheckout() {
  const { t } = useLanguage();
  const { fmt, currency, rates } = useCurrency();

  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<CheckoutSelection>({
    style: '',
    bodyType: '',
    background: '',
    peopleCount: 1,
    specialRequests: '',
    photos: [],
    express: false,
  });
  const [dynamicBgs, setDynamicBgs] = useState<Record<string, BgItem[]>>({});
  const [styles, setStyles] = useState<{ id: string; name: string }[]>(FALLBACK_STYLES);
  const [bodyTypes, setBodyTypes] = useState<BodyTypeItem[]>(FALLBACK_BODY_TYPES);
  const [priceMap, setPriceMap] = useState<Record<string, number>>(FALLBACK_PRICES);
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [appliedCode, setAppliedCode] = useState<AppliedCode | null>(null);
  const [codeStatus, setCodeStatus] = useState<'idle' | 'checking' | 'invalid'>('idle');
  // Validación: si faltan datos, el botón no avanza y resalta en rojo con shake.
  const [showError, setShowError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutParams, setCheckoutParams] = useState<Record<string, unknown> | null>(null);
  // Authoritative price breakdown comes from the server (/api/pricing/quote).
  // The client never does pricing arithmetic — it only renders this.
  const [quote, setQuote] = useState<PriceBreakdown>(ZERO_QUOTE);

  // Preselección de estilo desde la landing (?style= o sessionStorage).
  useEffect(() => {
    window.scrollTo(0, 0);
    let preselected = '';
    try {
      preselected = new URLSearchParams(window.location.search).get('style')
        ?? sessionStorage.getItem('preselected_style')
        ?? '';
    } catch { /* no-op */ }
    if (preselected) {
      setSelected(prev => (prev.style ? prev : { ...prev, style: preselected }));
    }
  }, []);

  useEffect(() => {
    cachedFetchJSON<Array<{ slug: string; name: string }>>('/api/styles')
      .then((data) => {
        if (data && data.length > 0) {
          setStyles(data.map(s => ({ id: s.slug, name: s.name })));
        }
      })
      .catch(() => null);
    cachedFetchJSON<BodyTypeItem[]>('/api/body-types')
      .then((data) => {
        if (data && data.length > 0) {
          setBodyTypes(data.map(b => ({ ...b, price_usd: Number(b.price_usd), original_price_usd: b.original_price_usd != null ? Number(b.original_price_usd) : null })));
        }
      })
      .catch(() => null);
    cachedFetchJSON<Array<{ key: string; amount: number }>>('/api/prices')
      .then((data) => {
        if (data && data.length > 0) {
          setPriceMap(prev => {
            const next = { ...prev };
            for (const p of data) next[p.key] = Number(p.amount);
            return next;
          });
        }
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (!selected.style || selected.style === 'negasva' || selected.style === 'custom') return;
    // Already cached locally for this style — skip the request entirely.
    if (dynamicBgs[selected.style]) return;
    cachedFetchJSON<Array<{ id: string; name: string; image_url: string }>>(
      `/api/backgrounds?style=${selected.style}`,
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
  }, [selected.style, dynamicBgs]);

  // Fetch the authoritative breakdown whenever a price input changes. Debounced
  // so rapid +/- clicks don't spam the endpoint; the previous value stays on
  // screen until the new one arrives (no flicker to zero).
  useEffect(() => {
    if (!selected.bodyType) { setQuote(ZERO_QUOTE); return; }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/pricing/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bodyType: selected.bodyType,
            peopleCount: selected.peopleCount,
            background: selected.background || 'none',
            express: selected.express,
            ...(appliedCode ? { discountCode: appliedCode.code } : {}),
          }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setQuote(data as PriceBreakdown);
      } catch { /* keep last known quote */ }
    }, 200);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [selected.bodyType, selected.peopleCount, selected.background, selected.express, appliedCode]);

  const canAdvance = () => {
    if (step === 1) return !!selected.style;
    if (step === 2) return !!selected.bodyType;
    if (step === 3) return !!selected.background;
    if (step === 4) return selected.photos.length >= selected.peopleCount;
    return true;
  };

  // Upload the customer's photos to the private bucket (compressed first) and
  // return the storage paths so they travel with the order. Runs before any
  // payment is created, so the illustrator always has the source photos.
  const uploadPhotos = async (): Promise<{ uploadId?: string; paths: string[] }> => {
    if (selected.photos.length === 0) return { paths: [] };
    const { default: imageCompression } = await import('browser-image-compression');
    const fd = new FormData();
    for (const file of selected.photos) {
      let out: File = file;
      try {
        out = await imageCompression(file, { maxSizeMB: 1.5, maxWidthOrHeight: 2200, useWebWorker: true });
      } catch { /* fall back to the original file */ }
      fd.append('photos', out, file.name);
    }
    const res = await fetch('/api/order/upload', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('upload failed');
    return res.json();
  };

  const nextStep = async () => {
    // Si faltan datos del paso, no avanza: resalta en rojo con shake (1 vez).
    if (!canAdvance()) {
      setShowError(true);
      setShaking(true);
      return;
    }

    if (step < 4) { setStep(step + 1); return; }

    // Step 4 → checkout. Upload photos first (for both payment providers).
    setCheckoutLoading(true);
    let uploaded: { uploadId?: string; paths: string[] };
    try {
      uploaded = await uploadPhotos();
    } catch {
      alert('Error al subir las fotos. Intenta de nuevo.');
      setCheckoutLoading(false);
      return;
    }

    const params = {
      style: selected.style,
      bodyType: selected.bodyType,
      background: selected.background,
      peopleCount: selected.peopleCount,
      express: selected.express,
      specialRequests: selected.specialRequests,
      currency: currency.toLowerCase(),
      rate: rates[currency] ?? 1,
      photoPaths: uploaded.paths,
      ...(uploaded.uploadId ? { uploadId: uploaded.uploadId } : {}),
      ...(appliedCode ? { discountCode: appliedCode.code } : {}),
    };

    // COP: Wompi redirect
    if (currency === 'COP') {
      try {
        const recaptchaToken = await getRecaptchaToken('checkout');
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...params, recaptchaToken }),
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

    // Stripe: embedded checkout (paso 5)
    setCheckoutParams(params);
    setStep(5);
    setCheckoutLoading(false);
  };

  const fetchClientSecret = useCallback(async () => {
    if (!checkoutParams) return '';
    // Token reCAPTCHA fresco por request (son de un solo uso y expiran).
    const recaptchaToken = await getRecaptchaToken('checkout');
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...checkoutParams, recaptchaToken }),
    });
    const data = await res.json();
    return data.client_secret ?? '';
  }, [checkoutParams]);

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // En cuanto el dato requerido queda completo, quita el resaltado de error.
  useEffect(() => {
    if (showError && canAdvance()) setShowError(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, step, showError]);

  const onShakeEnd = () => setShaking(false);

  // The breakdown is whatever the server last quoted — no client-side math.
  const priceBreakdown = (): PriceBreakdown => quote;
  const totalPrice = () => quote.total;

  const getBgName = (id: string) =>
    (t.studio.backgrounds as Record<string, string>)[id] ?? id;

  const getStyleBgs = (): BgItem[] => {
    const fromApi = dynamicBgs[selected.style];
    const fallback = FALLBACK_BACKGROUNDS[selected.style] ?? [];
    const base = fromApi && fromApi.length > 0 ? fromApi : fallback;
    return [
      ...base,
      { id: 'custom', url: '', name: getBgName('custom'), price: priceMap.background_custom ?? 25 },
      { id: 'none', url: '', name: getBgName('none') },
    ];
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelected(prev => ({ ...prev, photos: files }));
  };

  // ── Action helpers (keep the step components presentational) ──────────────
  const selectStyle = (id: string) => {
    setSelected(prev => ({ ...prev, style: id, background: '' }));
    setTimeout(() => setStep(2), 300);
  };
  const selectBodyType = (slug: string) =>
    setSelected(prev => ({ ...prev, bodyType: slug }));
  const decPeople = () =>
    setSelected(prev => (prev.peopleCount > 1 ? { ...prev, peopleCount: prev.peopleCount - 1 } : prev));
  const incPeople = () =>
    setSelected(prev => (prev.peopleCount < 8 ? { ...prev, peopleCount: prev.peopleCount + 1 } : prev));
  const selectBackground = (id: string) =>
    setSelected(prev => ({ ...prev, background: id }));
  const toggleExpress = () =>
    setSelected(prev => ({ ...prev, express: !prev.express }));
  const setSpecialRequests = (value: string) =>
    setSelected(prev => ({ ...prev, specialRequests: value }));

  // Clases de error reutilizables para el campo que falta en el paso actual.
  const errorRing = showError ? 'ring-2 ring-red-500 ring-offset-2 rounded-2xl' : '';
  const errorShake = showError && shaking ? 'animate-shake' : '';

  return {
    // i18n / currency helpers used by the UI
    t, fmt, currency, rates,
    // state
    step, setStep,
    selected,
    styles, bodyTypes, priceMap,
    discountCodeInput, setDiscountCodeInput,
    appliedCode, setAppliedCode,
    codeStatus, setCodeStatus,
    showError, errorRing, errorShake, onShakeEnd,
    checkoutLoading, checkoutParams,
    // derived
    canAdvance, priceBreakdown, totalPrice, getBgName, getStyleBgs,
    // actions
    nextStep, prevStep, fetchClientSecret, handlePhotoUpload,
    selectStyle, selectBodyType, decPeople, incPeople,
    selectBackground, toggleExpress, setSpecialRequests,
  };
}

export type CheckoutController = ReturnType<typeof useCheckout>;
