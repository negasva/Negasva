# BUENAS PRÁCTICAS — Integridad de precios end-to-end

Léelas antes de tocar `app/api/checkout/**`, `app/api/pricing/**`,
`app/api/payments/**`, `lib/payments/**`, `lib/pricing/**` o `app/api/rates/**`.

1. **Nunca** confíes en NINGÚN monto ni multiplicador de monto enviado por el cliente:
   precio, subtotal, envío, descuento, tip Y la tasa de cambio (`rate`). Todo se
   recomputa o se obtiene server-side.
2. **Siempre** obtén la tasa de cambio USD→moneda local en el servidor (fuente:
   `app/api/rates`, cacheada). Nunca uses el `rate` del payload del cliente para
   convertir el cobro. Si por compatibilidad llega un `rate`, valídalo contra la tasa
   del servidor y recházalo si difiere más de ~2 %.
3. **Siempre** re-cotiza el envío con Printful a partir de `rateId` + dirección en el
   servidor; nunca aceptes un precio de envío del cliente. Si el `rateId` ya no existe,
   cae a una opción del servidor, no a un monto del cliente.
4. **Siempre** valida y acota los descuentos en el servidor contra la tabla
   `discount_codes` (activo, expiración, `max_uses`, `combinable`) y aplica
   `Math.min(Math.max(x,0), base)`. Nunca dejes que un descuento vuelva negativo el
   total ni supere la base.
5. **Siempre** genera `reference` / `custom_id` en el servidor (`newMpReference`).
   Nunca aceptes la referencia de pago del cliente.
6. **Siempre** crea la orden PayPal/MP con el total calculado por el servidor y guarda
   ese mismo total en `orders.amount_total`. El webhook y el paso de pago releen el
   monto de la DB, nunca del cliente.
7. **Siempre** unifica la política de redondeo (COP a miles, resto a centavos) en un
   helper compartido para que lo mostrado y lo cobrado coincidan.
8. **Siempre** añade una prueba: alterar `rate`, `currency`, `shipping.rateId`,
   `discountCode` y `productUnits` en el payload y verificar que el cobro final NO
   cambia respecto al cálculo server-side.
