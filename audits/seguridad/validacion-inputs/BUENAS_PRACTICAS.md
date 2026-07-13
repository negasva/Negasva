# BUENAS PRÁCTICAS — Validación de inputs y subida de archivos

Léelas antes de tocar `lib/validation/**`, `app/api/order/**`, `app/api/checkout/**`,
`lib/notify/**`, `emails/**` o cualquier vista que muestre datos del cliente.

1. **Siempre** valida el body de todo endpoint que cobra o persiste con un esquema Zod
   del `lib/validation/order.ts` (o uno nuevo ahí) usando `safeParse` en el servidor.
   Nunca confíes en la validación del cliente.
2. **Nunca** uses `file.name` del cliente en el path de storage. Regenera siempre el
   nombre con `randomUUID()` + índice + extensión derivada del tipo.
3. **Siempre** valida en cada subida: cantidad máxima (8), tamaño por archivo (10 MB),
   tamaño total del formulario, y el tipo real por magic bytes (no solo `file.type`).
   Rechaza archivos de 0 bytes.
4. **Siempre** escapa (helper `escapeHtml`) cualquier valor que provenga del cliente
   antes de interpolarlo en el HTML de un email (`lib/notify/**`, `emails/**`). Nunca
   metas `${valor}` de cliente en una plantilla de correo sin escapar.
5. **Siempre** muestra datos del pedido en el admin con JSX (auto-escape). Nunca uses
   `dangerouslySetInnerHTML` con datos del cliente.
6. **Nunca** confíes en `photoPaths` enviados por el cliente para asociarlos a un
   pedido: deriva los paths server-side desde el `uploadId`, o valida que todo path
   empiece por el `uploadId` de esa sesión.
7. **Siempre** resuelve style/background/bodyType/rateId contra el catálogo real
   (Supabase / Printful) en el servidor y usa solo el valor canónico resultante en
   precios, labels y emails. Nunca uses el slug/label crudo del cliente para mostrar.
8. **Siempre** acota longitudes de todo texto libre (`specialRequests` ≤ 500, nombre
   ≤ 120, email ≤ 255) en el esquema, no solo en el frontend.
9. **Nunca** recalcules precio, envío o propina a partir de montos del cliente:
   recómputalos siempre server-side (`computeQuoteUsd`, Printful, tip %).
10. **Siempre** mantén reCAPTCHA + rate limit + `validateSameOrigin` en checkout y
    subidas.
