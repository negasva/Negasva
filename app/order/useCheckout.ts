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
import {
  POD_PRODUCTS,
  podPriceUsd,
  defaultProductOptions,
  type PodProduct,
  type ProductUnits,
} from '@/lib/pricing/products';
import { MAX_PEOPLE } from '@/lib/pricing/calc';

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
}

export interface CheckoutSelection {
  style: string;
  bodyType: string;
  background: string;
  peopleCount: number;
  specialRequests: string;
  photos: File[];
  express: boolean;
  /** Add-on: video del proceso de dibujo. */
  recording: boolean;
  // Per-unit POD add-ons: { productKey: [ { optionGroup: valueKey }, … ] }.
  // Array length is the quantity; each entry is that unit's chosen variant.
  productUnits: ProductUnits;
}

export interface PriceBreakdown {
  perPerson: number;
  peopleSubtotal: number;
  discountRate: number;
  discount: number;
  bgCost: number;
  subtotal: number;
  expressSurcharge: number;
  recordingCost: number;
  productsCost: number;
  products: string[];
  codeDiscount: number;
  preCodeTotal: number;
  total: number;
}

const ZERO_QUOTE: PriceBreakdown = {
  perPerson: 0, peopleSubtotal: 0, discountRate: 0, discount: 0, bgCost: 0,
  subtotal: 0, expressSurcharge: 0, recordingCost: 0, productsCost: 0, products: [],
  codeDiscount: 0, preCodeTotal: 0, total: 0,
};

// Carrera contra un tiempo límite: si la promesa no resuelve a tiempo, rechaza
// para que el flujo de checkout nunca se quede colgado esperando.
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

// Nombres propios (anti copyright): la BD puede traer todavía los nombres
// reales de las series, así que en la UI siempre se muestran estas versiones.
const SAFE_STYLE_NAMES: Record<string, string> = {
  'rick-morty':    'Cartoon sci-fi',
  'gravity-falls': 'Misterio del bosque',
  'simpsons':      'Familia amarilla clásica',
  'fairly-odd':    'Fantasía brillante',
  'negasva':       'Estilo NEGASVA',
};

const FALLBACK_STYLES = Object.entries(SAFE_STYLE_NAMES).map(([id, name]) => ({ id, name }));

// Los fondos de la BD llevan el nombre de la serie como prefijo
// ("Rick & Morty — Portal"); se muestra solo la parte descriptiva.
const safeBgName = (name: string) => name.replace(/^[^—]*—\s*/, '');

/**
 * All state and logic for the multi-step order wizard. Extracted from the
 * page so the step components stay presentational. Behaviour is identical to
 * the previous inline implementation.
 */
export function useCheckout() {
  const { t, lang } = useLanguage();
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
    recording: false,
    productUnits: {},
  });
  const [dynamicBgs, setDynamicBgs] = useState<Record<string, BgItem[]>>({});
  const [styles, setStyles] = useState<{ id: string; name: string }[]>(FALLBACK_STYLES);
  const [bodyTypes, setBodyTypes] = useState<BodyTypeItem[]>(FALLBACK_BODY_TYPES);
  const [priceMap, setPriceMap] = useState<Record<string, number>>(FALLBACK_PRICES);
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  // Código que el usuario intentó aplicar. Viaja con el quote: el servidor lo
  // valida y devuelve `appliedCode` (o null si es inválido/expirado).
  const [discountCode, setDiscountCode] = useState('');
  const [appliedCode, setAppliedCode] = useState<AppliedCode | null>(null);
  const [codeStatus, setCodeStatus] = useState<'idle' | 'checking' | 'invalid'>('idle');
  // Validación: si faltan datos, el botón no avanza y resalta en rojo con shake.
  const [showError, setShowError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  // Error de subida/pago mostrado en la barra de navegación (antes: alert()).
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutParams, setCheckoutParams] = useState<Record<string, unknown> | null>(null);
  // Authoritative price breakdown comes from the server (/api/pricing/quote).
  // The client never does pricing arithmetic — it only renders this.
  const [quote, setQuote] = useState<PriceBreakdown>(ZERO_QUOTE);

  // Al cambiar de paso, la página vuelve siempre al inicio para que el usuario
  // vea el contenido del nuevo paso desde arriba.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

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
          setStyles(data.map(s => ({ id: s.slug, name: SAFE_STYLE_NAMES[s.slug] ?? s.name })));
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
            [selected.style]: data.map(b => ({ id: b.id, url: b.image_url, name: safeBgName(b.name) })),
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
            recording: selected.recording,
            productUnits: selected.productUnits,
            ...(discountCode ? { discountCode } : {}),
          }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setQuote(data as PriceBreakdown);
        // El quote es también quien valida el código: appliedCode viene null
        // cuando es inválido/expirado/agotado.
        if (discountCode) {
          if (data.appliedCode) {
            setAppliedCode(data.appliedCode as AppliedCode);
            setCodeStatus('idle');
          } else {
            setDiscountCode('');
            setAppliedCode(null);
            setCodeStatus('invalid');
          }
        }
      } catch { /* keep last known quote */ }
    }, 200);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [selected.bodyType, selected.peopleCount, selected.background, selected.express, selected.recording, selected.productUnits, discountCode]);

  // Aplica el código escrito: se manda con el próximo quote y el servidor decide.
  const applyDiscountCode = () => {
    const code = discountCodeInput.trim();
    if (code.length < 2) return;
    setCodeStatus('checking');
    setDiscountCode(code);
  };
  const removeDiscountCode = () => {
    setDiscountCode('');
    setAppliedCode(null);
    setDiscountCodeInput('');
    setCodeStatus('idle');
  };
  const onDiscountInput = (value: string) => {
    setDiscountCodeInput(value.toUpperCase());
    setCodeStatus('idle');
  };

  const canAdvance = () => {
    if (step === 1) return !!selected.style;
    if (step === 2) return !!selected.bodyType;
    if (step === 3) return !!selected.background;
    // Step 4: las fotos son opcionales, el cliente puede enviarlas luego.
    return true;
  };

  // Upload the customer's photos to the private bucket (compressed first) and
  // return the storage paths so they travel with the order. Runs before any
  // payment is created, so the illustrator always has the source photos.
  //
  // Cada paso lleva un tiempo límite: en algunos navegadores móviles el worker
  // de compresión puede colgarse y dejaba el botón "Ir al pago" cargando para
  // siempre. Con los timeouts el flujo siempre termina (éxito o error visible)
  // y, si la compresión falla, se sube la foto original.
  const uploadPhotos = async (): Promise<{ uploadId?: string; paths: string[] }> => {
    if (selected.photos.length === 0) return { paths: [] };

    // La compresión es opcional. Si la librería no carga a tiempo, subimos los
    // originales en lugar de bloquear el checkout.
    let compress: ((f: File) => Promise<File>) | null = null;
    try {
      const { default: imageCompression } = await withTimeout(import('browser-image-compression'), 8000);
      compress = (f: File) => imageCompression(f, { maxSizeMB: 1.5, maxWidthOrHeight: 2200, useWebWorker: true });
    } catch { compress = null; }

    const fd = new FormData();
    for (const file of selected.photos) {
      let out: File = file;
      if (compress) {
        try {
          out = await withTimeout(compress(file), 12000);
        } catch { out = file; /* usa el original si la compresión se cuelga */ }
      }
      fd.append('photos', out, file.name);
    }

    // Abortamos la subida si el servidor no responde, para que el botón salga
    // siempre del estado de carga.
    const controller = new AbortController();
    const abortTimer = setTimeout(() => controller.abort(), 60000);
    try {
      const res = await fetch('/api/order/upload', { method: 'POST', body: fd, signal: controller.signal });
      if (!res.ok) throw new Error('upload failed');
      return await res.json();
    } finally {
      clearTimeout(abortTimer);
    }
  };

  const nextStep = async () => {
    // Si faltan datos del paso, no avanza: resalta en rojo con shake (1 vez) y
    // hace scroll automático hasta el campo requerido que falta.
    if (!canAdvance()) {
      setShowError(true);
      setShaking(true);
      requestAnimationFrame(() => {
        document
          .getElementById('required-field')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }

    if (step < 4) { setStep(step + 1); return; }

    // Step 4 → checkout. Upload photos first (for both payment providers).
    setCheckoutLoading(true);
    setCheckoutError('');
    let uploaded: { uploadId?: string; paths: string[] };
    try {
      uploaded = await uploadPhotos();
    } catch {
      setCheckoutError(t.studio.errors.upload);
      setCheckoutLoading(false);
      return;
    }

    const params = {
      style: selected.style,
      bodyType: selected.bodyType,
      background: selected.background,
      peopleCount: selected.peopleCount,
      express: selected.express,
      recording: selected.recording,
      productUnits: selected.productUnits,
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
        // Un 500 puede llegar sin cuerpo JSON; no debe leerse como error de red.
        const data = await res.json().catch(() => null);
        if (data?.url) {
          window.location.href = data.url;
        } else {
          setCheckoutError(t.studio.errors.payment);
          setCheckoutLoading(false);
        }
      } catch {
        setCheckoutError(t.studio.errors.network);
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
    // Sin API solo quedan "custom" y "none" — no duplicamos el catálogo aquí.
    const base = dynamicBgs[selected.style] ?? [];
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
    setStep(2);
  };
  const selectBodyType = (slug: string) =>
    setSelected(prev => ({ ...prev, bodyType: slug }));
  const decPeople = () =>
    setSelected(prev => (prev.peopleCount > 1 ? { ...prev, peopleCount: prev.peopleCount - 1 } : prev));
  const incPeople = () =>
    setSelected(prev => (prev.peopleCount < MAX_PEOPLE ? { ...prev, peopleCount: prev.peopleCount + 1 } : prev));
  const selectBackground = (id: string) =>
    setSelected(prev => ({ ...prev, background: id }));
  const toggleExpress = () =>
    setSelected(prev => ({ ...prev, express: !prev.express }));
  const toggleRecording = () =>
    setSelected(prev => ({ ...prev, recording: !prev.recording }));
  // Cantidad seleccionada de un producto (número de unidades).
  const productQty = (key: string) => selected.productUnits[key]?.length ?? 0;
  // Añade una unidad (con su variante por defecto) del producto.
  const addProductUnit = (key: string) =>
    setSelected(prev => {
      const list = prev.productUnits[key] ?? [];
      if (list.length >= 10) return prev;
      return {
        ...prev,
        productUnits: { ...prev.productUnits, [key]: [...list, defaultProductOptions(key)] },
      };
    });
  // Quita la última unidad del producto (o lo elimina si queda en 0).
  const removeProductUnit = (key: string) =>
    setSelected(prev => {
      const list = prev.productUnits[key] ?? [];
      if (list.length === 0) return prev;
      const next = list.slice(0, -1);
      const productUnits = { ...prev.productUnits };
      if (next.length) productUnits[key] = next;
      else delete productUnits[key];
      return { ...prev, productUnits };
    });
  // Quita una unidad concreta (por índice) del producto.
  const removeProductUnitAt = (key: string, index: number) =>
    setSelected(prev => {
      const list = prev.productUnits[key] ?? [];
      const next = list.filter((_, i) => i !== index);
      const productUnits = { ...prev.productUnits };
      if (next.length) productUnits[key] = next;
      else delete productUnits[key];
      return { ...prev, productUnits };
    });
  // Cambia la variante (talla, modelo…) de una unidad concreta.
  const setProductUnitOption = (key: string, index: number, group: string, value: string) =>
    setSelected(prev => {
      const list = prev.productUnits[key] ?? [];
      if (!list[index]) return prev;
      const nextList = list.map((u, i) => (i === index ? { ...u, [group]: value } : u));
      return { ...prev, productUnits: { ...prev.productUnits, [key]: nextList } };
    });
  const setSpecialRequests = (value: string) =>
    setSelected(prev => ({ ...prev, specialRequests: value }));

  // POD products with their live base USD price (admin `pod_<key>` override
  // applied). Per-variant surcharges are added in the UI from the catalog.
  const getProducts = (): (PodProduct & { priceUsd: number })[] =>
    POD_PRODUCTS.map(p => ({ ...p, priceUsd: podPriceUsd(p.key, priceMap) }));

  // Clases de error reutilizables para el campo que falta en el paso actual.
  const errorRing = showError ? 'ring-2 ring-red-500 ring-offset-2 rounded-2xl' : '';
  const errorShake = showError && shaking ? 'animate-shake' : '';

  return {
    // i18n / currency helpers used by the UI
    t, lang, fmt, currency, rates,
    // state
    step, setStep,
    selected,
    styles, bodyTypes, priceMap,
    discountCodeInput, onDiscountInput,
    appliedCode, codeStatus,
    applyDiscountCode, removeDiscountCode,
    showError, errorRing, errorShake, onShakeEnd,
    checkoutLoading, checkoutError, checkoutParams,
    // derived
    canAdvance, priceBreakdown, totalPrice, getBgName, getStyleBgs, getProducts,
    // actions
    nextStep, prevStep, fetchClientSecret, handlePhotoUpload,
    selectStyle, selectBodyType, decPeople, incPeople,
    selectBackground, toggleExpress, toggleRecording, setSpecialRequests,
    productQty, addProductUnit, removeProductUnit, removeProductUnitAt, setProductUnitOption,
  };
}

export type CheckoutController = ReturnType<typeof useCheckout>;
