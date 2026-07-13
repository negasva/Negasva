# Auditoría · Bundle JS y peso del checkout

**Sección:** Rendimiento · **Prioridad:** P1 · Importante (hazlo este mes)

Copia TODO lo que está debajo de la línea y pégalo en Claude Code, parado en la raíz del repo:

---

Haz una auditoría de **bundle js y peso del checkout** en este repo (negasva.shop: e-commerce
Next.js App Router + Supabase + pagos con PayPal y Mercado Pago + Printful para
productos físicos, desplegado en Vercel).

Por qué importa en este proyecto: app/order/page.tsx tiene ~39 KB de código fuente y carga los SDKs de PayPal, Mercado Pago, reCAPTCHA y compresión de imágenes. Cada KB de JS en el checkout es fricción justo antes de pagar.

Zonas clave donde empezar (no te limites a ellas — explora lo relacionado):
- app/order/page.tsx
- app/order/useCheckout.ts
- imports de @paypal/react-paypal-js y SDK MP
- next build (analyze)

Revisa específicamente cada uno de estos puntos y márcalos como ✅ CUMPLE /
⚠️ PARCIAL / ❌ FALLA con evidencia (archivo:línea):
- Correr @next/bundle-analyzer y mapear qué pesa el chunk de /order.
- Que el SDK de Mercado Pago solo cargue cuando currency === 'COP' (y PayPal solo en el paso 5, no antes).
- Que browser-image-compression siga siendo import dinámico (lo es) y no se cuele en el bundle inicial.
- Buscar librerías duplicadas o pesadas innecesarias (iconos completos vs tree-shaking de lucide).
- Revisar que GA/Ahrefs usen estrategia afterInteractive/lazyOnload y no bloqueen.

ENTREGABLES (no apliques fixes de código en esta pasada — solo audita y documenta):

1. `audits/rendimiento/bundle-checkout/REPORTE.md` — hallazgos ordenados por severidad
   (crítico / alto / medio / bajo). Cada hallazgo con: evidencia (archivo:línea),
   explicación del riesgo en una frase, fix propuesto concreto, y esfuerzo estimado
   (S/M/L). Incluye al final una tabla-resumen con columna "Estado" para ir marcando.

2. `audits/rendimiento/bundle-checkout/BUENAS_PRACTICAS.md` — reglas accionables y
   permanentes de bundle js y peso del checkout para ESTE proyecto, escritas en imperativo
   (ej. "Nunca X", "Siempre Y al tocar Z"), derivadas tanto de lo que ya se hace
   bien como de los fallos encontrados. Este archivo es la referencia que cualquier
   sesión futura de Claude Code debe seguir al tocar código de esta área.

3. Agrega (si no existe) una línea en `CLAUDE.md` bajo una sección
   "## Buenas prácticas por área" que diga: antes de tocar código relacionado con
   rendimiento, leer `audits/rendimiento/bundle-checkout/BUENAS_PRACTICAS.md`.

4. Commit de los .md siguiendo el flujo de git definido en CLAUDE.md (commit, push,
   PR con auto-merge), sin tocar código de la app en esta tanda.

Si durante la auditoría encuentras algo CRÍTICO explotable ahora mismo (fuga de
datos, bypass de pago), márcalo al inicio del reporte con 🚨 y dímelo de inmediato
en tu respuesta, no lo dejes enterrado en el archivo.
