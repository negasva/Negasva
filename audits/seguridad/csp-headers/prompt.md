# Auditoría · CSP y headers de seguridad

**Sección:** Seguridad · **Prioridad:** P1 · Importante (hazlo este mes)

Copia TODO lo que está debajo de la línea y pégalo en Claude Code, parado en la raíz del repo:

---

Haz una auditoría de **csp y headers de seguridad** en este repo (negasva.shop: e-commerce
Next.js App Router + Supabase + pagos con PayPal y Mercado Pago + Printful para
productos físicos, desplegado en Vercel).

Por qué importa en este proyecto: Ya apareció un bug real: la CSP bloqueaba el SDK de PayPal (y el script de Ahrefs). Una CSP correcta es tu mejor defensa contra XSS, pero mal mantenida rompe funcionalidades de pago.

Zonas clave donde empezar (no te limites a ellas — explora lo relacionado):
- next.config.js (headers/csp)
- middleware.ts

Revisa específicamente cada uno de estos puntos y márcalos como ✅ CUMPLE /
⚠️ PARCIAL / ❌ FALLA con evidencia (archivo:línea):
- Que script-src, frame-src y connect-src incluyan exactamente los dominios que el sitio usa hoy: PayPal, Mercado Pago, reCAPTCHA, GA, Ahrefs, Supabase, exchangerate-api — y nada más.
- Que se elimine lo que ya no se usa (¿js.stripe.com sigue siendo necesario solo por el webhook legacy? el webhook no corre en el navegador).
- Que 'unsafe-inline' en script-src se evalúe: ¿se puede migrar a nonces/hashes con Next.js?
- Que HSTS, X-Content-Type-Options, Referrer-Policy, frame-ancestors y Permissions-Policy estén correctos (ya existen — verificar valores).
- Probar la pantalla de pago completa (PayPal y Mercado Pago) con la consola abierta: cero errores de CSP.

ENTREGABLES (no apliques fixes de código en esta pasada — solo audita y documenta):

1. `audits/seguridad/csp-headers/REPORTE.md` — hallazgos ordenados por severidad
   (crítico / alto / medio / bajo). Cada hallazgo con: evidencia (archivo:línea),
   explicación del riesgo en una frase, fix propuesto concreto, y esfuerzo estimado
   (S/M/L). Incluye al final una tabla-resumen con columna "Estado" para ir marcando.

2. `audits/seguridad/csp-headers/BUENAS_PRACTICAS.md` — reglas accionables y
   permanentes de csp y headers de seguridad para ESTE proyecto, escritas en imperativo
   (ej. "Nunca X", "Siempre Y al tocar Z"), derivadas tanto de lo que ya se hace
   bien como de los fallos encontrados. Este archivo es la referencia que cualquier
   sesión futura de Claude Code debe seguir al tocar código de esta área.

3. Agrega (si no existe) una línea en `CLAUDE.md` bajo una sección
   "## Buenas prácticas por área" que diga: antes de tocar código relacionado con
   seguridad, leer `audits/seguridad/csp-headers/BUENAS_PRACTICAS.md`.

4. Commit de los .md siguiendo el flujo de git definido en CLAUDE.md (commit, push,
   PR con auto-merge), sin tocar código de la app en esta tanda.

Si durante la auditoría encuentras algo CRÍTICO explotable ahora mismo (fuga de
datos, bypass de pago), márcalo al inicio del reporte con 🚨 y dímelo de inmediato
en tu respuesta, no lo dejes enterrado en el archivo.
