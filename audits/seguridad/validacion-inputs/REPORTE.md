# REPORTE — Validación de inputs y subida de archivos

**Fecha:** 2026-07-13 · **Auditor:** Claude Code (solo diagnóstico, sin cambios de código)

Sin 🚨 crítico explotable ahora mismo. La validación con Zod en el servidor es sólida
y completa, la subida acota tamaño/cantidad/tipo declarado y regenera los nombres. El
punto más importante a mejorar: la validación del tipo de archivo confía en el MIME
declarado por el cliente (no magic bytes), y el email de aviso de nuevo pedido
interpola valores en HTML sin escapar (XSS solo hacia el buzón del propio admin).

---

## Checklist del prompt

| Punto | Resultado | Evidencia |
|---|---|---|
| Subida valida tipo real (magic bytes), tamaño y cantidad | ⚠️ PARCIAL | Tamaño (10 MB) y cantidad (8) sí; tipo solo por `file.type` declarado por el cliente, no magic bytes (`app/api/order/upload/route.ts:42-45`, `app/api/order/attach-photos/route.ts:78-81`). El bucket reaplica su propia allowlist MIME (`019:35`) pero también sobre el content-type declarado. |
| Nombres de archivo regenerados en el servidor | ✅ CUMPLE | Nombre = `${uuid}/${i}.${ext}`; nunca se usa `file.name` del cliente (`app/api/order/upload/route.ts:48-54`; attach usa `randomUUID()` `:1,109`). Sin riesgo de path traversal. |
| Textos libres con longitud máxima y escapados al mostrarse | ⚠️ PARCIAL | Longitud sí: `specialRequests` máx 500 (`lib/validation/order.ts:49`), description recortada a 500 (`attach-photos:64`). Admin lo muestra vía JSX auto-escapado ✅ (`app/admin/(protected)/pedidos-pago/page.tsx:135`). PERO el email `notifyNewOrder` interpola en HTML sin escapar (`lib/notify/newOrder.ts:53`) — ver A1. |
| Todos los campos del checkout validados con esquema en servidor | ✅ CUMPLE | `CheckoutSchema.safeParse` en `app/api/checkout/route.ts:27`; tipos, rangos (`peopleCount` 1–MAX_PEOPLE `order.ts:24`), monedas enum (`order.ts:17`), tip acotado (`order.ts:88-93`). Mismo esquema comparte quote y checkout. |
| ids/slug validados contra el catálogo real, no se confía en el cliente | ✅ CUMPLE | style/background se resuelven contra `portrait_styles`/`backgrounds` en el servidor (`checkout/route.ts:169-184`); precio se recomputa server-side; envío se re-cotiza con Printful por `rateId`, ignorando cualquier monto del cliente (`checkout/route.ts:185-215`). |

---

## Hallazgos por severidad

### Alto

**A1 — Email `notifyNewOrder` interpola valores en HTML sin escapar (XSS almacenado hacia el admin)**
- Evidencia: `lib/notify/newOrder.ts:52-54` (`` `<li><strong>${k}:</strong> ${v}</li>` ``); valores como `customerEmail` provienen del cliente.
- Riesgo: aunque `specialRequests` no está en esta lista, `customerEmail` y otros campos sí; un valor con HTML se renderiza en el buzón del admin (XSS/HTML injection en el cliente de correo, phishing dirigido al operador).
- Fix: escapar cada valor con un helper `escapeHtml()` antes de interpolar en cualquier HTML de email. Aplicar también en `buildRecoveryEmail` y `emails/order-confirmation.html` si insertan datos del cliente.
- Esfuerzo: S

### Medio

**M1 — Validación de tipo de archivo por MIME declarado, no por magic bytes**
- Evidencia: `app/api/order/upload/route.ts:44` y `app/api/order/attach-photos/route.ts:81` (`ALLOWED.has(file.type)`).
- Riesgo: un cliente puede declarar `image/png` a un archivo arbitrario; se almacena en el bucket con ese content-type. Bajo impacto real (bucket privado, servido como imagen), pero permite abuso de almacenamiento con contenido no-imagen.
- Fix: leer los primeros bytes y verificar la firma real (magic bytes) de JPG/PNG/WEBP; rechazar si no coincide. Rechazar además archivos de 0 bytes.
- Esfuerzo: S

**M2 — `productUnits` y `photoPaths` permisivos, sin verificación contra el upload real**
- Evidencia: `lib/validation/order.ts:35-41` (record permisivo); `photoPaths` es array de strings de hasta 200 chars (`order.ts:79`) que se guarda tal cual en `orders.photo_paths` (`checkout/route.ts:129`).
- Riesgo: el cliente puede enviar `photoPaths` arbitrarios (paths de otras carpetas del bucket) que quedan asociados al pedido; con service role + signed URL el admin podría exponer fotos de OTRO upload.
- Fix: derivar los paths server-side desde `uploadId` (patrón `listOrderPhotos`) en lugar de confiar en `photoPaths` del cliente; o validar que todo path empiece por el `uploadId` de esta sesión.
- Esfuerzo: M

### Bajo

**B1 — Sin límite de tamaño total del formulario multipart**
- Evidencia: `app/api/order/upload/route.ts:33-40` valida por archivo pero no el agregado; `readJson` sí limita JSON a 32 KB (`apiHelpers.ts:118`).
- Riesgo: 8 archivos × 10 MB = 80 MB por request; posible presión de memoria/costo.
- Fix: acotar la suma total (p. ej. 40 MB) antes de subir.
- Esfuerzo: S

**B2 — `background` y `bodyType` permisivos hasta 60/40 chars sin normalizar antes de mostrar**
- Evidencia: `lib/validation/order.ts:20,26`.
- Riesgo: valores no del catálogo se muestran como fallback; sin XSS en admin (JSX) pero sí ruido en emails no escapados (cubierto por A1).
- Fix: tras resolver contra catálogo, usar solo el nombre canónico en emails/labels.
- Esfuerzo: S

---

## Lo que ya está bien
- Zod como fuente única de verdad; `safeParse` en servidor en todo endpoint que cobra o persiste.
- Nombres de archivo regenerados con UUID: sin path traversal ni colisión.
- Bucket privado con allowlist MIME y límite de tamaño a nivel de storage.
- Precio, envío y nombres de catálogo se recalculan/resuelven en servidor; jamás se confía en montos ni labels del cliente.
- Admin renderiza datos del pedido con JSX (auto-escape), neutralizando XSS almacenado en el panel.
- reCAPTCHA + rate limit + check de origen en el checkout y las subidas.

## Tabla resumen

| ID | Severidad | Hallazgo | Esfuerzo | Estado |
|---|---|---|---|---|
| A1 | Alto | Email de nuevo pedido interpola datos del cliente sin escapar | S | Pendiente |
| M1 | Medio | Tipo de archivo por MIME declarado, no magic bytes | S | Pendiente |
| M2 | Medio | `photoPaths` del cliente se persisten sin verificar contra el upload | M | Pendiente |
| B1 | Bajo | Sin límite de tamaño total del multipart | S | Pendiente |
| B2 | Bajo | Labels no canónicos alimentan emails no escapados | S | Pendiente |
