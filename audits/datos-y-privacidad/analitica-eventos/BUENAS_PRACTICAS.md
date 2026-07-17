# Buenas prácticas — Analítica y eventos de negocio

Reglas permanentes para este proyecto. Léelas antes de tocar la integración de
GA, los eventos de `app/order/**` o el `purchase` de los webhooks.

- **Siempre** dispara el evento `purchase` desde el **servidor** (webhook, sobre
  el pedido confirmado) vía GA4 Measurement Protocol. El redirect del cliente se
  pierde a veces; el webhook es la fuente de verdad del monto.
- **Siempre** toma `value` y `currency` del pedido confirmado en la BD, nunca del
  estado del cliente. Este sitio cobra en 6 monedas: reporta la moneda correcta y
  valida contra un pedido real en cada release.
- **Siempre** incluye `transaction_id`, `value`, `currency` e `items` en
  `purchase`, y usa `transaction_id` para deduplicar si también emites algo en el
  cliente.
- **Siempre** instrumenta el funnel con eventos GA4 estándar por paso del wizard
  (`view_item`, `begin_checkout`, `add_shipping_info`, `add_payment_info`) para
  poder ver dónde se cae la gente.
- **Siempre** captura UTM/`gclid`/`fbclid` en la primera visita, persístelos y
  adjúntalos al pedido, para atribuir cada venta a su canal.
- **Siempre** que añadas un origen de analytics nuevo, actualiza la CSP
  (`script-src` y `connect-src` en `next.config.js`) y verifica que no la rompa
  (ya pasó con Ahrefs).
- **Nunca** dispares eventos de conversión desde la página de éxito confiando en
  que siempre carga; trátalo como refuerzo, no como la fuente principal.
- Carga GA/Ahrefs siempre condicionados a su env var (`NEXT_PUBLIC_GA_ID`,
  `NEXT_PUBLIC_AHREFS_KEY`) para no romper builds/entornos sin analytics.
