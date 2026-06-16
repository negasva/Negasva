import { NextResponse } from 'next/server';
import { z } from 'zod';
import { errorResponse, rateLimitByIp, readJson } from '@/lib/security/apiHelpers';
import { applyDiscountCode } from '@/lib/pricing/server';

const ValidateSchema = z.object({
  code: z.string().trim().min(2).max(40),
  subtotal: z.number().finite().positive().max(100_000),
});

export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, { prefix: 'dc-validate', max: 15, windowMs: 60_000 });
  if (rl) return rl;

  const body = await readJson(request);
  if (!body) return errorResponse('Invalid body', 400);

  const parsed = ValidateSchema.safeParse(body);
  if (!parsed.success) return errorResponse('Invalid input', 400);

  const applied = await applyDiscountCode(parsed.data.code, parsed.data.subtotal);
  if (!applied) return NextResponse.json({ valid: false });

  return NextResponse.json({
    valid: true,
    code: applied.code,
    type: applied.type,
    value: applied.value,
    amount: applied.amountUsd,
  });
}
