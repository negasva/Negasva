# REPORTE — Webhooks de pago (PayPal / Mercado Pago / Stripe / Wompi)

**Fecha:** 2026-07-13 · **Auditor:** Claude Code (solo diagnóstico, sin cambios de código)

Sin 🚨 crítico explotable de forma aislada: los 4 webhooks verifican autenticidad y
fallan cerrados (rechazan) cuando falta el secreto. El hallazgo más importante es que
NINGÚN webhook coteja el monto del evento contra `orders.amount_total`, lo que combinado
con el C1 del item 4 (tasa de cambio del cliente) deja pasar el monto manipulado sin
segunda barrera. Segundo punto: no hay reconciliación para eventos perdidos, así que un
pedido pagado cuyo webhook se pierda queda en `pending` indefinidamente.

---

## Checklist del prompt

| Punto | Resultado | Evidencia |
|---|---|---|
| Verificación de firma activa en TODOS los webhooks; ¿qué hace si el secreto está vacío? | ✅ CUMPLE (fail-closed) | PayPal: `verifyPayPalWebhook` devuelve `false` si falta `PAYPAL_WEBHOOK_ID` (`lib/payments/paypal.ts:138-139`) y el handler responde 400 (`paypal/route.ts:14-15`). Stripe: `constructEvent` lanza si la firma/secreto no valida → 400 (`stripe/route.ts:50-54`). Wompi: `verifyWompiEvent` devuelve false sin `WOMPI_EVENTS_SECRET` → 400 (`wompi.ts:64-65`, `wompi/route.ts:27-29`). MP: no verifica firma HMAC pero re-consulta el pago a la API con el token (`mercadopago/route.ts:25-27`) — ver M1. |
| Idempotencia (evento doble no duplica pedidos/emails/uso de cupón) | ✅ CUMPLE | Todos leen `status` previo y usan `wasPaid` para acreditar cupón y enviar email solo en la primera transición a `paid` (`paypal:50-52,63`, `mercadopago:39,52`, `stripe:71-73,84`, `wompi:54,61`). El update de estado es idempotente (match por referencia). |
| Manejo de reversas (REFUNDED / DENIED / disputas) | ✅ CUMPLE | PayPal: REFUNDED/REVERSED/DISPUTE.CREATED (`paypal/route.ts:81-107`). Stripe: charge.refunded / dispute.created (`stripe/route.ts:125-147`). MP: refunded/charged_back → refunded (`mercadopago.ts:161-162`). Wompi: VOIDED → refunded (`wompi/route.ts:12`). |
| Cotejo del monto del evento contra el monto del pedido | ❌ FALLA | Ningún handler compara el importe pagado con `orders.amount_total`; marcan `paid` solo por coincidencia de `provider_reference` (`paypal:53-59`, `mercadopago:41-49`, `stripe:75-77`, `wompi:51-58`). |
| Webhooks legacy (Stripe/Wompi) verifican firma o se eliminan | ⚠️ PARCIAL | Ambos siguen verificando firma ✅, pero conviven con PayPal/MP activos sin señal de que aún reciban eventos; superficie a confirmar/eliminar. |
| Carrera captura vs webhook | ⚠️ PARCIAL | La orden se inserta como `pending` al crear el checkout (`checkout/route.ts:118,290`), así que el webhook siempre encuentra la fila. Pero no hay reconciliación si el evento se pierde (M2). |

---

## Hallazgos por severidad

### Alto

**A1 — Ningún webhook coteja el monto pagado contra `orders.amount_total`**
- Evidencia: `paypal/route.ts:53-79`, `mercadopago/route.ts:41-49`, `stripe/route.ts:66-77`, `wompi/route.ts:51-58` — todos matchean por referencia y marcan `paid` sin comparar importe/moneda del evento.
- Riesgo: un pago por un importe inferior al del pedido (captura parcial, importe alterado, o el importe ya contaminado por el C1 del item 4) marca el pedido como totalmente pagado.
- Fix: en cada transición a `paid`, comparar el importe capturado del evento (PayPal `amount`, Stripe `amount_total`, MP `transaction_amount`, Wompi `amount_in_cents`) y la moneda contra `orders.amount_total`/`currency`; si difieren, NO marcar `paid`, registrar y alertar.
- Esfuerzo: M

### Medio

**M1 — Mercado Pago sin verificación de firma HMAC (`x-signature`)**
- Evidencia: `mercadopago/route.ts:11-27` — no valida el header `x-signature`/`x-request-id`; confía únicamente en re-consultar el pago a la API.
- Riesgo: el re-fetch mitiga la falsificación (un id inventado no devuelve pago bajo nuestro token), pero un id de pago real filtrado podría dispararse por un tercero; además hay dependencia total de la disponibilidad de la API de MP.
- Fix: verificar la firma `x-signature` de MP (HMAC con `MERCADOPAGO_WEBHOOK_SECRET`) además del re-fetch.
- Esfuerzo: M

**M2 — Sin reconciliación de eventos perdidos: pedidos pagados atascados en `pending`**
- Evidencia: no existe cron/job de reconciliación; solo `app/api/cron/recover-carts` y `keepalive`.
- Riesgo: si un webhook se pierde (caída, timeout, deploy), el cliente paga pero su pedido queda `pending` para siempre y no se acredita el cupón ni se notifica.
- Fix: cron periódico que consulte a PayPal/MP el estado de los pedidos `pending` de las últimas 24–48 h y los reconcilie (idempotente).
- Esfuerzo: M

**M3 — Fallo de `notifyNewOrder`/`recordDiscountCodeUse` se traga dentro del try global**
- Evidencia: `paypal/route.ts:108-110`, etc. — el `catch` envuelve todo el handler y solo loguea; si `recordDiscountCodeUse` falla tras marcar `paid`, el uso del cupón no se registra y nadie se entera.
- Riesgo: descuadre en el conteo de usos de cupones; posible reutilización más allá de `max_uses`.
- Fix: separar el update de estado (crítico) del post-proceso (cupón/email) y reintentar/alertar el post-proceso de forma independiente.
- Esfuerzo: S

### Bajo

**B1 — Comparación de checksum de Wompi no es de tiempo constante**
- Evidencia: `lib/payments/wompi.ts:77` (`checksum === raw.signature.checksum...`).
- Riesgo: fuga teórica por timing (difícil en serverless).
- Fix: comparar con `crypto.timingSafeEqual`.
- Esfuerzo: S

**B2 — `customer_email` del pedido se sobrescribe con el email del pagador en cada evento MP/Wompi**
- Evidencia: `mercadopago/route.ts:46`, `wompi/route.ts:56`.
- Riesgo: si el email del pagador difiere del de contacto, se pisa el dato original; molestia operativa.
- Fix: escribir el email del pagador en una columna aparte (`payer_email`) en vez de pisar `customer_email`.
- Esfuerzo: S

**B3 — Webhooks legacy Stripe/Wompi posiblemente inactivos**
- Evidencia: `stripe/route.ts`, `wompi/route.ts` presentes junto a PayPal/MP.
- Riesgo: superficie de código de pago sin uso confirmado.
- Fix: confirmar si aún llegan eventos; si no, eliminar rutas y secretos asociados.
- Esfuerzo: S

---

## Lo que ya está bien
- Verificación de autenticidad activa y fail-closed en los 4 webhooks (rechazan sin secreto).
- PayPal verifica firma contra la API oficial; Stripe con `constructEvent`; Wompi con checksum SHA256; MP con re-fetch autenticado.
- Idempotencia correcta: cupón y email solo en la primera transición a `paid`.
- Cobertura completa de reversas y disputas en todos los proveedores.
- MP re-lee el importe autoritativo de la DB al crear el pago (`payments/mercadopago/route.ts:53-80`).
- El pedido se crea `pending` antes del pago, evitando la carrera "webhook sin fila".

## Tabla resumen

| ID | Severidad | Hallazgo | Esfuerzo | Estado |
|---|---|---|---|---|
| A1 | Alto | Ningún webhook coteja el monto pagado contra `amount_total` | M | Pendiente |
| M1 | Medio | MP sin verificación de firma HMAC (`x-signature`) | M | Pendiente |
| M2 | Medio | Sin reconciliación de eventos perdidos (pedidos atascados en `pending`) | M | Pendiente |
| M3 | Medio | Post-proceso (cupón/email) sin aislar del update de estado | S | Pendiente |
| B1 | Bajo | Checksum Wompi sin comparación en tiempo constante | S | Pendiente |
| B2 | Bajo | Email del pagador pisa `customer_email` | S | Pendiente |
| B3 | Bajo | Webhooks legacy Stripe/Wompi posiblemente inactivos | S | Pendiente |
