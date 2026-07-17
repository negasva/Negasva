# REPORTE — Monitoreo, logging y alertas

**Fecha:** 2026-07-16 · **Auditor:** Claude Code (solo diagnóstico, análisis de
código; la existencia de un UptimeRobot/monitor externo no es verificable desde el
repo — marcado como "verificar en operación").

---

## Hallazgos

### 🔴 Severidad ALTA

**A1 — No existe error tracking (Sentry o similar) ni en server ni en cliente**
- Evidencia: no hay ninguna dependencia ni import de Sentry/tracking (búsqueda de `sentry` sin resultados). Todo error server-side termina en `console.error` centralizado en `lib/security/apiHelpers.ts:63` (`errorResponse`), que solo escribe a los logs de la función serverless.
- Riesgo: los errores de producción son invisibles — nadie lee los logs de Vercel a tiempo; un fallo en checkout o en un webhook puede estar días activo sin que se note.
- Fix propuesto: integrar Sentry (server + client) con alertas por email/Slack; enganchar `errorResponse` para reportar además de loguear. Presupuesto free tier suficiente para este volumen.
- Esfuerzo: **M**

**A2 — Los eventos que cuestan dinero solo hacen `console.error`, sin alerta**
- Evidencia: en `app/api/webhooks/paypal/route.ts`, un descuadre de importe (`:64` "amount mismatch"), un fallo de post-proceso (`:99`) y un fallo del handler (`:132`) solo se loguean; el cron de recuperación de carritos devuelve el error como JSON sin alertar (`app/api/cron/recover-carts/route.ts:69`). No hay un "notifyFailure" análogo a `notifyNewOrder`.
- Riesgo: un webhook roto, una captura fallida o un descuadre de precio pierden pedidos/dinero en silencio.
- Fix propuesto: en cada `catch` crítico (webhooks, captura, cron) enviar una alerta inmediata (Resend/Slack) con la referencia del pedido; reutilizar la infraestructura de `lib/notify`.
- Esfuerzo: **S–M**

### 🟠 Severidad MEDIA

**M1 — Sin alerta de pedidos `pending` viejos (pago iniciado que el webhook nunca confirmó)**
- Evidencia: no hay cron que barra `orders` en estado `pending` con antigüedad y avise; `vercel.json` solo programa `keepalive` y `recover-carts`.
- Riesgo: un pedido pagado cuyo webhook falló queda `pending` para siempre sin que nadie lo concilie (enlaza con el item 10, conciliación).
- Fix propuesto: cron diario que alerte pedidos `pending` con > N horas para revisión manual/reconciliación.
- Esfuerzo: **M**

**M2 — Sin uptime monitoring del sitio ni del endpoint de checkout**
- Evidencia: existe `/api/keepalive` (`app/api/keepalive/route.ts`) pero su función es evitar la pausa del plan free de Supabase, no alertar de caídas; no hay evidencia de un monitor externo con alertas.
- Riesgo: una caída de `/` o de `/api/pricing/quote` (checkout) puede pasar inadvertida hasta que un cliente se queja.
- Fix propuesto: UptimeRobot (o similar) monitorizando `/` y un endpoint de checkout, con alerta a email; opcionalmente apuntar también a `/api/keepalive` cuyo `{ok:true}` ya valida BD. (verificar en operación)
- Esfuerzo: **S** (config externa)

**M3 — Posible PII en logs de error**
- Evidencia: `errorResponse` loguea el objeto interno completo (`apiHelpers.ts:62-64`), que puede incluir payloads de Supabase; `app/api/checkout/route.ts:200` loguea el error de "resolve names" (nombres de clientes).
- Riesgo: datos personales (nombres/emails) acabando en los logs de Vercel, accesibles a quien tenga acceso al panel.
- Fix propuesto: evitar volcar objetos con PII; loguear solo la referencia del pedido y un código de error, no el payload completo.
- Esfuerzo: **S**

### 🟡 Severidad BAJA

**B1 — Logs sin correlación (no hay request id)**
- Evidencia: los logs incluyen contexto parcial (el webhook loguea la referencia, `paypal/route.ts:64`), pero no hay un identificador de request que hile todos los logs de una misma operación.
- Riesgo: investigar un caso puntual exige adivinar qué líneas pertenecen a la misma petición.
- Fix propuesto: incluir la referencia de pedido (o un request-id) de forma consistente en todos los logs críticos.
- Esfuerzo: **S**

### ✅ Lo que ya está bien (mantener)

- **`errorResponse` centraliza el logging server-side y NO filtra el detalle al cliente** (`apiHelpers.ts:57-66`) — evita fuga de esquema/constraints ✅.
- **Notificación de pedido pagado por Resend** (`lib/notify/newOrder.ts`) — hay una señal proactiva de éxito ✅ (falta el equivalente para fallos, A2).
- **Keepalive con query real** contra la BD y `Cache-Control: no-store`, que evita que un 200 cacheado invalide el propósito (`app/api/keepalive/route.ts:69-71`) ✅.
- **Escapado de datos del cliente en el email de notificación** (`newOrder.ts:23-30`) — sin XSS almacenado hacia el admin ✅.

## Checklist del prompt

| Punto | Estado | Evidencia |
|---|---|---|
| Error tracking (Sentry) en server y cliente | ❌ FALLA — no existe | A1 |
| Alertas activas en eventos que cuestan dinero | ❌ FALLA — solo console.error | A2 |
| Logs con contexto (referencia de pedido) | ⚠️ PARCIAL — a veces sí, sin correlación consistente | B1 |
| Uptime monitoring del sitio y del checkout | ⚠️ VERIFICAR — no en repo; keepalive ≠ uptime | M2 |
| ¿Se filtran datos personales a los logs? | ⚠️ PARCIAL — riesgo en errorResponse/checkout | M3 |

## Tabla-resumen (para marcar al arreglar)

| ID | Severidad | Hallazgo | Esfuerzo | Estado |
|---|---|---|---|---|
| A1 | 🔴 Alta | Sin error tracking (Sentry) | M | Pendiente |
| A2 | 🔴 Alta | Eventos de dinero sin alerta | S/M | Pendiente |
| M1 | 🟠 Media | Sin alerta de pedidos pending viejos | M | Pendiente |
| M2 | 🟠 Media | Sin uptime monitoring con alerta | S | Pendiente |
| M3 | 🟠 Media | Posible PII en logs | S | Pendiente |
| B1 | 🟡 Baja | Logs sin correlación (request id) | S | Pendiente |
</content>
