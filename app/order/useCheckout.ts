'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import type { ShippingOption, ShippingAddress } from '@/components/ShippingCalculator';

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
// reales de las series, así que en la UI siempre se muestran estas versiones,
// traducidas por idioma (default EN).
const SAFE_STYLE_NAMES: Record<string, { es: string; en: string; fr: string }> = {
  'rick-morty':    { es: 'Cartoon sci-fi',            en: 'Cartoon sci-fi',       fr: 'Cartoon sci-fi' },
  'gravity-falls': { es: 'Misterio del bosque',       en: 'Forest mystery',       fr: 'Mystère de la forêt' },
  'simpsons':      { es: 'Familia amarilla clásica',  en: 'Classic yellow family', fr: 'Famille jaune classique' },
  'fairly-odd':    { es: 'Fantasía brillante',        en: 'Bright fantasy',       fr: 'Fantaisie éclatante' },
  'negasva':       { es: 'Estilo NEGASVA',            en: 'NEGASVA Style',        fr: 'Style NEGASVA' },
};

const FALLBACK_STYLE_SLUGS = Object.keys(SAFE_STYLE_NAMES);
const safeStyleName = (slug: string, lang: 'es' | 'en' | 'fr', dbName = ''): string =>
  SAFE_STYLE_NAMES[slug]?.[lang] ?? dbName ?? slug;

// País estimado para cotizar envío antes de conocer la dirección real
// (la definitiva se captura en el checkout de Stripe).
export const CURRENCY_COUNTRY: Record<string, string> = {
  COP: 'CO', USD: 'US', MXN: 'MX', EUR: 'ES', GBP: 'GB', CAD: 'CA',
};

// Los fondos de la BD llevan el nombre de la serie como prefijo
// ("Rick & Morty — Portal"); se muestra solo la parte descriptiva.
const safeBgName = (name: string) => name.replace(/^[^—]*—\s*/, '');

// Claves de localStorage para el carrito persistente (retomar tras cerrar la
// pestaña) y su id estable (para el guardado en servidor / recuperación).
const CART_STORAGE_KEY = 'negasva_cart_v1';
const CART_ID_KEY = 'negasva_cart_id';

// Genera/recupera el id estable del carrito de este navegador.
function loadCartId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = localStorage.getItem(CART_ID_KEY);
    if (!id) {
      id = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `c-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(CART_ID_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}

/**
 * All state and logic for the multi-step order wizard. Extracted from the
 * page so the step components stay presentational. Behaviour is identical to
 * the previous inline implementation.
 */
export function useCheckout() {
  const { t, lang } = useLanguage();
  const { fmt, currency, rates } = useCurrency();

  const [step, setStep] = useState(1);
  // Contacto del cliente (se captura en el paso de pago). Sin nombre + email
  // no se muestran los botones de pago: así siempre sabemos quién compra.
  const [contact, setContact] = useState<{ name: string; email: string; phone: string }>({
    name: '', email: '', phone: '',
  });
  const setContactField = useCallback((field: 'name' | 'email' | 'phone', value: string) => {
    setContact(prev => ({ ...prev, [field]: value }));
  }, []);
  const contactValid = useMemo(() => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim());
    return contact.name.trim().length >= 2 && emailOk;
  }, [contact]);
  // Id estable del carrito (server sync + recuperación). Vacío en SSR.
  const [cartId] = useState<string>(loadCartId);
  // Evita guardar/sincronizar antes de rehidratar el estado guardado.
  const [hydrated, setHydrated] = useState(false);
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
  // Estilos crudos (slug + nombre BD); el nombre visible se resuelve por idioma
  // en un memo para que cambiar de idioma actualice la grilla sin re-fetch.
  const [rawStyles, setRawStyles] = useState<{ slug: string; name: string; image?: string }[]>(
    FALLBACK_STYLE_SLUGS.map((slug) => ({ slug, name: '' })),
  );
  const styles = useMemo(
    () => rawStyles.map((s) => ({ id: s.slug, name: safeStyleName(s.slug, lang, s.name), image: s.image })),
    [rawStyles, lang],
  );
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
  // Envío estimado de productos físicos (Printful) — null si no cotizable.
  const [shippingEstimate, setShippingEstimate] = useState<number | null>(null);
  // Método de envío elegido en el calculador: viaja al checkout y se cobra.
  // El servidor lo re-cotiza con Printful; aquí solo se guarda para mostrar.
  const [shippingSelection, setShippingSelection] = useState<{ option: ShippingOption; address: ShippingAddress } | null>(null);
  // true mientras el calculador tenga opciones que elegir (o falte el estado):
  // en ese caso no se avanza del paso 4 sin método de envío. Si Printful no
  // cotiza (país sin cobertura, API caída), no se bloquea el checkout.
  const [shippingRequired, setShippingRequired] = useState(false);
  // Propina opcional (paso 5): 5%, 10% o monto personalizado en USD. El % lo
  // recalcula el servidor; aquí solo se muestra y viaja la elección.
  const [tip, setTip] = useState<{ pct?: 5 | 10; usd?: number } | null>(null);

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
    // Código de descuento en la URL (?code=) — lo trae el email de recuperación
    // de carrito. Se prellena y se aplica: el quote lo valida en cuanto haya
    // tipo de cuerpo elegido.
    try {
      const urlCode = new URLSearchParams(window.location.search).get('code');
      if (urlCode) {
        const code = urlCode.trim().toUpperCase().slice(0, 40);
        setDiscountCodeInput(code);
        setDiscountCode(code);
      }
    } catch { /* no-op */ }
  }, []);

  // Rehidratar el carrito guardado para retomar el pedido tras cerrar la
  // pestaña. Las fotos (File) no son serializables, así que no se restauran.
  // Si la URL trae ?style=, es una entrada NUEVA al embudo y no se restaura.
  useEffect(() => {
    try {
      const hasStyleParam = new URLSearchParams(window.location.search).has('style');
      if (!hasStyleParam) {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as {
            selected?: Partial<CheckoutSelection>;
            step?: number;
            contact?: { name: string; email: string; phone: string };
          };
          if (saved.selected) {
            setSelected(prev => ({ ...prev, ...saved.selected, photos: [] }));
          }
          if (saved.contact) setContact(saved.contact);
          // Nunca se retoma directo en el pago (paso 5): las fotos y los
          // params del checkout se generan de nuevo. Se vuelve como mucho al 4.
          if (typeof saved.step === 'number') setStep(Math.min(Math.max(saved.step, 1), 4));
        }
      }
    } catch { /* no-op */ }
    setHydrated(true);
  }, []);

  // Guardado local continuo (sin fotos): permite retomar donde se quedó.
  useEffect(() => {
    if (!hydrated) return;
    try {
      const { photos: _photos, ...rest } = selected;
      void _photos;
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ selected: rest, step, contact }));
    } catch { /* no-op */ }
  }, [selected, step, contact, hydrated]);

  useEffect(() => {
    cachedFetchJSON<Array<{ slug: string; name: string; image?: string }>>('/api/styles')
      .then((data) => {
        if (data && data.length > 0) {
          setRawStyles(data.map(s => ({ slug: s.slug, name: s.name, image: s.image })));
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

  // Envío estimado (Printful) cuando hay productos físicos. Informativo: la
  // dirección real se captura en el checkout y el envío final puede variar.
  useEffect(() => {
    const hasProducts = Object.values(selected.productUnits).some(list => list.length > 0);
    if (!hasProducts) { setShippingEstimate(null); return; }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/shipping/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country: CURRENCY_COUNTRY[currency] ?? 'US',
            productUnits: selected.productUnits,
          }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setShippingEstimate(data.available ? Number(data.totalUsd) : null);
      } catch { /* deja el último estimado */ }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [selected.productUnits, currency]);

  // Si cambian los productos del carrito, la tarifa elegida queda obsoleta
  // (peso/artículos distintos) — se descarta y el usuario recalcula.
  useEffect(() => {
    setShippingSelection(null);
    // Solo se libera la obligatoriedad cuando ya no hay productos físicos.
    // Con productos, el calculador (que se remonta con cada cambio) es quien
    // fija el valor — y su efecto corre ANTES que este; resetear aquí lo pisaría.
    const hasProducts = Object.values(selected.productUnits).some(list => list.length > 0);
    if (!hasProducts) setShippingRequired(false);
  }, [selected.productUnits]);

  // Callback del ShippingCalculator: guarda opción + dirección cotizada.
  const selectShipping = useCallback((option: ShippingOption | null, address?: ShippingAddress) => {
    setShippingSelection(option && address ? { option, address } : null);
  }, []);

  // Sync al servidor del carrito (recuperación de carritos abandonados). Es
  // best-effort y debounced: si el cliente cierra el proceso a mitad, en el
  // admin queda guardado lo que llevaba y en qué paso iba, con su contacto si
  // llegó a escribirlo. No corre hasta tener al menos un estilo elegido.
  useEffect(() => {
    if (!hydrated || !cartId || !selected.style) return;
    const timer = setTimeout(() => {
      const { photos: _photos, ...state } = selected;
      void _photos;
      const styleName = styles.find(s => s.id === selected.style)?.name ?? selected.style;
      const summary = [
        styleName,
        selected.bodyType ? (selected.bodyType === 'full_body' ? 'Cuerpo completo' : 'Torso') : '',
        `${selected.peopleCount} pers.`,
        selected.express ? 'Exprés' : '',
        selected.recording ? 'Video' : '',
      ].filter(Boolean).join(' · ').slice(0, 500);
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          step,
          state,
          summary,
          amountUsd: quote.total || undefined,
          currency: currency.toLowerCase(),
          ...(contact.name.trim() ? { customerName: contact.name.trim() } : {}),
          ...(contact.email.trim() ? { customerEmail: contact.email.trim() } : {}),
          ...(contact.phone.trim() ? { customerPhone: contact.phone.trim() } : {}),
        }),
        keepalive: true,
      }).catch(() => null);
    }, 1200);
    return () => clearTimeout(timer);
  }, [hydrated, cartId, selected, step, contact, quote.total, currency, styles]);

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
    // Step 4: las fotos son opcionales, pero con productos físicos el método
    // de envío es obligatorio (se cobra junto con el pedido).
    if (step === 4) return !shippingRequired || !!shippingSelection;
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
      // Envío elegido: solo id de tarifa + dirección; el servidor re-cotiza.
      ...(shippingSelection
        ? { shipping: { rateId: shippingSelection.option.id, ...shippingSelection.address } }
        : {}),
      ...(uploaded.uploadId ? { uploadId: uploaded.uploadId } : {}),
      ...(appliedCode ? { discountCode: appliedCode.code } : {}),
    };

    // Checkout embebido (paso 5): Stripe para monedas internacionales,
    // Mercado Pago (Payment Brick) para COP. Ambos cobran dentro de la web.
    setCheckoutParams(params);
    setStep(5);
    setCheckoutLoading(false);
  };

  // Crea la orden PayPal (monedas no-COP). El servidor calcula el monto,
  // persiste el pedido pending y devuelve el orderID para los botones.
  const createPayPalOrder = useCallback(async (): Promise<string> => {
    if (!checkoutParams) throw new Error('no checkout params');
    setCheckoutError('');
    try {
      // Token reCAPTCHA fresco por request (son de un solo uso y expiran). Es
      // best-effort: si tarda o falla, seguimos sin token (el backend no
      // bloquea cuando falta) en vez de dejar el pago colgado.
      let recaptchaToken: string | undefined;
      try {
        recaptchaToken = await withTimeout(getRecaptchaToken('checkout'), 8000);
      } catch {
        recaptchaToken = undefined;
      }

      // Abortamos si /api/checkout no responde: sin esto la promesa de
      // createOrder nunca resuelve y PayPal deja el popup en about:blank.
      const controller = new AbortController();
      const abortTimer = setTimeout(() => controller.abort(), 20000);
      let data: { paypal?: { orderID?: string } } | null;
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...checkoutParams,
            customerName: contact.name.trim(),
            customerEmail: contact.email.trim(),
            customerPhone: contact.phone.trim() || undefined,
            ...(cartId ? { cartId } : {}),
            ...(tip ? { tip } : {}),
            recaptchaToken,
          }),
          signal: controller.signal,
        });
        data = await res.json().catch(() => null);
      } finally {
        clearTimeout(abortTimer);
      }
      if (!data?.paypal?.orderID) throw new Error('checkout failed');
      return data.paypal.orderID;
    } catch (err) {
      // Mensaje visible al usuario y re-lanzado para que el SDK de PayPal
      // rechace createOrder y cierre la ventana en vez de dejarla en blanco.
      setCheckoutError(t.studio.errors.payment);
      throw err instanceof Error ? err : new Error('checkout failed');
    }
  }, [checkoutParams, t, contact, cartId, tip]);

  // Captura la orden aprobada y redirige al success con la referencia.
  const capturePayPalOrder = useCallback(async (orderID: string) => {
    const res = await fetch('/api/checkout/paypal/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderID }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || data?.status !== 'COMPLETED') throw new Error('capture failed');
    // Pago hecho: se descarta el carrito guardado para empezar limpio.
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(CART_ID_KEY);
    } catch { /* no-op */ }
    const ref = data.reference ? `?ref=${encodeURIComponent(data.reference)}&status=APPROVED` : '';
    window.location.href = `/checkout/success${ref}`;
  }, []);

  // Crea el pedido pendiente de Mercado Pago (COP) y devuelve { reference,
  // amount } para inicializar el Payment Brick embebido.
  const createMpOrder = useCallback(async (): Promise<{ reference: string; amount: number } | null> => {
    if (!checkoutParams) return null;
    try {
      // reCAPTCHA best-effort: si tarda o falla, seguimos sin token (el backend
      // no bloquea) en vez de dejar el Brick esperando indefinidamente.
      let recaptchaToken: string | undefined;
      try {
        recaptchaToken = await withTimeout(getRecaptchaToken('checkout'), 8000);
      } catch {
        recaptchaToken = undefined;
      }

      // Abortamos si /api/checkout no responde: sin esto el Brick nunca recibe
      // la referencia y queda cargando para siempre.
      const controller = new AbortController();
      const abortTimer = setTimeout(() => controller.abort(), 20000);
      let data: { mp?: { reference: string; amount: number } } | null;
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...checkoutParams,
            customerName: contact.name.trim(),
            customerEmail: contact.email.trim(),
            customerPhone: contact.phone.trim() || undefined,
            ...(cartId ? { cartId } : {}),
            ...(tip ? { tip } : {}),
            recaptchaToken,
          }),
          signal: controller.signal,
        });
        data = await res.json().catch(() => null);
      } finally {
        clearTimeout(abortTimer);
      }
      return data?.mp ?? null;
    } catch {
      // El Brick ya maneja order == null mostrando el error de inicialización.
      return null;
    }
  }, [checkoutParams, contact, cartId, tip]);

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // En cuanto el dato requerido queda completo, quita el resaltado de error.
  useEffect(() => {
    if (showError && canAdvance()) setShowError(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, step, showError, shippingSelection, shippingRequired]);

  const onShakeEnd = () => setShaking(false);

  // The breakdown is whatever the server last quoted — no client-side math.
  const priceBreakdown = (): PriceBreakdown => quote;
  // Propina en USD para display (espejo del cálculo del servidor).
  const tipUsd = tip?.pct ? quote.total * (tip.pct / 100) : (tip?.usd ?? 0);
  // El total mostrado incluye el envío elegido y la propina (líneas aparte).
  const totalPrice = () => quote.total + (shippingSelection?.option.rateUsd ?? 0) + tipUsd;

  const getBgName = (id: string) =>
    (t.studio.backgrounds as Record<string, string>)[id] ?? id;

  const getStyleBgs = (): BgItem[] => {
    // Sin API solo quedan "custom" y "none" — no duplicamos el catálogo aquí.
    const base = dynamicBgs[selected.style] ?? [];
    return [
      ...base,
      { id: 'custom', url: '', name: getBgName('custom'), price: priceMap.background_custom ?? 15 },
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
  // Toggle tipo radio: reseleccionar la opción activa la deselecciona.
  const selectBodyType = (slug: string) =>
    setSelected(prev => ({ ...prev, bodyType: prev.bodyType === slug ? '' : slug }));
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
  const removePortrait = () =>
    setSelected(prev => ({
      ...prev,
      style: '',
      bodyType: '',
      background: '',
      peopleCount: 1,
      express: false,
      recording: false,
    }));
  const removeBackground = () =>
    setSelected(prev => ({ ...prev, background: '' }));
  const removeExpress = () =>
    setSelected(prev => ({ ...prev, express: false }));
  const removeRecording = () =>
    setSelected(prev => ({ ...prev, recording: false }));
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
    contact, setContactField, contactValid,
    styles, bodyTypes, priceMap, shippingEstimate, shippingSelection, selectShipping, setShippingRequired,
    discountCodeInput, onDiscountInput,
    appliedCode, codeStatus,
    applyDiscountCode, removeDiscountCode,
    showError, errorRing, errorShake, onShakeEnd,
    checkoutLoading, checkoutError, setCheckoutError, checkoutParams,
    tip, setTip, tipUsd,
    // derived
    canAdvance, priceBreakdown, totalPrice, getBgName, getStyleBgs, getProducts,
    // actions
    nextStep, prevStep, createPayPalOrder, capturePayPalOrder, createMpOrder, handlePhotoUpload,
    selectStyle, selectBodyType, decPeople, incPeople,
    selectBackground, toggleExpress, toggleRecording, removePortrait, removeBackground, removeExpress, removeRecording, setSpecialRequests,
    productQty, addProductUnit, removeProductUnit, removeProductUnitAt, setProductUnitOption,
  };
}

export type CheckoutController = ReturnType<typeof useCheckout>;
