/**
 * Cotización de envío con la API de Printify (v1).
 *
 * Printify publica las tarifas de envío por blueprint + print provider:
 *   GET /v1/catalog/blueprints/{blueprint_id}/print_providers/{provider_id}/shipping.json
 * (first_item / additional_items en centavos USD por país).
 *
 * Cada tienda usa blueprints/providers distintos, así que el mapeo por producto
 * se configura por env sin tocar código:
 *   PRINTIFY_API_TOKEN=…
 *   PRINTIFY_PRODUCT_MAP={"mug":{"blueprint":68,"provider":1},"tshirt":{"blueprint":6,"provider":99},…}
 * Si falta el token o el mapeo de un producto, ese producto no suma envío y la
 * cotización se marca como parcial (el checkout muestra "calculado luego").
 */

import { sanitizeProductUnits, type ProductUnits } from '@/lib/pricing/products';

const PRINTIFY_API = 'https://api.printify.com/v1';

type BlueprintRef = { blueprint: number; provider: number };

function productMap(): Record<string, BlueprintRef> {
  try {
    const raw = process.env.PRINTIFY_PRODUCT_MAP;
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, BlueprintRef>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

interface ShippingProfile {
  countries: string[];
  first_item: { cost: number; currency: string };
  additional_items: { cost: number; currency: string };
}
interface ShippingResponse {
  profiles?: ShippingProfile[];
}

// Cache en memoria por blueprint/provider — las tarifas cambian poco y cada
// llamada a Printify cuesta latencia en el checkout.
const cache = new Map<string, { at: number; data: ShippingResponse | null }>();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

async function fetchShipping(ref: BlueprintRef): Promise<ShippingResponse | null> {
  const token = process.env.PRINTIFY_API_TOKEN;
  if (!token) return null;
  const key = `${ref.blueprint}:${ref.provider}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data;
  try {
    const res = await fetch(
      `${PRINTIFY_API}/catalog/blueprints/${ref.blueprint}/print_providers/${ref.provider}/shipping.json`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const data = res.ok ? ((await res.json()) as ShippingResponse) : null;
    cache.set(key, { at: Date.now(), data });
    return data;
  } catch {
    return null;
  }
}

function profileFor(data: ShippingResponse, country: string): ShippingProfile | null {
  const profiles = data.profiles ?? [];
  return (
    profiles.find((p) => p.countries?.includes(country)) ??
    profiles.find((p) => p.countries?.includes('REST_OF_THE_WORLD')) ??
    null
  );
}

export interface ShippingQuote {
  /** Total de envío en USD para los productos cotizables. */
  totalUsd: number;
  /** true si TODOS los productos seleccionados pudieron cotizarse. */
  complete: boolean;
}

/** Cotiza el envío de los productos físicos del pedido hacia `country` (ISO-2). */
export async function quoteShippingUsd(units: ProductUnits, country: string): Promise<ShippingQuote> {
  const map = productMap();
  const clean = sanitizeProductUnits(units);
  let totalCents = 0;
  let complete = true;

  for (const [key, list] of Object.entries(clean)) {
    const ref = map[key];
    if (!ref) { complete = false; continue; }
    const data = await fetchShipping(ref);
    const profile = data ? profileFor(data, country) : null;
    if (!profile) { complete = false; continue; }
    // Primera unidad a tarifa first_item, las demás a additional_items.
    totalCents += profile.first_item.cost + Math.max(0, list.length - 1) * profile.additional_items.cost;
  }

  return { totalUsd: totalCents / 100, complete };
}
