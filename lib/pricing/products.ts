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

/**
 * A selectable option group for a product (e.g. t-shirt size, phone model).
 * `values[].add` is the USD surcharge over the base price for that choice
 * (0 for the default). The first value is the default selection.
 */
export interface PodOptionValue {
  key: string;
  label: { es: string; en: string; fr: string };
  add?: number;
}
export interface PodOptionGroup {
  key: string;
  label: { es: string; en: string; fr: string };
  values: PodOptionValue[];
}

export interface PodProduct {
  key: string;
  name: { es: string; en: string; fr: string };
  desc: { es: string; en: string; fr: string };
  /** Fallback retail price in USD (used when the DB has no `pod_<key>` row). */
  priceUsd: number;
  /** Selectable variants (size, model, …). Absent = no choices needed. */
  options?: PodOptionGroup[];
}

const SIZE = (es: string, en: string, fr: string) => ({ es, en, fr });

const TSHIRT_SIZE: PodOptionGroup = {
  key: 'size',
  label: { es: 'Talla', en: 'Size', fr: 'Taille' },
  values: [
    { key: 'S', label: SIZE('S', 'S', 'S') },
    { key: 'M', label: SIZE('M', 'M', 'M') },
    { key: 'L', label: SIZE('L', 'L', 'L') },
    { key: 'XL', label: SIZE('XL', 'XL', 'XL') },
    { key: 'XXL', label: SIZE('XXL (+$3)', 'XXL (+$3)', 'XXL (+$3)'), add: 3 },
  ],
};

const CANVAS_SIZE: PodOptionGroup = {
  key: 'size',
  label: { es: 'Tamaño', en: 'Size', fr: 'Taille' },
  values: [
    { key: '20x30', label: SIZE('20×30 cm', '8×12 in', '20×30 cm') },
    { key: '30x40', label: SIZE('30×40 cm (+$8)', '12×16 in (+$8)', '30×40 cm (+$8)'), add: 8 },
    { key: '40x50', label: SIZE('40×50 cm (+$16)', '16×20 in (+$16)', '40×50 cm (+$16)'), add: 16 },
    { key: '50x70', label: SIZE('50×70 cm (+$28)', '20×28 in (+$28)', '50×70 cm (+$28)'), add: 28 },
  ],
};

const PILLOW_SIZE: PodOptionGroup = {
  key: 'size',
  label: { es: 'Tamaño', en: 'Size', fr: 'Taille' },
  values: [
    { key: '40x40', label: SIZE('40×40 cm', '16×16 in', '40×40 cm') },
    { key: '45x45', label: SIZE('45×45 cm (+$3)', '18×18 in (+$3)', '45×45 cm (+$3)'), add: 3 },
    { key: '50x50', label: SIZE('50×50 cm (+$6)', '20×20 in (+$6)', '50×50 cm (+$6)'), add: 6 },
  ],
};

const PHONE_MODEL: PodOptionGroup = {
  key: 'model',
  label: { es: 'Modelo', en: 'Model', fr: 'Modèle' },
  values: [
    { key: 'iphone-16-pro-max', label: SIZE('iPhone 16 Pro Max', 'iPhone 16 Pro Max', 'iPhone 16 Pro Max') },
    { key: 'iphone-16-pro', label: SIZE('iPhone 16 / 16 Pro', 'iPhone 16 / 16 Pro', 'iPhone 16 / 16 Pro') },
    { key: 'iphone-15', label: SIZE('iPhone 15 / 15 Pro', 'iPhone 15 / 15 Pro', 'iPhone 15 / 15 Pro') },
    { key: 'iphone-14-13', label: SIZE('iPhone 14 / 13', 'iPhone 14 / 13', 'iPhone 14 / 13') },
    { key: 'iphone-12-11', label: SIZE('iPhone 12 / 11', 'iPhone 12 / 11', 'iPhone 12 / 11') },
    { key: 'samsung-s24', label: SIZE('Samsung Galaxy S24 / S23', 'Samsung Galaxy S24 / S23', 'Samsung Galaxy S24 / S23') },
    { key: 'samsung-a', label: SIZE('Samsung Galaxy A (serie)', 'Samsung Galaxy A (series)', 'Samsung Galaxy A (série)') },
    { key: 'xiaomi', label: SIZE('Xiaomi / Redmi', 'Xiaomi / Redmi', 'Xiaomi / Redmi') },
    { key: 'motorola', label: SIZE('Motorola', 'Motorola', 'Motorola') },
    { key: 'otro', label: SIZE('Otro (indícalo en notas)', 'Other (specify in notes)', 'Autre (préciser en notes)') },
  ],
};

export const POD_PRODUCTS: PodProduct[] = [
  {
    key: 'mug',
    name: { es: 'Taza', en: 'Mug', fr: 'Mug' },
    desc: { es: 'Cerámica 11oz, apta para microondas', en: 'Ceramic 11oz, microwave-safe', fr: 'Céramique 11oz, va au micro-ondes' },
    priceUsd: 16,
  },
  {
    key: 'tshirt',
    name: { es: 'Camiseta', en: 'T-shirt', fr: 'T-shirt' },
    desc: { es: 'Algodón premium', en: 'Premium cotton', fr: 'Coton premium' },
    priceUsd: 27,
    options: [TSHIRT_SIZE],
  },
  {
    key: 'pillow',
    name: { es: 'Almohada / Cojín', en: 'Pillow', fr: 'Coussin' },
    desc: { es: 'Cojín suave con relleno', en: 'Soft cushion, filled', fr: 'Coussin doux, rembourré' },
    priceUsd: 25,
    options: [PILLOW_SIZE],
  },
  {
    key: 'canvas',
    name: { es: 'Cuadro / Lienzo', en: 'Canvas', fr: 'Toile' },
    desc: { es: 'Lienzo montado listo para colgar', en: 'Mounted canvas, ready to hang', fr: 'Toile montée, prête à accrocher' },
    priceUsd: 32,
    options: [CANVAS_SIZE],
  },
  {
    key: 'tote',
    name: { es: 'Bolsa tote', en: 'Tote bag', fr: 'Sac tote' },
    desc: { es: 'Tote de algodón resistente', en: 'Sturdy cotton tote', fr: 'Tote en coton résistant' },
    priceUsd: 21,
  },
  {
    key: 'phonecase',
    name: { es: 'Funda de teléfono', en: 'Phone case', fr: 'Coque de téléphone' },
    desc: { es: 'Funda rígida', en: 'Hard case', fr: 'Coque rigide' },
    priceUsd: 22,
    options: [PHONE_MODEL],
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

/** Chosen option values for a product: { optionGroupKey: valueKey }. */
export type ProductOptionSelection = Record<string, string>;
/** All product option selections keyed by product key. */
export type ProductOptions = Record<string, ProductOptionSelection>;

/** Default option selection for a product (first value of each group). */
export function defaultProductOptions(key: string): ProductOptionSelection {
  const product = getPodProduct(key);
  const sel: ProductOptionSelection = {};
  for (const g of product?.options ?? []) sel[g.key] = g.values[0]?.key ?? '';
  return sel;
}

/** USD surcharge from the chosen option values of a product. */
export function optionsSurchargeUsd(key: string, sel?: ProductOptionSelection): number {
  const product = getPodProduct(key);
  let extra = 0;
  for (const g of product?.options ?? []) {
    const chosen = sel?.[g.key];
    const val = g.values.find((v) => v.key === chosen);
    extra += val?.add ?? 0;
  }
  return extra;
}

/**
 * Resolve a product's total USD price (base + chosen option surcharges),
 * preferring an admin base-price override (`pod_<key>` → amount).
 */
export function podPriceUsd(
  key: string,
  overrides?: Record<string, number>,
  options?: ProductOptionSelection,
): number {
  const override = overrides?.[`pod_${key}`];
  const base = override != null && Number.isFinite(override) && override >= 0
    ? override
    : FALLBACK_POD_PRICE_USD[key] ?? 0;
  return base + optionsSurchargeUsd(key, options);
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

/** Human label of a product's chosen options, e.g. "Talla: L, Modelo: iPhone 15". */
export function optionsLabelEs(key: string, sel?: ProductOptionSelection): string {
  const product = getPodProduct(key);
  const parts: string[] = [];
  for (const g of product?.options ?? []) {
    const val = g.values.find((v) => v.key === sel?.[g.key]);
    if (val) parts.push(`${g.label.es}: ${val.label.es}`);
  }
  return parts.join(', ');
}

/** Spanish product list (with chosen variants) for the admin/order note. */
export function productsSummaryEs(keys: string[], options?: ProductOptions): string {
  const items = sanitizeProductKeys(keys).map((k) => {
    const name = getPodProduct(k)?.name.es ?? k;
    const spec = optionsLabelEs(k, options?.[k]);
    return spec ? `${name} (${spec})` : name;
  });
  return items.length ? `Productos físicos: ${items.join(' · ')}` : '';
}
