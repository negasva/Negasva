# BUENAS PRÁCTICAS · Conciliación de pedidos y reembolsos (negasva.shop)

1. **El webhook es la única fuente de verdad del estado de pago.** Nunca marques `paid` desde el navegador, la success page ni la respuesta de captura. Lo que sí debe existir siempre: un respaldo de conciliación (cron) que re-verifique los `pending` viejos contra la API del proveedor.
2. En un webhook, si la actualización de la BD falla, responde **5xx** para que el proveedor reintente. Responde 200 solo cuando el evento se procesó o legítimamente no aplica. Jamás tragues el error y devuelvas `received: true`.
3. Toda transición a `paid` debe ser **atómica e idempotente**: `UPDATE … WHERE status != 'paid' RETURNING`, y los efectos secundarios (cupón, emails) solo si la fila cambió. No uses SELECT-luego-UPDATE para deduplicar.
4. Efectos secundarios de pago (emails, cupones, notificaciones) **nunca lanzan**: mantén el patrón de `lib/notify/*` (no-op + log en fallo). Un email caído no puede tumbar un webhook.
5. Estados canónicos de `orders.status`: `pending → paid | failed`, `paid → refunded | disputed`, más `expired` para pendings abandonados (cuando exista). Si añades un estado, actualiza webhooks, admin (`pedidos-pago`), `/api/track` y este documento en el mismo PR.
6. Un contracargo/disputa NUNCA se mapea como reembolso: `charged_back`/dispute → `disputed` (tiene plazos de respuesta); `refunded` es solo devolución voluntaria.
7. Reembolsos: se ejecutan en el dashboard del proveedor (PayPal/MP), se verifica que el webhook dejó la orden en `refunded`, y se avisa al cliente. Si el runbook `docs/reembolsos.md` no existe todavía, créalo antes de procesar el primer reembolso "a mano".
8. Toda promesa hecha en la UI debe tener backend: si la success page dice "te enviaremos un email", ese email tiene que existir. No agregues copy de confirmaciones/notificaciones sin su implementación.
9. Verificación de firma en webhooks es innegociable (PayPal `verify-webhook-signature`; MP re-consultando el pago a su API). Nunca proceses un evento sin autenticar su origen.
10. El cliente siempre debe poder autoservirse el estado: mantén `/api/track` exigiendo referencia + email, con 404 uniforme (sin filtrar existencia de pedidos).
11. Al depurar un "pedido fantasma": primero el dashboard del proveedor (¿existe el cobro?), luego `orders` por `provider_reference`, luego los logs del webhook. El dinero real vive en el proveedor; la BD es el espejo.
