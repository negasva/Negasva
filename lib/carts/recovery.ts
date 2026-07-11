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
 * Crea un código único (PREFIJO-XXXXX) en `discount_codes` y lo devuelve. Si
 * choca con uno existente (constraint UNIQUE), reintenta con otro sufijo.
 * Devuelve null si no se pudo crear tras varios intentos.
 * `combinable: false` marca códigos que anulan el descuento por nº de
 * personas al aplicarse (lo valida el server en applyDiscountCode).
 */
export async function createRecoveryDiscount(
  db: SupabaseClient,
  opts: { type: DiscountType; value: number; expiresAt?: Date; prefix?: string; combinable?: boolean },
): Promise<RecoveryDiscount | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = `${opts.prefix ?? 'VUELVE'}-${randomSuffix()}`;
    const { error } = await db.from('discount_codes').insert({
      code,
      type: opts.type,
      value: opts.value,
      expires_at: opts.expiresAt ? opts.expiresAt.toISOString() : null,
      max_uses: 1,
      current_uses: 0,
      active: true,
      combinable: opts.combinable ?? true,
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
