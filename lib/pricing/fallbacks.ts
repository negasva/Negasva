/**
 * Single source of truth for the hardcoded pricing fallbacks.
 *
 * These values are used ONLY when the admin-managed DB tables (`prices`,
 * `body_types`) are unreachable. They were previously duplicated between the
 * client order wizard (`app/order/page.tsx`) and the server pricing loader
 * (`lib/pricing/server.ts`), which let the numbers drift apart. Keeping them
 * here — in a module with no server-only imports — means both sides share the
 * exact same fallback.
 */

export interface BodyTypeItem {
  slug: string;
  name: string;
  description: string | null;
  price_usd: number;
  original_price_usd: number | null;
  is_best_value: boolean;
}

/**
 * Per-person price in USD, keyed by body_type slug.
 * Must match the prices announced on the landing (app/page.tsx: "$15" torso,
 * "$25" full body, "Custom Background: +$15") — see scripts/sync-landing-content.sql
 * for the matching DB update.
 */
export const FALLBACK_PER_PERSON_USD: Record<string, number> = {
  torso_only: 15,
  full_body: 25,
};

export const FALLBACK_BACKGROUND_STANDARD_USD = 15;
export const FALLBACK_BACKGROUND_CUSTOM_USD = 15;
/** Express surcharge as a percentage (30 = 30%). */
export const FALLBACK_EXPRESS_SURCHARGE_PCT = 30;
/** Add-on: video del proceso de dibujo, precio plano en USD. */
export const FALLBACK_RECORDING_USD = 20;

/** Descuento agresivo al 2º retrato (%). Editable en el admin de precios. */
export const FALLBACK_SECOND_PORTRAIT_PCT = 40;

/** Fallback for /api/body-types — admin manages the real values. */
export const FALLBACK_BODY_TYPES: BodyTypeItem[] = [
  {
    slug: 'torso_only',
    name: 'Torso Only',
    description: null,
    price_usd: FALLBACK_PER_PERSON_USD.torso_only,
    original_price_usd: null,
    is_best_value: false,
  },
  {
    slug: 'full_body',
    name: 'Full Body',
    description: null,
    price_usd: FALLBACK_PER_PERSON_USD.full_body,
    original_price_usd: 39.99,
    is_best_value: true,
  },
];

/** Fallback for /api/prices — admin manages the real values. */
export const FALLBACK_PRICES: Record<string, number> = {
  background_standard: FALLBACK_BACKGROUND_STANDARD_USD,
  background_custom: FALLBACK_BACKGROUND_CUSTOM_USD,
  express_surcharge_pct: FALLBACK_EXPRESS_SURCHARGE_PCT,
  recording_addon: FALLBACK_RECORDING_USD,
  second_portrait_pct: FALLBACK_SECOND_PORTRAIT_PCT,
};
