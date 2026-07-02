/**
 * Cotización de envío con la API de Printful (v1).
 *
 * Printful calcula tarifas reales por destino y artículos:
 *   POST https://api.printful.com/shipping/rates
 *   { recipient: { country_code }, items: [{ variant_id, quantity }] }
 *
 * Auth: token privado (Printful → Settings → Stores → Add API / developers.printful.com)
 * en el header Authorization: Bearer.
 *
 * El mapeo de nuestros productos a variant_id de Printful se configura por env
 * sin tocar código:
 *   PRINTFUL_API_TOKEN=…
 *   PRINTFUL_VARIANT_MAP={"mug":1320,"tshirt":{"S/white":4011,"M/black":4013,"default":4011},…}
 * Cada valor puede ser un variant_id directo o un objeto keyed por la firma de
 * opciones de la unidad (valores de option groups unidos por "/", en el orden
 * del catálogo) con "default" como comodín. Productos sin mapeo no suman envío
 * y la cotización se marca como parcial.
 */

import { getPodProduct, sanitizeProductUnits, type ProductOptionSelection, type ProductUnits } from '@/lib/pricing/products';

const PRINTFUL_API = 'https://api.printful.com';

type VariantMapEntry = number | Record<string, number>;

function variantMap(): Record<string, VariantMapEntry> {
  try {
    const raw = process.env.PRINTFUL_VARIANT_MAP;
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, VariantMapEntry>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/** Firma de opciones de una unidad ("S/white") en el orden del catálogo. */
function optionSignature(productKey: string, sel: ProductOptionSelection): string {
  const groups = getPodProduct(productKey)?.options ?? [];
  return groups.map((g) => sel[g.key] ?? g.values[0]?.key ?? '').join('/');
}

function resolveVariantId(entry: VariantMapEntry | undefined, signature: string): number | null {
  if (entry == null) return null;
  if (typeof entry === 'number') return entry;
  const id = entry[signature] ?? entry.default;
  return typeof id === 'number' ? id : null;
}

interface RatesResponse {
  result?: Array<{
    id: string;
    name?: string;
    rate: string;
    currency: string;
    minDeliveryDays?: number;
    maxDeliveryDays?: number;
  }>;
}

export interface ShippingRecipient {
  /** País destino, ISO-2 (obligatorio para Printful). */
  country: string;
  state?: string;
  city?: string;
  zip?: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  /** Costo del envío en USD. */
  rateUsd: number;
  minDeliveryDays: number | null;
  maxDeliveryDays: number | null;
}

/** Convierte nuestros productUnits en items de Printful (variant_id + quantity). */
function buildItems(units: ProductUnits): { items: Array<{ variant_id: number; quantity: number }>; complete: boolean } {
  const map = variantMap();
  const clean = sanitizeProductUnits(units);
  const counts = new Map<number, number>();
  let complete = true;
  for (const [key, list] of Object.entries(clean)) {
    for (const sel of list) {
      const id = resolveVariantId(map[key], optionSignature(key, sel));
      if (!id) { complete = false; continue; }
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  return {
    items: [...counts.entries()].map(([variant_id, quantity]) => ({ variant_id, quantity })),
    complete,
  };
}

async function fetchRates(
  items: Array<{ variant_id: number; quantity: number }>,
  recipient: ShippingRecipient,
  token: string,
): Promise<RatesResponse['result'] | null> {
  try {
    const res = await fetch(`${PRINTFUL_API}/shipping/rates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        recipient: {
          country_code: recipient.country,
          ...(recipient.state ? { state_code: recipient.state } : {}),
          ...(recipient.city ? { city: recipient.city } : {}),
          ...(recipient.zip ? { zip: recipient.zip } : {}),
        },
        items,
        currency: 'USD',
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as RatesResponse;
    return data.result ?? null;
  } catch {
    return null;
  }
}

/**
 * Lista TODAS las opciones de envío (STANDARD, EXPRESS…) para una dirección
 * completa. Usada por el calculador de envío del carrito; `quoteShippingUsd`
 * sigue devolviendo solo la más barata para el estimado del resumen.
 */
export async function listShippingOptions(
  units: ProductUnits,
  recipient: ShippingRecipient,
): Promise<{ options: ShippingOption[]; complete: boolean }> {
  const token = process.env.PRINTFUL_API_TOKEN;
  const { items, complete } = buildItems(units);
  if (!token || items.length === 0) return { options: [], complete: false };

  const rates = await fetchRates(items, recipient, token);
  if (!rates) return { options: [], complete: false };

  const options = rates
    .map((r): ShippingOption => ({
      id: r.id,
      name: r.name ?? r.id,
      rateUsd: Number(r.rate),
      minDeliveryDays: r.minDeliveryDays ?? null,
      maxDeliveryDays: r.maxDeliveryDays ?? null,
    }))
    .filter((o) => Number.isFinite(o.rateUsd) && o.rateUsd >= 0)
    .sort((a, b) => a.rateUsd - b.rateUsd);
  return { options, complete };
}

// Cache en memoria por país+items — las tarifas cambian poco y cada llamada
// a Printful cuesta latencia en el checkout.
const cache = new Map<string, { at: number; usd: number }>();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export interface ShippingQuote {
  /** Total de envío en USD para los productos cotizables. */
  totalUsd: number;
  /** true si TODOS los productos seleccionados pudieron cotizarse. */
  complete: boolean;
}

/** Cotiza el envío de los productos físicos del pedido hacia `country` (ISO-2). */
export async function quoteShippingUsd(units: ProductUnits, country: string): Promise<ShippingQuote> {
  const token = process.env.PRINTFUL_API_TOKEN;
  const { items, complete } = buildItems(units);

  if (!token || items.length === 0) {
    return { totalUsd: 0, complete: complete && items.length === 0 && Object.keys(sanitizeProductUnits(units)).length === 0 };
  }

  const cacheKey = `${country}:${items.map((i) => `${i.variant_id}x${i.quantity}`).sort().join(',')}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return { totalUsd: hit.usd, complete };

  const rates = await fetchRates(items, { country }, token);
  if (!rates) return { totalUsd: 0, complete: false };
  // Printful devuelve varias opciones (STANDARD, EXPRESS…); usamos la más barata.
  const cheapest = rates
    .map((r) => Number(r.rate))
    .filter((n) => Number.isFinite(n) && n >= 0)
    .sort((a, b) => a - b)[0];
  if (cheapest == null) return { totalUsd: 0, complete: false };
  cache.set(cacheKey, { at: Date.now(), usd: cheapest });
  return { totalUsd: cheapest, complete };
}
