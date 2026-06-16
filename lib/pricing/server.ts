import { createServiceClient } from '@/lib/supabase/server';
import {
  FALLBACK_PER_PERSON_USD,
  FALLBACK_BACKGROUND_STANDARD_USD,
  FALLBACK_BACKGROUND_CUSTOM_USD,
  FALLBACK_EXPRESS_SURCHARGE_PCT,
} from './fallbacks';

/**
 * Server-side pricing config, loaded from the DB tables the admin panel
 * manages (`prices`, `body_types`, `discount_codes`). Hardcoded values are
 * kept ONLY as a fallback if the DB is unreachable, so the admin panel is
 * the single source of truth.
 */

export interface PricingConfig {
  perPersonUsd: Record<string, number>; // by body_type slug
  backgroundStandardUsd: number;
  backgroundCustomUsd: number;
  expressSurchargePct: number; // 0.30 = 30%
}

const FALLBACK: PricingConfig = {
  perPersonUsd: { ...FALLBACK_PER_PERSON_USD },
  backgroundStandardUsd: FALLBACK_BACKGROUND_STANDARD_USD,
  backgroundCustomUsd: FALLBACK_BACKGROUND_CUSTOM_USD,
  expressSurchargePct: FALLBACK_EXPRESS_SURCHARGE_PCT / 100,
};

export async function loadPricingConfig(): Promise<PricingConfig> {
  const config: PricingConfig = {
    ...FALLBACK,
    perPersonUsd: { ...FALLBACK.perPersonUsd },
  };

  try {
    const db = createServiceClient();
    const [pricesRes, bodyTypesRes] = await Promise.all([
      db.from('prices').select('key, amount'),
      db.from('body_types').select('slug, price_usd').eq('is_active', true),
    ]);

    for (const row of bodyTypesRes.data ?? []) {
      const price = Number(row.price_usd);
      if (row.slug && Number.isFinite(price) && price > 0) {
        config.perPersonUsd[row.slug] = price;
      }
    }

    for (const row of pricesRes.data ?? []) {
      const amount = Number(row.amount);
      if (!Number.isFinite(amount) || amount < 0) continue;
      switch (row.key) {
        case 'background_standard':
          config.backgroundStandardUsd = amount;
          break;
        case 'background_custom':
          config.backgroundCustomUsd = amount;
          break;
        case 'express_surcharge_pct':
          config.expressSurchargePct = amount / 100;
          break;
      }
    }
  } catch (err) {
    console.error('[pricing] failed to load config from DB, using fallback:', err);
  }

  return config;
}

export interface AppliedDiscount {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  amountUsd: number; // discount applied, in USD, already capped
}

/**
 * Validate a discount code against the admin-managed `discount_codes` table.
 * Returns the applied discount or null if the code is invalid/expired/spent.
 */
export async function applyDiscountCode(
  code: string,
  subtotalUsd: number,
): Promise<AppliedDiscount | null> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  try {
    const db = createServiceClient();
    const { data, error } = await db
      .from('discount_codes')
      .select('id, code, type, value, expires_at, max_uses, current_uses, active')
      .eq('code', normalized)
      .maybeSingle();

    if (error || !data || !data.active) return null;
    if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) return null;
    if (data.max_uses != null && data.current_uses >= data.max_uses) return null;

    const value = Number(data.value);
    if (!Number.isFinite(value) || value <= 0) return null;

    const raw = data.type === 'percentage' ? subtotalUsd * (value / 100) : value;
    const amountUsd = Math.min(Math.max(raw, 0), subtotalUsd);
    if (amountUsd <= 0) return null;

    return { code: data.code, type: data.type, value, amountUsd };
  } catch (err) {
    console.error('[pricing] discount code lookup failed:', err);
    return null;
  }
}

/** Increment usage counter once a checkout session is actually created. */
export async function recordDiscountCodeUse(code: string): Promise<void> {
  try {
    const db = createServiceClient();
    const { data } = await db
      .from('discount_codes')
      .select('id, current_uses')
      .eq('code', code.trim().toUpperCase())
      .maybeSingle();
    if (!data) return;
    await db
      .from('discount_codes')
      .update({ current_uses: (data.current_uses ?? 0) + 1 })
      .eq('id', data.id);
  } catch (err) {
    console.error('[pricing] failed to record discount use:', err);
  }
}
