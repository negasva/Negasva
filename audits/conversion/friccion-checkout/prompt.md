# Auditoría · Fricción en el funnel de checkout

**Sección:** Conversión y UX de venta · **Prioridad:** P1 · Importante (hazlo este mes)

Copia TODO lo que está debajo de la línea y pégalo en Claude Code, parado en la raíz del repo:

---

Haz una auditoría de **fricción en el funnel de checkout** en este repo (negasva.shop: e-commerce
Next.js App Router + Supabase + pagos con PayPal y Mercado Pago + Printful para
productos físicos, desplegado en Vercel).

Por qué importa en este proyecto: El wizard tiene 5 pasos + subida de fotos + cálculo de envío. Cada punto de espera o confusión (como la ventana en blanco de PayPal que ya viste) es un carrito abandonado.

Zonas clave donde empezar (no te limites a ellas — explora lo relacionado):
- app/order/page.tsx
- app/order/useCheckout.ts
- components/ShippingCalculator
- analytics (GA)

Revisa específicamente cada uno de estos puntos y márcalos como ✅ CUMPLE /
⚠️ PARCIAL / ❌ FALLA con evidencia (archivo:línea):
- Mapear el funnel real con datos (GA): % que pasa de cada paso al siguiente, y dónde se abandona más.
- Cronometrar la subida de fotos con conexión móvil lenta: ¿hay indicador de progreso o parece colgado?
- Revisar cada estado de error del checkout: ¿el usuario siempre sabe qué pasó y qué hacer? (capture failed, upload failed, timeout).
- ¿Se puede pagar sin fotos y enviarlas después? Evaluar si eso reduce abandono.
- El botón 'Add 2 more and get 15% OFF' — ¿ayuda o distrae en el momento de pagar?
- Persistencia: si el usuario recarga la página en el paso 4, ¿pierde todo?

ENTREGABLES (no apliques fixes de código en esta pasada — solo audita y documenta):

1. `audits/conversion/friccion-checkout/REPORTE.md` — hallazgos ordenados por severidad
   (crítico / alto / medio / bajo). Cada hallazgo con: evidencia (archivo:línea),
   explicación del riesgo en una frase, fix propuesto concreto, y esfuerzo estimado
   (S/M/L). Incluye al final una tabla-resumen con columna "Estado" para ir marcando.

2. `audits/conversion/friccion-checkout/BUENAS_PRACTICAS.md` — reglas accionables y
   permanentes de fricción en el funnel de checkout para ESTE proyecto, escritas en imperativo
   (ej. "Nunca X", "Siempre Y al tocar Z"), derivadas tanto de lo que ya se hace
   bien como de los fallos encontrados. Este archivo es la referencia que cualquier
   sesión futura de Claude Code debe seguir al tocar código de esta área.

3. Agrega (si no existe) una línea en `CLAUDE.md` bajo una sección
   "## Buenas prácticas por área" que diga: antes de tocar código relacionado con
   conversión y ux de venta, leer `audits/conversion/friccion-checkout/BUENAS_PRACTICAS.md`.

4. Commit de los .md siguiendo el flujo de git definido en CLAUDE.md (commit, push,
   PR con auto-merge), sin tocar código de la app en esta tanda.

Si durante la auditoría encuentras algo CRÍTICO explotable ahora mismo (fuga de
datos, bypass de pago), márcalo al inicio del reporte con 🚨 y dímelo de inmediato
en tu respuesta, no lo dejes enterrado en el archivo.
