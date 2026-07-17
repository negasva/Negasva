# Buenas prácticas — Códigos de descuento y promociones

Reglas permanentes para este proyecto. Léelas antes de tocar `discount_codes`,
`lib/pricing/server.ts`, el quote o los webhooks.

- **Nunca** registres el uso de un código al aplicarlo en el quote. El uso se
  cuenta SOLO cuando el pago está capturado, en el webhook (patrón actual:
  `recordDiscountCodeUse` desde paypal/stripe/mercadopago/wompi). Mantenlo así.
- **Siempre** incrementa `current_uses` de forma atómica y condicional
  (`... WHERE current_uses < max_uses`), tratando 0 filas afectadas como código
  agotado. No hagas read-then-write.
- **Siempre** capea el descuento con `Math.min(Math.max(raw, 0), base)`. El total
  nunca puede quedar en 0 ni negativo.
- **Nunca** consultes la tabla `discount_codes` en crudo desde una ruta nueva.
  Toda validación (activo, expiración, tope) pasa por `applyDiscountCode`.
- **Siempre** valida los códigos con el rate limit específico `discount-try`
  (10/min por IP) además del rate limit general de la ruta. No lo quites.
- **Siempre** exige longitud mínima (≥8) y entropía al crear un código en el
  admin. Nada de códigos cortos o secuenciales.
- Si añades "uno por cliente", persiste el uso por email (tabla de usos o la
  señal `newsletter_subscribers.discount_code`) y valídalo en el quote y el
  checkout, no solo en el front.
- **Nunca** confíes en un `amountUsd` de descuento enviado por el cliente. El
  monto se recalcula en el servidor con `applyDiscountCode`.
