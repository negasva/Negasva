/**
 * Verificación server-side de reCAPTCHA v3. Antes el token se generaba en el
 * cliente pero NUNCA se validaba en el backend, así que los formularios estaban
 * de hecho sin protección. Esto cierra ese hueco.
 *
 * Comportamiento:
 *  - Si no hay secret configurado → se omite (devuelve true). Así dev y los
 *    entornos sin reCAPTCHA siguen funcionando.
 *  - Si hay secret y `required` (p. ej. newsletter) → exige token válido.
 *  - Si hay secret y NO `required` (p. ej. checkout) → valida el token cuando
 *    llega (bloquea score bajo), pero un token ausente no bloquea, para no
 *    perder ventas por adblockers/fallos de red. El rate-limit cubre ese caso.
 */

const SITEVERIFY = 'https://www.google.com/recaptcha/api/siteverify';

interface VerifyOpts {
  action?: string;
  minScore?: number;
  required?: boolean;
}

interface SiteVerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  'error-codes'?: string[];
}

export async function verifyRecaptcha(token: string | undefined, opts: VerifyOpts = {}): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY ?? process.env.RECAPTCHA_SECRET;
  if (!secret) return true; // no configurado → no bloquear

  if (!token) return opts.required ? false : true;

  try {
    const res = await fetch(SITEVERIFY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as SiteVerifyResponse;

    if (!data.success) return false;
    if (opts.action && data.action && data.action !== opts.action) return false;
    if (typeof data.score === 'number' && data.score < (opts.minScore ?? 0.5)) return false;
    return true;
  } catch (err) {
    console.error('[recaptcha] verify failed', err);
    // Error de red al verificar: no bloquear (salvo que sea estrictamente requerido).
    return opts.required ? false : true;
  }
}
