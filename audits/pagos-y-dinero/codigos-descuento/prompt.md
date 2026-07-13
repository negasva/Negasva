# Auditoría · Códigos de descuento y promociones

**Sección:** Pagos y dinero · **Prioridad:** P2 · Mejora (cuando lo anterior esté hecho)

Copia TODO lo que está debajo de la línea y pégalo en Claude Code, parado en la raíz del repo:

---

Haz una auditoría de **códigos de descuento y promociones** en este repo (negasva.shop: e-commerce
Next.js App Router + Supabase + pagos con PayPal y Mercado Pago + Printful para
productos físicos, desplegado en Vercel).

Por qué importa en este proyecto: Un código mal limitado (sin expiración, sin tope de usos, acumulable) es dinero que se escapa silenciosamente. También son objetivo de fuerza bruta.

Zonas clave donde empezar (no te limites a ellas — explora lo relacionado):
- app/api/pricing/quote (validación de códigos)
- webhook (registro de uso)
- supabase discount_codes

Revisa específicamente cada uno de estos puntos y márcalos como ✅ CUMPLE /
⚠️ PARCIAL / ❌ FALLA con evidencia (archivo:línea):
- Que cada código tenga: expiración, tope de usos totales, tope por cliente (si aplica) y estado activo/inactivo.
- Que el uso se registre SOLO con pago capturado (webhook), no al aplicarlo en el quote.
- Carrera: dos compras simultáneas con el último uso disponible de un código — ¿ambas pasan?
- Que el descuento esté capeado para nunca dejar el total en 0 o negativo.
- Que los códigos no sean adivinables en masa (rate limit + formato no secuencial).

ENTREGABLES (no apliques fixes de código en esta pasada — solo audita y documenta):

1. `audits/pagos-y-dinero/codigos-descuento/REPORTE.md` — hallazgos ordenados por severidad
   (crítico / alto / medio / bajo). Cada hallazgo con: evidencia (archivo:línea),
   explicación del riesgo en una frase, fix propuesto concreto, y esfuerzo estimado
   (S/M/L). Incluye al final una tabla-resumen con columna "Estado" para ir marcando.

2. `audits/pagos-y-dinero/codigos-descuento/BUENAS_PRACTICAS.md` — reglas accionables y
   permanentes de códigos de descuento y promociones para ESTE proyecto, escritas en imperativo
   (ej. "Nunca X", "Siempre Y al tocar Z"), derivadas tanto de lo que ya se hace
   bien como de los fallos encontrados. Este archivo es la referencia que cualquier
   sesión futura de Claude Code debe seguir al tocar código de esta área.

3. Agrega (si no existe) una línea en `CLAUDE.md` bajo una sección
   "## Buenas prácticas por área" que diga: antes de tocar código relacionado con
   pagos y dinero, leer `audits/pagos-y-dinero/codigos-descuento/BUENAS_PRACTICAS.md`.

4. Commit de los .md siguiendo el flujo de git definido en CLAUDE.md (commit, push,
   PR con auto-merge), sin tocar código de la app en esta tanda.

Si durante la auditoría encuentras algo CRÍTICO explotable ahora mismo (fuga de
datos, bypass de pago), márcalo al inicio del reporte con 🚨 y dímelo de inmediato
en tu respuesta, no lo dejes enterrado en el archivo.
