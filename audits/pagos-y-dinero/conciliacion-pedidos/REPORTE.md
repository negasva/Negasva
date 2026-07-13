# REPORTE · Conciliación de pedidos y reembolsos

**Item 10/25 · P1 · Importante** · Auditoría solo-diagnóstico (sin cambios de código).
Fecha: 2026-07-13 · Alcance: webhooks de pago, `app/api/checkout/paypal/capture`, `app/checkout/success`, admin (`pedidos-pago`, `orders`), `lib/notify/*`, `app/api/track`, migraciones SQL.

---

## Mapa de estados encontrado

- **`orders.status` (pago, lo fija el webhook):** `pending` → `paid` | `failed` → `refunded` | `disputed`.
  - PayPal: `PAYMENT.CAPTURE.COMPLETED`→paid, `REFUNDED/REVERSED`→refunded, `CUSTOMER.DISPUTE.CREATED`→disputed (`app/api/webhooks/paypal/route.ts:40-106`).
  - MP: `approved`→paid, `rejected/cancelled`→failed, `refunded/charged_back`→refunded, resto→pending (`lib/payments/mercadopago.ts:156-165`).
- **`orders.production_status` (operación):** consultado por `/api/track` (`app/api/track/route.ts:35-52`).
- **Tabla admin "orders" manual** (CRUD propio con `pending/in_progress/delivered/cancelled`, `app/admin/(protected)/orders/page.tsx:151-154`) — ledger separado del de checkout (`pedidos-pago`).

## Checklist del prompt

| Punto | Estado | Evidencia |
|---|---|---|
| Todas las transiciones cubiertas (pending→paid→fulfilled/refunded/disputed) | ⚠️ PARCIAL | paid/failed/refunded/disputed cubiertos vía webhook; MP no distingue `charged_back` de `refunded` (H-05); sin transición si el webhook se pierde (H-01) |
| Qué ve el cliente si la captura falla tras aprobar | ❌ FALLA | Error genérico sin referencia (ver item 6 H-02, `useCheckout.ts:619-634`); success page no valida BD (item 6 H-01) |
| Pedidos `pending` abandonados (limpieza/métricas) | ❌ FALLA | Ningún cron ni SQL los expira; `recover-carts` opera sobre carritos, no orders (H-04) |
| Email de confirmación solo con pago confirmado y sin duplicar | ⚠️ PARCIAL | Al ADMIN: sí, con guard `wasPaid` anti-duplicado ✅ (`webhooks/paypal/route.ts:52,64-77`); al CLIENTE: no se envía nada pese a que la success page lo promete (H-03) |
| Proceso de reembolso documentado | ❌ FALLA | Cero documentación operativa; solo el webhook marca `refunded` si el reembolso se hace en el dashboard del proveedor (H-06) |

---

## Hallazgos

### 🟠 ALTO

#### H-01 · Los webhooks devuelven 200 aunque la actualización de la BD falle → pedido pagado que queda `pending` para siempre
- **Evidencia:** `app/api/webhooks/paypal/route.ts:108-112` — el `catch` solo hace `console.error` y la función devuelve `{ received: true }` 200; `app/api/webhooks/mercadopago/route.ts:69-72` — idéntico. Con 200, el proveedor NO reintenta el evento.
- **Riesgo:** un hipo de Supabase en el momento del webhook = cliente pagó, pedido queda `pending`, nadie se entera (el email al admin tampoco sale porque está dentro del mismo try).
- **Fix propuesto:** si el update de BD falla, responder 500 para que PayPal/MP reintenten (ambos reintentan con backoff); mantener 200 solo para eventos que no aplican.
- **Esfuerzo:** S

#### H-02 · No existe conciliación de respaldo: si el webhook se pierde, nada re-verifica los `pending`
- **Evidencia:** el estado autoritativo lo fija solo el webhook (`app/api/checkout/paypal/capture/route.ts:6-9` lo dice explícito; la captura no actualiza la BD); no hay ningún cron que consulte a PayPal/MP por pedidos `pending` viejos (`vercel.json` solo tiene keepalive y recover-carts).
- **Riesgo:** webhook mal configurado, caído o perdido = pedidos cobrados que jamás aparecen pagados en el admin (cliente furioso) — el punto exacto que motiva esta auditoría.
- **Fix propuesto:** cron diario `reconcile-orders`: para cada `pending` de >1 h con `provider_reference`, consultar la API del proveedor (PayPal Orders API / `fetchMpPayment` ya existe) y aplicar la misma transición que el webhook; alertar al admin si encuentra desajustes.
- **Esfuerzo:** M

#### H-03 · El cliente nunca recibe email de confirmación (la success page lo promete)
- **Evidencia:** `lib/notify/newOrder.ts:34-37` envía solo a `ADMIN_NOTIFY_EMAIL`; no hay ningún `sendEmail` al `customer_email` tras `paid`; `app/checkout/success/page.tsx:206` promete "Te enviaremos un email de confirmación pronto".
- **Riesgo:** sin comprobante, el cliente no tiene referencia para reclamar/rastrear → tickets, disputas "no reconozco el cargo" y desconfianza.
- **Fix propuesto:** en la primera transición a `paid` (mismo guard `wasPaid`), enviar email al cliente con referencia, resumen y link a `/track-order?ref=…` usando `lib/notify/email.ts` ya existente.
- **Esfuerzo:** M

### 🟡 MEDIO

#### H-04 · Pedidos `pending` abandonados se acumulan para siempre
- **Evidencia:** cada intento de checkout crea una orden pending (`app/api/checkout/route.ts` persiste antes de devolver el orderID); no existe expiración (`expired`/`abandoned`) ni limpieza en cron o migraciones.
- **Riesgo:** el listado de `pedidos-pago` se llena de basura, dificulta detectar los pending REALES (los de H-02) y contamina cualquier métrica de conversión.
- **Fix propuesto:** job que marque `expired` los `pending` >48 h sin transacción (tras pasar la conciliación de H-02), y filtro por defecto en el admin que los oculte.
- **Esfuerzo:** S/M

#### H-05 · Contracargos de MP quedan como `refunded` (pierden la señal de disputa)
- **Evidencia:** `lib/payments/mercadopago.ts:161-162` — `charged_back` → `refunded`; PayPal en cambio distingue `disputed` (`webhooks/paypal/route.ts:95-106`).
- **Riesgo:** una disputa exige respuesta con plazo (subir evidencia); disfrazada de reembolso pasa desapercibida y se pierde por default.
- **Fix propuesto:** mapear `charged_back` → `disputed` y notificar al admin en esa transición.
- **Esfuerzo:** S

#### H-06 · Proceso de reembolso sin documentar (solo existe la mitad técnica)
- **Evidencia:** ninguna doc operativa en el repo (`docs/`, README) sobre dónde reembolsar (dashboard PayPal/MP), qué pasa en la BD (el webhook marca `refunded` solo para PayPal y MP; el admin no tiene botón de reembolso) ni quién avisa al cliente (nadie: no hay email de reembolso).
- **Riesgo:** cada reembolso es improvisado; si se hace fuera del dashboard correcto la BD queda inconsistente y el cliente sin confirmación.
- **Fix propuesto:** documento `docs/reembolsos.md` con el runbook (dónde ejecutar el refund por proveedor, verificación de que el webhook marcó `refunded`, plantilla de email al cliente) + a futuro email automático en la transición a `refunded`.
- **Esfuerzo:** S (doc) / M (email)

#### H-07 · Guard anti-duplicado con carrera (leer-luego-escribir sin lock)
- **Evidencia:** `webhooks/paypal/route.ts:46-64` y `webhooks/mercadopago/route.ts:33-53` — `wasPaid` se lee con un SELECT previo; dos entregas concurrentes del mismo evento pueden leer ambas `pending` y acreditar el cupón / notificar dos veces.
- **Riesgo:** bajo en frecuencia (requiere reintento concurrente) pero real: doble uso de cupón y doble email admin.
- **Fix propuesto:** transición atómica: `UPDATE … SET status='paid' WHERE … AND status != 'paid' RETURNING id` y ejecutar cupón/notificación solo si la fila fue afectada.
- **Esfuerzo:** S

### 🟢 BAJO

#### H-08 · Dos ledgers de pedidos separados (checkout vs manual) sin vínculo
- **Evidencia:** admin `orders` (CRUD manual, estados `pending/in_progress/delivered/cancelled`) y `pedidos-pago` (orders de checkout con estados de pago) son vistas/tablas distintas.
- **Riesgo:** confusión operativa: el mismo pedido puede existir en ambos mundos con estados que no se hablan.
- **Fix propuesto:** documentar cuál es la fuente de verdad de producción y (a futuro) unificar o enlazar por referencia.
- **Esfuerzo:** M

#### H-09 · Lo que ya está bien (preservar)
- Idempotencia del cupón y del email admin vía `wasPaid` en ambos webhooks ✅ (mejorable por H-07, pero el diseño es correcto).
- Verificación de firma PayPal (`verify-webhook-signature` + `PAYPAL_WEBHOOK_ID`) y autenticación implícita de MP (consulta el pago a la API con el access token) ✅.
- `notifyNewOrder`/`sendEmail` nunca lanzan: un fallo de correo no rompe el webhook ✅ (`lib/notify/newOrder.ts:1-3`).
- `/api/track` exige referencia + email y no filtra existencia (404 uniforme) ✅ (`app/api/track/route.ts:29-43`).
- El estado autoritativo lo fija el webhook, no el navegador del cliente ✅ (diseño correcto; le falta el respaldo de H-02).
- Disputas PayPal marcadas `disputed` por `provider_transaction_id` ✅.

---

## Tabla resumen

| ID | Severidad | Hallazgo | Esfuerzo | Estado |
|---|---|---|---|---|
| H-01 | Alto | Webhooks devuelven 200 con BD fallida (evento perdido) | S | Pendiente |
| H-02 | Alto | Sin conciliación de respaldo para pendings pagados | M | Pendiente |
| H-03 | Alto | Cliente sin email de confirmación (promesa incumplida) | M | Pendiente |
| H-04 | Medio | Pendings abandonados sin expirar (métricas sucias) | S/M | Pendiente |
| H-05 | Medio | Chargeback MP mapeado como refunded | S | Pendiente |
| H-06 | Medio | Proceso de reembolso sin runbook ni email al cliente | S/M | Pendiente |
| H-07 | Medio | Carrera en el guard anti-duplicado de webhooks | S | Pendiente |
| H-08 | Bajo | Dos ledgers de pedidos sin vínculo | M | Pendiente |
| H-09 | — | Diseño webhook-autoritativo e idempotencia (preservar) | — | N/A |
