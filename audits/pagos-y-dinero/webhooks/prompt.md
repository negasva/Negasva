# Auditoría · Webhooks de pago (PayPal / Mercado Pago / legacy)

**Sección:** Pagos y dinero · **Prioridad:** P0 · Crítico (hazlo esta semana)

Copia TODO lo que está debajo de la línea y pégalo en Claude Code, parado en la raíz del repo:

---

Haz una auditoría de **webhooks de pago (paypal / mercado pago / legacy)** en este repo (negasva.shop: e-commerce
Next.js App Router + Supabase + pagos con PayPal y Mercado Pago + Printful para
productos físicos, desplegado en Vercel).

Por qué importa en este proyecto: El webhook es quien marca el pedido como pagado. Si la firma no se verifica, cualquiera puede marcar pedidos como pagados gratis; si un evento se pierde, un cliente paga y su pedido queda 'pending' para siempre.

Zonas clave donde empezar (no te limites a ellas — explora lo relacionado):
- app/api/webhooks/paypal/route.ts
- app/api/webhooks/mercadopago
- app/api/webhooks/stripe
- app/api/webhooks/wompi
- lib/payments/paypal.ts (verifyPayPalWebhook)

Revisa específicamente cada uno de estos puntos y márcalos como ✅ CUMPLE /
⚠️ PARCIAL / ❌ FALLA con evidencia (archivo:línea):
- Que la verificación de firma esté activa en TODOS los webhooks (PAYPAL_WEBHOOK_ID configurado en producción — si está vacío, verifyPayPalWebhook devuelve false: ¿qué hace entonces el handler, rechaza o procesa igual?).
- Idempotencia: que el mismo evento recibido dos veces no duplique pedidos, emails ni registro de uso de códigos.
- Que se manejen eventos de reversa: PAYMENT.CAPTURE.REFUNDED / DENIED / disputas, no solo COMPLETED.
- Que el webhook coteje el monto del evento contra el monto del pedido en BD (no solo la referencia).
- Que los webhooks legacy (Stripe/Wompi) sigan verificando firma o se eliminen si ya no llegan eventos.
- Qué pasa si el webhook llega ANTES que la captura del cliente termine (carrera capture vs webhook).

ENTREGABLES (no apliques fixes de código en esta pasada — solo audita y documenta):

1. `audits/pagos-y-dinero/webhooks/REPORTE.md` — hallazgos ordenados por severidad
   (crítico / alto / medio / bajo). Cada hallazgo con: evidencia (archivo:línea),
   explicación del riesgo en una frase, fix propuesto concreto, y esfuerzo estimado
   (S/M/L). Incluye al final una tabla-resumen con columna "Estado" para ir marcando.

2. `audits/pagos-y-dinero/webhooks/BUENAS_PRACTICAS.md` — reglas accionables y
   permanentes de webhooks de pago (paypal / mercado pago / legacy) para ESTE proyecto, escritas en imperativo
   (ej. "Nunca X", "Siempre Y al tocar Z"), derivadas tanto de lo que ya se hace
   bien como de los fallos encontrados. Este archivo es la referencia que cualquier
   sesión futura de Claude Code debe seguir al tocar código de esta área.

3. Agrega (si no existe) una línea en `CLAUDE.md` bajo una sección
   "## Buenas prácticas por área" que diga: antes de tocar código relacionado con
   pagos y dinero, leer `audits/pagos-y-dinero/webhooks/BUENAS_PRACTICAS.md`.

4. Commit de los .md siguiendo el flujo de git definido en CLAUDE.md (commit, push,
   PR con auto-merge), sin tocar código de la app en esta tanda.

Si durante la auditoría encuentras algo CRÍTICO explotable ahora mismo (fuga de
datos, bypass de pago), márcalo al inicio del reporte con 🚨 y dímelo de inmediato
en tu respuesta, no lo dejes enterrado en el archivo.
