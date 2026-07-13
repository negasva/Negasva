# REPORTE — Integridad de precios end-to-end

**Fecha:** 2026-07-13 · **Auditor:** Claude Code (solo diagnóstico, sin cambios de código)

## 🚨 CRÍTICO — Bypass de pago vía tasa de cambio del cliente

**El campo `rate` (tasa de conversión USD→moneda local) se toma del payload del cliente
y multiplica TODO el cobro, sin validarse contra la tasa del servidor.** Un comprador
puede pagar una fracción del precio real eligiendo cualquier moneda distinta de USD.

- Evidencia:
  - `app/api/checkout/route.ts:83` — `const totalLocal = (quote.total + shippingUsd + tipUsd) * d.rate;`
  - `app/api/checkout/route.ts:193-197,248,260,277` — cada línea del cobro (PayPal y monto guardado) se multiplica por `d.rate`.
  - `lib/validation/order.ts:82` — `rate` solo se valida como `positive().finite().max(10_000)`; no se compara con la tasa real.
  - `app/order/useCheckout.ts:551` — el cliente envía `rate: rates[currency]`, valor que controla.
  - Existe fuente autoritativa server-side sin usar: `app/api/rates/route.ts`.
- Explotación: `POST /api/checkout` con `currency: 'mxn'` y `rate: 0.01` → un pedido de $100 USD se cobra ~1 MXN. El monto queda guardado en `orders.amount_total` (`checkout/route.ts:121,293`), así que **Mercado Pago también cobra el importe manipulado** aunque lo relea de la DB (`app/api/payments/mercadopago/route.ts:53-80`).
- Fix: ignorar `rate` del cliente; obtener la tasa server-side (reutilizar la lógica de `app/api/rates`, cacheada) y usar esa para todas las conversiones. Alternativa mínima: rechazar si `|rate_cliente − rate_servidor| / rate_servidor > 2%`. Quitar `rate` de `CheckoutSchema` como campo de confianza.
- Esfuerzo: S

**Notificado de inmediato — este es explotable ahora mismo en producción.**

---

## Checklist del prompt

| Punto | Resultado | Evidencia |
|---|---|---|
| Servidor recalcula todo el desglose sin confiar en montos del cliente | ⚠️ PARCIAL | Precio base, descuentos, add-ons y tip se recomputan server-side (`checkout/route.ts:42-83`, `computeQuoteUsd`). PERO la conversión de moneda usa `d.rate` del cliente (CRÍTICO arriba). |
| Envío re-cotizado en servidor con Printful por rateId + dirección | ✅ CUMPLE | `checkout/route.ts:185-215`: `listShippingOptions` re-cotiza con Printful; usa `opt.rateUsd`, nunca un precio del cliente; fallback a la más barata si el rateId ya no existe. |
| Descuento recalculado y acotado en servidor | ✅ CUMPLE | `lib/pricing/server.ts:125-154`: valida contra tabla `discount_codes` (activo, expiración, max_uses), acota `Math.min(Math.max(raw,0), base)` y respeta `combinable`. Cap adicional en la línea PayPal (`checkout/route.ts:277`). |
| Conversión de moneda con tasa del servidor | ❌ FALLA | Usa `d.rate` del navegador (`checkout/route.ts:83` y ss.). La tasa server-side de `app/api/rates` no se usa en el cobro. |
| Orden PayPal/MP con total del servidor y reference no manipulable | ✅ CUMPLE (excepto el monto) | `reference = newMpReference()` generado en servidor (`checkout/route.ts:114,287`); no viene del cliente. El importe, sin embargo, arrastra `d.rate` (CRÍTICO). |
| Prueba activa: payloads con montos alterados | ⚠️ PARCIAL | No hay campo de monto directo que el cliente pueda fijar (precio, envío, descuento, tip se recomputan) ✅ — salvo `rate`, que es efectivamente un multiplicador de monto controlado por el cliente ❌. |

---

## Hallazgos por severidad

### Crítico
**C1** — Ver 🚨 arriba: `rate` del cliente multiplica el cobro sin validación server-side. Esfuerzo S.

### Medio

**M1 — `orders.amount_total` se persiste ya contaminado por `d.rate`**
- Evidencia: `checkout/route.ts:83,121,293`.
- Riesgo: aunque MP relee el monto de la DB (defensa correcta contra manipulación en el segundo paso), ese monto ya nació manipulado en el primer paso; arreglar C1 también sana esto.
- Fix: al corregir C1, `amount_total` se calcula con la tasa del servidor.
- Esfuerzo: incluido en C1.

**M2 — Redondeo COP puede introducir centavos perdidos entre quote y cobro**
- Evidencia: `checkout/route.ts:101-103` (COP redondea hacia arriba a 1000; otras a centavos).
- Riesgo: divergencia menor entre lo mostrado y lo cobrado; no explotable pero puede generar disputas.
- Fix: unificar la política de redondeo en un helper compartido cliente/servidor.
- Esfuerzo: S

### Bajo

**B1 — `rate` permite hasta 10 000 sin límite inferior significativo**
- Evidencia: `lib/validation/order.ts:82`.
- Riesgo: además del bypass (C1), un `rate` enorme podría inflar el cobro (menos probable pero posible si se manipula a un tercero).
- Fix: al eliminar la confianza en `rate` (C1), este rango deja de importar.
- Esfuerzo: incluido en C1.

**B2 — Tasa de cambio con fallback estático potencialmente desactualizado**
- Evidencia: `app/api/rates/route.ts:6-13` (FALLBACK fijo).
- Riesgo: si la API externa falla, se cobra con tasas viejas; impacto de negocio, no de seguridad.
- Fix: alertar/loguear cuando se usa el fallback; refrescar los valores periódicamente.
- Esfuerzo: S

---

## Lo que ya está bien
- Pricing autoritativo: precio por persona, descuentos por familia, add-ons POD y tip se recomputan server-side desde tablas admin (`computeQuoteUsd`, `lib/pricing/*`).
- Envío re-cotizado con Printful; nunca se acepta el precio de envío del cliente.
- Códigos de descuento validados, acotados y con control de usos/combinabilidad en el servidor.
- `reference`/`custom_id` generados en el servidor, no manipulables.
- Mercado Pago relee `amount_total` de la DB en vez de confiar en el cliente (defensa en profundidad, buena práctica).

## Tabla resumen

| ID | Severidad | Hallazgo | Esfuerzo | Estado |
|---|---|---|---|---|
| C1 | 🚨 Crítico | `rate` del cliente multiplica el cobro sin validación server-side (bypass de pago) | S | Pendiente |
| M1 | Medio | `amount_total` se persiste contaminado por `d.rate` | (con C1) | Pendiente |
| M2 | Medio | Redondeo COP inconsistente entre quote y cobro | S | Pendiente |
| B1 | Bajo | Rango de `rate` sin cota útil | (con C1) | Pendiente |
| B2 | Bajo | Fallback de tasas estático sin alerta | S | Pendiente |
