# Auditoría · Conciliación de pedidos y reembolsos

**Sección:** Pagos y dinero · **Prioridad:** P1 · Importante (hazlo este mes)

Copia TODO lo que está debajo de la línea y pégalo en Claude Code, parado en la raíz del repo:

---

Haz una auditoría de **conciliación de pedidos y reembolsos** en este repo (negasva.shop: e-commerce
Next.js App Router + Supabase + pagos con PayPal y Mercado Pago + Printful para
productos físicos, desplegado en Vercel).

Por qué importa en este proyecto: Entre 'el cliente pagó' y 'el pedido aparece pagado en tu admin' hay varios puntos de falla. Sin conciliación, pierdes pedidos pagados (cliente furioso) o entregas pedidos no pagados (pérdida directa).

Zonas clave donde empezar (no te limites a ellas — explora lo relacionado):
- app/api/checkout/paypal/capture/route.ts
- app/checkout/success/page.tsx
- app/admin/(protected)/orders
- lib/notify/newOrder.ts

Revisa específicamente cada uno de estos puntos y márcalos como ✅ CUMPLE /
⚠️ PARCIAL / ❌ FALLA con evidencia (archivo:línea):
- Mapear todos los estados posibles de un pedido y verificar que cada transición esté cubierta (pending → paid → fulfilled / refunded / disputed).
- Qué ve el cliente si la captura falla después de aprobar en PayPal (¿página de error clara con referencia?).
- Qué pasa con pedidos 'pending' abandonados (limpieza, no contaminan métricas).
- Que el email de confirmación (Resend) solo se envíe con pago confirmado y no se duplique.
- Proceso documentado de reembolso: dónde se hace (dashboard PayPal/MP), cómo se refleja en la BD, quién avisa al cliente.

ENTREGABLES (no apliques fixes de código en esta pasada — solo audita y documenta):

1. `audits/pagos-y-dinero/conciliacion-pedidos/REPORTE.md` — hallazgos ordenados por severidad
   (crítico / alto / medio / bajo). Cada hallazgo con: evidencia (archivo:línea),
   explicación del riesgo en una frase, fix propuesto concreto, y esfuerzo estimado
   (S/M/L). Incluye al final una tabla-resumen con columna "Estado" para ir marcando.

2. `audits/pagos-y-dinero/conciliacion-pedidos/BUENAS_PRACTICAS.md` — reglas accionables y
   permanentes de conciliación de pedidos y reembolsos para ESTE proyecto, escritas en imperativo
   (ej. "Nunca X", "Siempre Y al tocar Z"), derivadas tanto de lo que ya se hace
   bien como de los fallos encontrados. Este archivo es la referencia que cualquier
   sesión futura de Claude Code debe seguir al tocar código de esta área.

3. Agrega (si no existe) una línea en `CLAUDE.md` bajo una sección
   "## Buenas prácticas por área" que diga: antes de tocar código relacionado con
   pagos y dinero, leer `audits/pagos-y-dinero/conciliacion-pedidos/BUENAS_PRACTICAS.md`.

4. Commit de los .md siguiendo el flujo de git definido en CLAUDE.md (commit, push,
   PR con auto-merge), sin tocar código de la app en esta tanda.

Si durante la auditoría encuentras algo CRÍTICO explotable ahora mismo (fuga de
datos, bypass de pago), márcalo al inicio del reporte con 🚨 y dímelo de inmediato
en tu respuesta, no lo dejes enterrado en el archivo.
