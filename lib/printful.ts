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
  result?: Array<{ id: string; rate: string; currency: string }>;
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
  const map = variantMap();
  const clean = sanitizeProductUnits(units);

  // Nuestros productos → items de Printful (variant_id + quantity).
  const counts = new Map<number, number>();
  let complete = true;
  for (const [key, list] of Object.entries(clean)) {
    for (const sel of list) {
      const id = resolveVariantId(map[key], optionSignature(key, sel));
      if (!id) { complete = false; continue; }
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }

  if (!token || counts.size === 0) {
    return { totalUsd: 0, complete: complete && counts.size === 0 && Object.keys(clean).length === 0 };
  }

  const items = [...counts.entries()].map(([variant_id, quantity]) => ({ variant_id, quantity }));
  const cacheKey = `${country}:${items.map((i) => `${i.variant_id}x${i.quantity}`).sort().join(',')}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return { totalUsd: hit.usd, complete };

  try {
    const res = await fetch(`${PRINTFUL_API}/shipping/rates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        recipient: { country_code: country },
        items,
        currency: 'USD',
      }),
    });
    if (!res.ok) return { totalUsd: 0, complete: false };
    const data = (await res.json()) as RatesResponse;
    // Printful devuelve varias opciones (STANDARD, EXPRESS…); usamos la más barata.
    const cheapest = (data.result ?? [])
      .map((r) => Number(r.rate))
      .filter((n) => Number.isFinite(n) && n >= 0)
      .sort((a, b) => a - b)[0];
    if (cheapest == null) return { totalUsd: 0, complete: false };
    cache.set(cacheKey, { at: Date.now(), usd: cheapest });
    return { totalUsd: cheapest, complete };
  } catch {
    return { totalUsd: 0, complete: false };
  }
}
