import type { PricingConfig } from './server';

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
}

export interface QuoteBreakdown {
  perPerson: number;
  peopleSubtotal: number;
  discountRate: number;   // 0.15 = 15% family pack discount
  discount: number;       // family discount amount
  bgCost: number;
  subtotal: number;       // after family discount + background
  expressSurcharge: number;
  codeDiscount: number;   // promo code discount (already capped)
  preCodeTotal: number;   // subtotal + express, before promo code
  total: number;
}

/** Family pack discount by head count. Mirrored nowhere else — this is it. */
export function familyDiscountRate(peopleCount: number): number {
  if (peopleCount >= 5) return 0.25;
  if (peopleCount >= 3) return 0.15;
  return 0;
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
  const preCodeTotal = subtotal + expressSurcharge;
  const codeDiscount = Math.min(Math.max(codeDiscountUsd, 0), preCodeTotal);

  return {
    perPerson,
    peopleSubtotal,
    discountRate,
    discount,
    bgCost,
    subtotal,
    expressSurcharge,
    codeDiscount,
    preCodeTotal,
    total: preCodeTotal - codeDiscount,
  };
}
