import { POD_PRODUCTS, FALLBACK_POD_PRICE_USD } from '@/lib/pricing/products';

// Presentación editable de los productos POD ("Your drawing, on anything").
// Fuente de verdad: landing_config, clave 'pod_products'. El precio que se
// guarda aquí también lo lee lib/pricing/server.ts (loadPricingConfig) para que
// la home, el wizard y el checkout muestren siempre el mismo importe.
// Módulo sin imports de servidor: lo usan la home (server) y el admin (client).

export interface PodProductConfig {
  key: string;
  name: string;
  image: string | null;
  visible: boolean;
  priceUsd: number;
}

/** Defaults derivados del catálogo en código (nombres EN, precios base). */
export const DEFAULT_POD_PRODUCTS: PodProductConfig[] = POD_PRODUCTS.map((p) => ({
  key: p.key,
  name: p.name.en,
  image: null,
  visible: true,
  priceUsd: FALLBACK_POD_PRICE_USD[p.key] ?? p.priceUsd,
}));

/** Fusiona lo guardado en BD sobre los defaults, respetando el orden del catálogo. */
export function mergePodProducts(override: unknown): PodProductConfig[] {
  const saved = new Map<string, Partial<PodProductConfig>>();
  if (Array.isArray(override)) {
    for (const row of override) {
      if (row && typeof row === 'object' && typeof (row as PodProductConfig).key === 'string') {
        saved.set((row as PodProductConfig).key, row as Partial<PodProductConfig>);
      }
    }
  }
  return DEFAULT_POD_PRODUCTS.map((def) => {
    const o = saved.get(def.key);
    if (!o) return def;
    const price = Number(o.priceUsd);
    return {
      key: def.key,
      name: typeof o.name === 'string' && o.name.trim() ? o.name : def.name,
      image: typeof o.image === 'string' && o.image.trim() ? o.image : null,
      visible: o.visible !== false,
      priceUsd: Number.isFinite(price) && price >= 0 ? price : def.priceUsd,
    };
  });
}
