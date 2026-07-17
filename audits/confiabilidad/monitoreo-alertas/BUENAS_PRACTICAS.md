# BUENAS PRÁCTICAS — Monitoreo, logging y alertas (negasva.shop)

Hoy los errores viven en `console.error` de funciones serverless que nadie lee.
Sin alertas, un webhook roto pierde pedidos días sin que lo notes. Al tocar
manejo de errores, webhooks, crons o cualquier ruta que mueva dinero:

1. **Todo error server-side pasa por `errorResponse`, y este nunca filtra el
   detalle interno al cliente.** Mantén el patrón de `lib/security/apiHelpers.ts`:
   mensaje público genérico + log server-side. No devuelvas mensajes de Supabase al
   navegador.

2. **Todo evento que cuesta dinero, además de loguear, ALERTA.** Descuadre de
   importe, captura fallida, webhook que revienta, cron que falla: envía una alerta
   inmediata (Resend/Slack) con la referencia del pedido. `console.error` a solas no
   cuenta como alerta.

3. **Nunca loguees objetos con datos personales.** No vuelques payloads completos
   ni objetos con nombre/email/dirección a los logs. Loguea la referencia del pedido
   y un código de error, nada más.

4. **Todo log crítico incluye la referencia del pedido.** Para poder reconstruir un
   caso puntual, cada línea de log de webhooks/checkout/captura lleva la referencia
   (o un request-id) de forma consistente.

5. **Cuando exista Sentry, engánchalo en `errorResponse` y en el `ErrorBoundary`
   del cliente.** El objetivo es que ningún error de producción sea invisible; no
   dependas de que alguien abra los logs de Vercel.

6. **El keepalive es para mantener viva la BD, no es monitoreo de uptime.** No
   confundas `/api/keepalive` con alerta de caídas; el uptime se vigila con un
   monitor externo sobre `/` y un endpoint de checkout.

7. **Añade un cron de reconciliación para pedidos `pending` viejos.** Un pago cuyo
   webhook falló no debe quedar `pending` en silencio; que un cron lo detecte y
   alerte para revisión manual.

8. **La notificación de éxito ya existe (`notifyNewOrder`); crea su gemela de
   fallo.** Al tocar `lib/notify`, mantén escapado el contenido del cliente
   (anti-XSS hacia el admin) y reutiliza esa infraestructura para las alertas de
   error.
</content>
