# BUENAS PRÁCTICAS — Webhooks de pago

Léelas antes de tocar `app/api/webhooks/**`, `lib/payments/**` o cualquier flujo que
marque un pedido como pagado/reembolsado.

1. **Siempre** verifica la autenticidad del evento ANTES de tocar la DB: firma de
   PayPal (`verifyPayPalWebhook`), `constructEvent` de Stripe, checksum de Wompi, y
   para MP re-consulta el pago a la API (idealmente + firma `x-signature`).
2. **Nunca** proceses un webhook cuyo secreto de verificación no esté configurado.
   Falla cerrado: devuelve 400 y no toques el pedido. Nunca "procesa igual" si la
   verificación no está disponible.
3. **Siempre** coteja el importe y la moneda del evento contra `orders.amount_total` /
   `currency` antes de marcar `paid`. Si no coinciden, no marques pagado: registra y
   alerta.
4. **Siempre** haz el handler idempotente: lee el estado previo y acredita cupón
   (`recordDiscountCodeUse`) y envía notificación SOLO en la primera transición a
   `paid` (`wasPaid` guard). El mismo evento repetido no debe duplicar nada.
5. **Siempre** maneja los eventos de reversa (REFUNDED/REVERSED/DENIED, refund,
   dispute, VOIDED/charged_back), no solo el de pago completado.
6. **Siempre** casa el pedido por la referencia generada en el servidor
   (`provider_reference` / `custom_id` / `external_reference`), nunca por datos que el
   cliente pueda elegir.
7. **Siempre** separa el update de estado (crítico) del post-proceso (cupón, email):
   un fallo en el post-proceso no debe quedar enterrado en el `catch` global; reintenta
   o alerta de forma independiente.
8. **Siempre** mantén un job de reconciliación que revise los pedidos `pending`
   recientes contra la API del proveedor, para no perder pagos cuyo webhook se pierda.
9. **Siempre** compara firmas/checksums con `crypto.timingSafeEqual`.
10. **Nunca** pises `customer_email` (dato de contacto del pedido) con el email del
    pagador; usa una columna separada.
11. Si un proveedor legacy (Stripe/Wompi) deja de recibir eventos, elimina su ruta y
    secretos en lugar de dejar código de pago sin uso.
