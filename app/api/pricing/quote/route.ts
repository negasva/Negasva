import { NextResponse } from 'next/server';
import { z } from 'zod';
import { errorResponse, rateLimitByIp, readJson } from '@/lib/security/apiHelpers';
import { loadPricingConfig, applyDiscountCode } from '@/lib/pricing/server';
import { computeQuoteUsd } from '@/lib/pricing/calc';

/**
 * Authoritative price quote. The wizard sends only the user's selections and
 * receives the full USD breakdown back — it never does the arithmetic itself.
 * This is the same math the checkout endpoint uses, so the displayed total and
 * the charged total can never drift.
 */

const QuoteSchema = z.object({
  bodyType: z.string().min(1).max(40),
  peopleCount: z.number().int().min(1).max(8),
  background: z.string().max(60).default('none'),
  express: z.boolean().default(false),
  discountCode: z.string().max(40).optional(),
});

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
  const base = computeQuoteUsd(d, config, 0);

  let appliedCode: { code: string; type: 'percentage' | 'fixed'; value: number } | null = null;
  let codeDiscountUsd = 0;
  if (d.discountCode) {
    const applied = await applyDiscountCode(d.discountCode, base.preCodeTotal);
    if (applied) {
      appliedCode = { code: applied.code, type: applied.type, value: applied.value };
      codeDiscountUsd = applied.amountUsd;
    }
  }

  const quote = computeQuoteUsd(d, config, codeDiscountUsd);

  return NextResponse.json({
    ...quote,
    appliedCode, // null when the code was missing/invalid/expired/spent
  });
}
