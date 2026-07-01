/**
 * Print-on-demand (POD) product catalog — the physical "soportes" a customer
 * can add to their digital portrait (mug, t-shirt, pillow, canvas, tote, phone
 * case). The digital illustration is ALWAYS the base product and stays included
 * in the per-person price; these are optional physical add-ons fulfilled via
 * Printify (the finished illustration is uploaded as the print file).
 *
 * This module is isomorphic (no server-only imports) so the client wizard and
 * the server pricing/checkout use the exact same keys and fallback prices —
 * the same discipline the rest of the pricing code follows.
 *
 * Admin override: any row in the `prices` table with key `pod_<key>` (e.g.
 * `pod_mug`) overrides the fallback USD price below, just like other prices.
 */

export interface PodProduct {
  key: string;
  emoji: string;
  name: { es: string; en: string; fr: string };
  desc: { es: string; en: string; fr: string };
  /** Fallback retail price in USD (used when the DB has no `pod_<key>` row). */
  priceUsd: number;
}

export const POD_PRODUCTS: PodProduct[] = [
  {
    key: 'mug',
    emoji: '☕',
    name: { es: 'Taza', en: 'Mug', fr: 'Mug' },
    desc: { es: 'Cerámica 11oz, apta para microondas', en: 'Ceramic 11oz, microwave-safe', fr: 'Céramique 11oz, va au micro-ondes' },
    priceUsd: 16,
  },
  {
    key: 'tshirt',
    emoji: '👕',
    name: { es: 'Camiseta', en: 'T-shirt', fr: 'T-shirt' },
    desc: { es: 'Algodón premium, tallas S–XXL', en: 'Premium cotton, sizes S–XXL', fr: 'Coton premium, tailles S–XXL' },
    priceUsd: 27,
  },
  {
    key: 'pillow',
    emoji: '🛋️',
    name: { es: 'Almohada / Cojín', en: 'Pillow', fr: 'Coussin' },
    desc: { es: 'Cojín suave 45×45cm con relleno', en: 'Soft 45×45cm cushion, filled', fr: 'Coussin doux 45×45cm, rembourré' },
    priceUsd: 25,
  },
  {
    key: 'canvas',
    emoji: '🖼️',
    name: { es: 'Cuadro / Lienzo', en: 'Canvas', fr: 'Toile' },
    desc: { es: 'Lienzo montado listo para colgar', en: 'Mounted canvas, ready to hang', fr: 'Toile montée, prête à accrocher' },
    priceUsd: 32,
  },
  {
    key: 'tote',
    emoji: '👜',
    name: { es: 'Bolsa tote', en: 'Tote bag', fr: 'Sac tote' },
    desc: { es: 'Tote de algodón resistente', en: 'Sturdy cotton tote', fr: 'Tote en coton résistant' },
    priceUsd: 21,
  },
  {
    key: 'phonecase',
    emoji: '📱',
    name: { es: 'Funda de teléfono', en: 'Phone case', fr: 'Coque de téléphone' },
    desc: { es: 'Funda rígida para modelos populares', en: 'Hard case for popular models', fr: 'Coque rigide pour modèles courants' },
    priceUsd: 22,
  },
];

export const POD_PRODUCT_KEYS: string[] = POD_PRODUCTS.map((p) => p.key);

/** Fallback USD price by product key (used when the DB has no `pod_<key>` row). */
export const FALLBACK_POD_PRICE_USD: Record<string, number> = Object.fromEntries(
  POD_PRODUCTS.map((p) => [p.key, p.priceUsd]),
);

export function getPodProduct(key: string): PodProduct | undefined {
  return POD_PRODUCTS.find((p) => p.key === key);
}

/**
 * Resolve a product's USD price, preferring an admin override map
 * (`pod_<key>` → amount) and falling back to the catalog price.
 */
export function podPriceUsd(key: string, overrides?: Record<string, number>): number {
  const override = overrides?.[`pod_${key}`];
  if (override != null && Number.isFinite(override) && override >= 0) return override;
  return FALLBACK_POD_PRICE_USD[key] ?? 0;
}

/** Keep only valid, de-duplicated product keys from arbitrary input. */
export function sanitizeProductKeys(keys: unknown): string[] {
  if (!Array.isArray(keys)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const k of keys) {
    if (typeof k === 'string' && POD_PRODUCT_KEYS.includes(k) && !seen.has(k)) {
      seen.add(k);
      out.push(k);
    }
  }
  return out;
}

/** Spanish product names joined for the admin/order note (fulfillment side). */
export function productsSummaryEs(keys: string[]): string {
  const names = sanitizeProductKeys(keys).map((k) => getPodProduct(k)?.name.es ?? k);
  return names.length ? `🖨️ Productos físicos: ${names.join(', ')}` : '';
}
