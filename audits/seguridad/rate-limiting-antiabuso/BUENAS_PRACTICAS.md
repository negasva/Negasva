# BUENAS PRÁCTICAS · Rate limiting y anti-abuso (negasva.shop)

1. **Siempre** que crees una ruta nueva en `app/api/**`, añade `rateLimitByIp` con prefijo propio como PRIMERA línea del handler. Sin excepciones: hasta los endpoints "baratos" llevan límite (uniformidad = nada se olvida).
2. Valores de referencia por sensibilidad: lecturas públicas 60/min; escrituras/costosos 10–30/min; login admin ≤10/min; newsletter ≤5/min; pagos 15–20/min. Justifica en comentario cualquier valor mayor.
3. **Nunca** confíes en el primer hop de `X-Forwarded-For` para identificar al cliente: en Vercel usa `x-vercel-forwarded-for` / `request.ip`. El primer hop lo controla el atacante.
4. El rate limiting real en serverless SOLO existe con Upstash: mantén `UPSTASH_REDIS_REST_URL/TOKEN` configurados en Vercel Production. Si tocas `lib/security/rateLimit.ts`, conserva el fallback en memoria y el fail-open (disponibilidad primero), pero nunca lo conviertas en el modo "normal".
5. Todo endpoint que valide un secreto adivinable (códigos de descuento, referencias de pedido, tokens) lleva un límite ESTRICTO adicional (≤10/min por IP) aparte del genérico de la ruta.
6. Responde siempre 429 vía `rateLimitResponse()` (incluye `Retry-After` y `X-RateLimit-*`); no inventes formatos nuevos.
7. reCAPTCHA: `required: true` solo en formularios sin fricción de venta (newsletter, contacto). En checkout es best-effort — token ausente no bloquea, score bajo sí. No cambies ese equilibrio sin medir el impacto en conversión.
8. **Nunca** dejes que la falta de `RECAPTCHA_SECRET_KEY` pase en silencio en producción: mantén (o añade) el warning de arranque.
9. Webhooks: la defensa principal es la verificación de firma — jamás la quites ni la hagas opcional. Un rate limit laxo (≥120/min) es complemento, no sustituto.
10. Endpoints de cron siempre detrás de `Bearer CRON_SECRET` con deny-by-default (sin secret configurado → 401).
11. Mutaciones desde el navegador: mantén `validateSameOrigin` (CSRF por Origin) y `readJson` con tope de bytes en todo POST/PUT/DELETE nuevo.
