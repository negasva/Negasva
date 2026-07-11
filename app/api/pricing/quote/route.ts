import { NextResponse } from 'next/server';
import { errorResponse, rateLimitByIp, readJson } from '@/lib/security/apiHelpers';
import { loadPricingConfig, applyDiscountCode } from '@/lib/pricing/server';
import { computeQuoteUsd } from '@/lib/pricing/calc';
import { QuoteSchema } from '@/lib/validation/order';

/**
 * Authoritative price quote. The wizard sends only the user's selections and
 * receives the full USD breakdown back — it never does the arithmetic itself.
 * This is the same math the checkout endpoint uses, so the displayed total and
 * the charged total can never drift.
 */

export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, { prefix: 'pricing-quote', max: 60, windowMs: 60_000 });
  if (rl) return rl;

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  const parsed = QuoteSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
  }

  const d = parsed.data;
  const config = await loadPricingConfig();

  // First pass (no code) to know the pre-code total the discount applies to.
  // La base "sin promos" (sin descuento por personas) es la que usan los
  // códigos no combinables, que anulan esa promoción al aplicarse.
  const base = computeQuoteUsd(d, config, 0);
  const baseNoPromos = computeQuoteUsd(d, config, 0, true);

  let appliedCode: { code: string; type: 'percentage' | 'fixed'; value: number } | null = null;
  let codeDiscountUsd = 0;
  let combinable = true;
  if (d.discountCode) {
    const applied = await applyDiscountCode(d.discountCode, base.preCodeTotal, baseNoPromos.preCodeTotal);
    if (applied) {
      appliedCode = { code: applied.code, type: applied.type, value: applied.value };
      codeDiscountUsd = applied.amountUsd;
      combinable = applied.combinable;
    }
  }

  const quote = computeQuoteUsd(d, config, codeDiscountUsd, !combinable);

  return NextResponse.json({
    ...quote,
    appliedCode, // null when the code was missing/invalid/expired/spent
  });
}
