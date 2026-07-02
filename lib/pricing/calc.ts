import type { PricingConfig } from './server';
import {
  sanitizeProductUnits,
  productKeysFromUnits,
  optionsSurchargeUsd,
  type ProductUnits,
} from './products';

/**
 * Single source of truth for order math. Pure function, no I/O — used by both
 * the public quote endpoint (`/api/pricing/quote`) and the checkout endpoint
 * (`/api/checkout`) so the price the client shows is byte-for-byte the price
 * the server charges. The client performs NO pricing arithmetic.
 *
 * All amounts are in USD; the display layer converts to the user's currency.
 */

export interface QuoteInputs {
  bodyType: string;
  peopleCount: number;
  background: string;
  express: boolean;
  /** Add-on: video del proceso de dibujo (precio plano). */
  recording?: boolean;
  // Per-unit POD add-ons: { productKey: [ { optionGroup: valueKey }, … ] }.
  // Array length is the quantity; each entry is that unit's chosen variant.
  productUnits?: ProductUnits;
}

export interface QuoteBreakdown {
  perPerson: number;
  peopleSubtotal: number;
  discountRate: number;   // 0.15 = 15% family pack discount
  discount: number;       // family discount amount
  bgCost: number;
  subtotal: number;       // after family discount + background
  expressSurcharge: number;
  recordingCost: number;  // add-on: video del proceso (0 si no se pidió)
  productsCost: number;   // sum of physical POD add-ons (no family/express applied)
  products: string[];     // sanitized product keys that were priced
  codeDiscount: number;   // promo code discount (already capped)
  preCodeTotal: number;   // subtotal + express + products, before promo code
  total: number;
}

/** Máximo de personas por retrato — única definición (schema, hook y UI). */
export const MAX_PEOPLE = 8;

/**
 * Family pack discount tiers by head count. Mirrored nowhere else — this is
 * it: the server math and the wizard's "add N more" hints both read this.
 */
export const FAMILY_TIERS = [
  { at: 3, rate: 0.15 },
  { at: 5, rate: 0.25 },
] as const;

export function familyDiscountRate(peopleCount: number): number {
  let rate = 0;
  for (const tier of FAMILY_TIERS) if (peopleCount >= tier.at) rate = tier.rate;
  return rate;
}

/** Next unreached tier for the wizard's upsell hint, or null at the top. */
export function nextFamilyTier(peopleCount: number) {
  return FAMILY_TIERS.find(tier => peopleCount < tier.at) ?? null;
}

/**
 * Compute the full USD breakdown. `codeDiscountUsd` is the promo-code amount
 * already validated and capped by `applyDiscountCode` (or 0 when no code).
 */
export function computeQuoteUsd(
  inputs: QuoteInputs,
  config: PricingConfig,
  codeDiscountUsd = 0,
): QuoteBreakdown {
  const perPerson = config.perPersonUsd[inputs.bodyType] ?? 25;
  const peopleSubtotal = inputs.peopleCount * perPerson;
  const discountRate = familyDiscountRate(inputs.peopleCount);
  const discount = peopleSubtotal * discountRate;
  const peopleAfterDiscount = peopleSubtotal - discount;

  const bgCost = inputs.background === 'custom'
    ? config.backgroundCustomUsd
    : inputs.background && inputs.background !== 'none'
      ? config.backgroundStandardUsd
      : 0;

  const subtotal = peopleAfterDiscount + bgCost;
  const expressSurcharge = inputs.express ? subtotal * config.expressSurchargePct : 0;
  const recordingCost = inputs.recording ? config.recordingUsd : 0;

  // Physical POD add-ons are priced flat per unit: the family-pack discount and
  // the express surcharge apply only to the artwork, never to the physical
  // products. Each unit can carry its own variant surcharge (e.g. shirt size).
  const units = sanitizeProductUnits(inputs.productUnits);
  const products = productKeysFromUnits(units);
  let productsCost = 0;
  for (const [key, list] of Object.entries(units)) {
    for (const sel of list) {
      productsCost += (config.podProductsUsd[key] ?? 0) + optionsSurchargeUsd(key, sel);
    }
  }

  const preCodeTotal = subtotal + expressSurcharge + recordingCost + productsCost;
  const codeDiscount = Math.min(Math.max(codeDiscountUsd, 0), preCodeTotal);

  return {
    perPerson,
    peopleSubtotal,
    discountRate,
    discount,
    bgCost,
    subtotal,
    expressSurcharge,
    recordingCost,
    productsCost,
    products,
    codeDiscount,
    preCodeTotal,
    total: preCodeTotal - codeDiscount,
  };
}
