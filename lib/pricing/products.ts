/**
 * Print-on-demand (POD) product catalog — the physical "soportes" a customer
 * can add to their digital portrait (mug, t-shirt, hoodie, canvas, framed
 * poster, phone case). The digital illustration is ALWAYS the base product and
 * stays included in the per-person price; these are optional physical add-ons
 * fulfilled via Printful (the finished illustration is uploaded as the print file).
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

const L = (es: string, en: string, fr: string) => ({ es, en, fr });

// ── Shared option groups ─────────────────────────────────────────────────────

const APPAREL_SIZE: PodOptionGroup = {
  key: 'size',
  label: L('Talla', 'Size', 'Taille'),
  values: [
    { key: 'S',   label: L('S', 'S', 'S') },
    { key: 'M',   label: L('M', 'M', 'M') },
    { key: 'L',   label: L('L', 'L', 'L') },
    { key: 'XL',  label: L('XL', 'XL', 'XL') },
    { key: '2XL', label: L('2XL (+$3)', '2XL (+$3)', '2XL (+3$)'), add: 3 },
    { key: '3XL', label: L('3XL (+$5.50)', '3XL (+$5.50)', '3XL (+5,50$)'), add: 5.5 },
    { key: '4XL', label: L('4XL (+$8.50)', '4XL (+$8.50)', '4XL (+8,50$)'), add: 8.5 },
    { key: '5XL', label: L('5XL (+$11)', '5XL (+$11)', '5XL (+11$)'), add: 11 },
  ],
};

const TSHIRT_COLOR: PodOptionGroup = {
  key: 'color',
  label: L('Color', 'Color', 'Couleur'),
  values: [
    { key: 'White',        label: L('Blanco',          'White',        'Blanc') },
    { key: 'Black',        label: L('Negro',           'Black',        'Noir') },
    { key: 'Navy',         label: L('Azul marino',     'Navy',         'Bleu marine') },
    { key: 'Maroon',       label: L('Granate',         'Maroon',       'Bordeaux') },
    { key: 'Red',          label: L('Rojo',            'Red',          'Rouge') },
    { key: 'Royal',        label: L('Azul royal',      'Royal',        'Bleu royal') },
    { key: 'Charcoal',     label: L('Carbón',          'Charcoal',     'Anthracite') },
    { key: 'Sand',         label: L('Arena',           'Sand',         'Sable') },
    { key: 'Natural',      label: L('Natural',         'Natural',      'Naturel') },
    { key: 'Light Pink',   label: L('Rosa claro',      'Light Pink',   'Rose clair') },
    { key: 'Brown Savana', label: L('Marrón sabana',   'Brown Savana', 'Brun savane') },
  ],
};

const HOODIE_SIZE: PodOptionGroup = {
  key: 'size',
  label: L('Talla', 'Size', 'Taille'),
  values: [
    { key: 'S',   label: L('S', 'S', 'S') },
    { key: 'M',   label: L('M', 'M', 'M') },
    { key: 'L',   label: L('L', 'L', 'L') },
    { key: 'XL',  label: L('XL', 'XL', 'XL') },
    { key: '2XL', label: L('2XL (+$2)', '2XL (+$2)', '2XL (+2$)'), add: 2 },
    { key: '3XL', label: L('3XL (+$3.50)', '3XL (+$3.50)', '3XL (+3,50$)'), add: 3.5 },
  ],
};

const HOODIE_COLOR: PodOptionGroup = {
  key: 'color',
  label: L('Color', 'Color', 'Couleur'),
  values: [
    { key: 'Black',       label: L('Negro',          'Black',        'Noir') },
    { key: 'White',       label: L('Blanco',         'White',        'Blanc') },
    { key: 'Navy Blazer', label: L('Azul marino',    'Navy Blazer',  'Bleu marine') },
    { key: 'Maroon',      label: L('Granate',        'Maroon',       'Bordeaux') },
    { key: 'Forest Green',label: L('Verde bosque',   'Forest Green', 'Vert forêt') },
    { key: 'Team Royal',  label: L('Azul royal',     'Team Royal',   'Bleu royal') },
    { key: 'Team Red',    label: L('Rojo',           'Team Red',     'Rouge') },
    { key: 'Bone',        label: L('Hueso',          'Bone',         'Ivoire') },
    { key: 'Khaki',       label: L('Caqui',          'Khaki',        'Kaki') },
  ],
};

const MUG_SIZE: PodOptionGroup = {
  key: 'size',
  label: L('Tamaño', 'Size', 'Taille'),
  values: [
    { key: '11 oz', label: L('11 oz',             '11 oz',             '11 oz') },
    { key: '15 oz', label: L('15 oz (+$2)',        '15 oz (+$2)',        '15 oz (+2$)'),   add: 2 },
    { key: '20 oz', label: L('20 oz (+$5.50)',     '20 oz (+$5.50)',     '20 oz (+5,50$)'), add: 5.5 },
  ],
};

const CANVAS_SIZE: PodOptionGroup = {
  key: 'size',
  label: L('Tamaño', 'Size', 'Taille'),
  values: [
    { key: '8x10',  label: L('20×25 cm',           '8×10 in',           '20×25 cm') },
    { key: '8x12',  label: L('20×30 cm (+$0.50)',   '8×12 in (+$0.50)',  '20×30 cm (+0,50$)'),  add: 0.5 },
    { key: '11x14', label: L('28×36 cm (+$2)',      '11×14 in (+$2)',    '28×36 cm (+2$)'),      add: 2 },
    { key: '12x12', label: L('30×30 cm (+$8.50)',   '12×12 in (+$8.50)', '30×30 cm (+8,50$)'),  add: 8.5 },
    { key: '12x16', label: L('30×40 cm (+$10)',     '12×16 in (+$10)',   '30×40 cm (+10$)'),     add: 10 },
    { key: '16x16', label: L('40×40 cm (+$16.50)',  '16×16 in (+$16.50)','40×40 cm (+16,50$)'), add: 16.5 },
    { key: '16x20', label: L('40×50 cm (+$17.50)',  '16×20 in (+$17.50)','40×50 cm (+17,50$)'), add: 17.5 },
    { key: '18x24', label: L('45×60 cm (+$24)',     '18×24 in (+$24)',   '45×60 cm (+24$)'),     add: 24 },
    { key: '24x36', label: L('60×90 cm (+$49.50)',  '24×36 in (+$49.50)','60×90 cm (+49,50$)'), add: 49.5 },
  ],
};

const POSTER_FRAME: PodOptionGroup = {
  key: 'frame',
  label: L('Marco', 'Frame', 'Cadre'),
  values: [
    { key: 'Black',   label: L('Negro',      'Black',   'Noir') },
    { key: 'White',   label: L('Blanco',     'White',   'Blanc') },
    { key: 'Red Oak', label: L('Roble rojo', 'Red Oak', 'Chêne rouge') },
  ],
};

const POSTER_SIZE: PodOptionGroup = {
  key: 'size',
  label: L('Tamaño', 'Size', 'Taille'),
  values: [
    { key: '8x10',  label: L('20×25 cm',          '8×10 in',          '20×25 cm') },
    { key: '12x16', label: L('30×40 cm (+$15)',    '12×16 in (+$15)',  '30×40 cm (+15$)'),  add: 15 },
    { key: '16x20', label: L('40×50 cm (+$31.50)', '16×20 in (+$31.50)','40×50 cm (+31,50$)'), add: 31.5 },
    { key: '18x24', label: L('45×60 cm (+$35)',    '18×24 in (+$35)',  '45×60 cm (+35$)'),  add: 35 },
    { key: '24x36', label: L('60×90 cm (+$77)',    '24×36 in (+$77)',  '60×90 cm (+77$)'),  add: 77 },
  ],
};

const PHONE_MODEL: PodOptionGroup = {
  key: 'model',
  label: L('Modelo', 'Model', 'Modèle'),
  values: [
    { key: 'iphone-16-pro-max', label: L('iPhone 16 Pro Max',           'iPhone 16 Pro Max',           'iPhone 16 Pro Max') },
    { key: 'iphone-16-pro',     label: L('iPhone 16 / 16 Pro',          'iPhone 16 / 16 Pro',          'iPhone 16 / 16 Pro') },
    { key: 'iphone-15',         label: L('iPhone 15 / 15 Pro',          'iPhone 15 / 15 Pro',          'iPhone 15 / 15 Pro') },
    { key: 'iphone-14-13',      label: L('iPhone 14 / 13',              'iPhone 14 / 13',              'iPhone 14 / 13') },
    { key: 'iphone-12-11',      label: L('iPhone 12 / 11',              'iPhone 12 / 11',              'iPhone 12 / 11') },
    { key: 'samsung-s24',       label: L('Samsung Galaxy S24 / S23',    'Samsung Galaxy S24 / S23',    'Samsung Galaxy S24 / S23') },
    { key: 'samsung-a',         label: L('Samsung Galaxy A (serie)',     'Samsung Galaxy A (series)',   'Samsung Galaxy A (série)') },
    { key: 'xiaomi',            label: L('Xiaomi / Redmi',              'Xiaomi / Redmi',              'Xiaomi / Redmi') },
    { key: 'motorola',          label: L('Motorola',                    'Motorola',                    'Motorola') },
    { key: 'otro',              label: L('Otro (indícalo en notas)',     'Other (specify in notes)',    'Autre (préciser en notes)') },
  ],
};

// ── Product catalog ──────────────────────────────────────────────────────────

export const POD_PRODUCTS: PodProduct[] = [
  {
    key: 'mug',
    name: L('Taza', 'Mug', 'Mug'),
    desc: L('Taza blanca brillante, apta para microondas y lavavajillas', 'White glossy mug, microwave & dishwasher safe', 'Mug blanc brillant, micro-ondes & lave-vaisselle'),
    priceUsd: 9.5,
    options: [MUG_SIZE],
  },
  {
    key: 'tshirt',
    name: L('Camiseta', 'T-shirt', 'T-shirt'),
    desc: L('100% algodón preencogido, unisex', '100% pre-shrunk cotton, unisex', '100% coton pré-rétréci, unisexe'),
    priceUsd: 12.5,
    options: [APPAREL_SIZE, TSHIRT_COLOR],
  },
  {
    key: 'hoodie',
    name: L('Sudadera con capucha', 'Hoodie', 'Sweat à capuche'),
    desc: L('Sudadera unisex premium con capucha', 'Premium unisex pullover hoodie', 'Sweat à capuche unisexe premium'),
    priceUsd: 41,
    options: [HOODIE_SIZE, HOODIE_COLOR],
  },
  {
    key: 'canvas',
    name: L('Lienzo', 'Canvas', 'Toile'),
    desc: L('Lienzo estirado sobre bastidor listo para colgar', 'Stretched canvas on frame, ready to hang', 'Toile sur châssis, prête à accrocher'),
    priceUsd: 22.5,
    options: [CANVAS_SIZE],
  },
  {
    key: 'poster',
    name: L('Póster enmarcado', 'Framed poster', 'Poster encadré'),
    desc: L('Lámina de alta calidad con marco de madera', 'High-quality print with wood frame', 'Impression haute qualité avec cadre en bois'),
    priceUsd: 26.5,
    options: [POSTER_FRAME, POSTER_SIZE],
  },
  {
    key: 'phonecase',
    name: L('Funda de teléfono', 'Phone case', 'Coque de téléphone'),
    desc: L('Funda rígida', 'Hard case', 'Coque rigide'),
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

/**
 * Per-unit product selection: each product key maps to an array of units, one
 * entry per physical unit, each with its own chosen options (size, model…).
 * The array length is the quantity of that product.
 */
export type ProductUnits = Record<string, ProductOptionSelection[]>;

/** Keep only valid product keys and cap the quantity per product. */
export function sanitizeProductUnits(input: unknown, maxPerProduct = 10): ProductUnits {
  if (!input || typeof input !== 'object') return {};
  const out: ProductUnits = {};
  for (const key of POD_PRODUCT_KEYS) {
    const units = (input as Record<string, unknown>)[key];
    if (!Array.isArray(units) || units.length === 0) continue;
    const clean = units
      .slice(0, maxPerProduct)
      .map((u) => (u && typeof u === 'object' ? (u as ProductOptionSelection) : {}));
    if (clean.length) out[key] = clean;
  }
  return out;
}

/** Product keys that have at least one unit selected. */
export function productKeysFromUnits(units: ProductUnits): string[] {
  return Object.keys(units).filter((k) => (units[k]?.length ?? 0) > 0);
}

/** Total USD cost of every unit of every product (base + per-unit surcharges). */
export function productUnitsCostUsd(
  units: ProductUnits,
  overrides?: Record<string, number>,
): number {
  let total = 0;
  for (const [key, list] of Object.entries(sanitizeProductUnits(units))) {
    for (const sel of list) total += podPriceUsd(key, overrides, sel);
  }
  return total;
}

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

/**
 * Spanish product list (with chosen variants and quantities) for the
 * admin/order note. Identical units are grouped as "name (spec) x N".
 */
export function productsSummaryEs(units: ProductUnits): string {
  const clean = sanitizeProductUnits(units);
  const items: string[] = [];
  for (const [key, list] of Object.entries(clean)) {
    const name = getPodProduct(key)?.name.es ?? key;
    const counts = new Map<string, number>();
    for (const sel of list) {
      const spec = optionsLabelEs(key, sel);
      const label = spec ? `${name} (${spec})` : name;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    for (const [label, n] of counts) items.push(n > 1 ? `${label} x${n}` : label);
  }
  return items.length ? `Productos físicos: ${items.join(' · ')}` : '';
}
