import type { SupabaseClient } from '@supabase/supabase-js';

// Generación de un código de descuento ÚNICO por carrito, insertado en la
// tabla admin `discount_codes` (misma que valida el checkout). Un solo uso y
// con caducidad, para que no se pueda revender ni reutilizar.

export type DiscountType = 'percentage' | 'fixed';

export interface RecoveryDiscount {
  code: string;
  type: DiscountType;
  value: number;
  label: string; // "10%" o "$10"
}

// Sin caracteres ambiguos (0/O, 1/I) para que sea fácil de teclear.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomSuffix(len = 5): string {
  let out = '';
  for (let i = 0; i < len; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return out;
}

export function discountLabel(type: DiscountType, value: number): string {
  return type === 'percentage' ? `${value}%` : `$${value}`;
}

/**
 * Crea un código único (VUELVE-XXXXX) en `discount_codes` y lo devuelve. Si
 * choca con uno existente (constraint UNIQUE), reintenta con otro sufijo.
 * Devuelve null si no se pudo crear tras varios intentos.
 */
export async function createRecoveryDiscount(
  db: SupabaseClient,
  opts: { type: DiscountType; value: number; expiresAt: Date },
): Promise<RecoveryDiscount | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = `VUELVE-${randomSuffix()}`;
    const { error } = await db.from('discount_codes').insert({
      code,
      type: opts.type,
      value: opts.value,
      expires_at: opts.expiresAt.toISOString(),
      max_uses: 1,
      current_uses: 0,
      active: true,
    });
    if (!error) {
      return { code, type: opts.type, value: opts.value, label: discountLabel(opts.type, opts.value) };
    }
    // 23505 = unique_violation → reintenta con otro código. Otros errores: aborta.
    if ((error as { code?: string }).code !== '23505') {
      console.error('[cart-recovery] discount insert failed:', error);
      return null;
    }
  }
  return null;
}
