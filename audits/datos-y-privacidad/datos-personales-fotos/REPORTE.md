# REPORTE — Ciclo de vida de fotos y datos personales

**Fecha:** 2026-07-16 · **Auditor:** Claude Code (solo diagnóstico, análisis de
código; el plan de Supabase y el contenido real de los buckets no son verificables
desde el sandbox — marcado como "verificar en producción").

> 🚨 **ADVERTENCIA (no explotable por un atacante, pero sí un riesgo legal y de
> datos activo):** la política de privacidad promete que las fotos "se borran
> automáticamente 30 días después de la entrega" (`app/privacy/page.tsx:65`),
> pero **no existe ningún proceso —cron ni código— que borre esas fotos**. Hoy se
> acumulan indefinidamente fotos de familias (a veces niños), incluidas las de
> checkouts nunca pagados. Es una promesa legal incumplida y datos personales
> retenidos sin base. Ver A1 y A2. No lo arreglo en esta pasada; lo documento.

---

## Hallazgos

### 🔴 Severidad ALTA

**A1 — La retención prometida (borrado a 30 días) no está implementada**
- Evidencia: `app/privacy/page.tsx:65` afirma "Photos are kept only for as long as needed … automatically deleted 30 days after delivery"; no existe cron ni función que borre del bucket `order-photos` (búsqueda de `delete/purge/retention` sobre `app/lib/supabase` no devuelve ningún borrador de fotos). El propio código lo reconoce: `app/api/order/upload/route.ts:15-18` ("checkout abandonado deja la carpeta huérfana … Limpieza pendiente").
- Riesgo: se retienen indefinidamente datos personales sensibles (rostros de familias/menores) contradiciendo la política publicada — incumplimiento de minimización/retención (GDPR art. 5.1.e) y declaración falsa al cliente.
- Fix propuesto: cron diario (`vercel.json`) que borre las carpetas de `order-photos` de pedidos con `status` entregado hace > 30 días, y actualice `photo_paths` a `[]`. Alternativa temporal: ajustar el texto a lo que realmente se hace hasta implementarlo.
- Esfuerzo: **M**

**A2 — Fotos de checkouts abandonados quedan huérfanas para siempre**
- Evidencia: las fotos se suben ANTES de crear el pago (`app/api/order/upload/route.ts:52-66`), así que un `uploadId` cuyo checkout nunca se paga no queda asociado a ninguna orden y nunca se limpia. Reconocido en `:15-18`.
- Riesgo: acumulación sin límite de datos personales sin pedido ni base legal asociada; superficie de exposición y coste de storage creciente.
- Fix propuesto: cron que liste carpetas de `order-photos` sin `upload_id` en `orders` con antigüedad > 48–72 h y las borre. (Se apoya en `listOrderPhotos` de `lib/payments/orderPhotos.ts`.)
- Esfuerzo: **M**

### 🟠 Severidad MEDIA

**M1 — No hay proceso operativo de borrado a petición del cliente (derecho al olvido)**
- Evidencia: `app/privacy/page.tsx:72` remite a escribir por email para acceder/corregir/borrar; no existe endpoint ni acción de admin que borre fotos + PII de un pedido de forma atómica.
- Riesgo: el borrado manual es lento y propenso a dejar restos (fotos en bucket, filas en `orders`, `newsletter_subscribers`, `carts`), incumpliendo el plazo de respuesta GDPR.
- Fix propuesto: acción de admin "Borrar datos de este pedido" que elimine la carpeta de `order-photos`, anonimice/borre la fila de `orders` y su contacto, y un runbook corto para peticiones ARCO.
- Esfuerzo: **M**

**M2 — La política de lectura del bucket usa `user_metadata.role` (auto-editable) en vez de `app_metadata`**
- Evidencia: `supabase/migrations/019_order_photos.sql:44` — `(auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'`. La migración 028 (`028_rls_app_metadata_and_newsletter.sql`) movió las políticas de admin a `app_metadata` justamente porque `user_metadata` lo puede editar el propio usuario.
- Riesgo: bajo en la práctica (la operación normal usa el service role, que salta RLS; esta policy solo habilita el preview en el dashboard de Supabase), pero es inconsistente y podría dar lectura a un usuario que se autoedite el rol si algún día se sirven fotos vía RLS.
- Fix propuesto: reemplazar la policy por la variante con `app_metadata`, alineada con 028.
- Esfuerzo: **S**

### ✅ Lo que ya está bien (mantener)

- **Bucket `order-photos` privado** (`019_order_photos.sql:22-33`, `public=false`) con límite de 10 MB y MIME whitelist ✅.
- **Escritura solo con service role** (server-side), sin policy anon de escritura: las claves nunca llegan al cliente (`app/api/order/upload/route.ts:53`) ✅.
- **Acceso del admin por URLs firmadas de corta vida (1 h)**, no bucket público: `lib/payments/orderPhotos.ts:31-46` (`createSignedUrls`, `expiresInSeconds=3600`) ✅.
- **Validación de entrada estricta** (nº de fotos, tamaño por archivo y total, tipo) en `app/api/order/upload/route.ts:40-50` y misma validación en el adjunto post-venta (`app/api/order/attach-photos/route.ts:83-87`) ✅.
- **La referencia de pedido funciona como token de capacidad** en el adjunto post-pago y no se pueden pisar fotos existentes (`attach-photos/route.ts:102-104`) ✅.

## Inventario de datos personales (dónde vive cada dato)

| Dato | Ubicación | Retención hoy |
|---|---|---|
| Fotos de referencia (rostros) | Bucket `order-photos` (privado) | ❌ indefinida (promesa 30d incumplida) |
| Nombre / email / WhatsApp | Tabla `orders`, `newsletter_subscribers`, `carts` | Indefinida |
| Dirección de envío | Tabla `orders` (pedidos POD) | Indefinida |
| Email newsletter | `newsletter_subscribers` | Indefinida, sin baja |

## Checklist del prompt

| Punto | Estado | Evidencia |
|---|---|---|
| Inventario de datos personales y dónde se guardan | ✅ (ver tabla) | migraciones 019/025/029 |
| Retención de fotos tras entrega | ❌ FALLA — prometida 30d, no implementada | A1 |
| Fotos de pedidos nunca pagados (huérfanas) | ❌ FALLA — no se purgan | A2 |
| Solo el admin ve las fotos / URLs firmadas expiran rápido | ✅ CUMPLE — bucket privado + signed URL 1h | `orderPhotos.ts:31-46` |
| Proceso para borrar datos a petición del cliente | ⚠️ PARCIAL — solo email manual | M1 |

## Tabla-resumen (para marcar al arreglar)

| ID | Severidad | Hallazgo | Esfuerzo | Estado |
|---|---|---|---|---|
| A1 | 🔴 Alta | Retención 30d prometida sin implementar | M | Pendiente |
| A2 | 🔴 Alta | Fotos huérfanas de checkouts abandonados | M | Pendiente |
| M1 | 🟠 Media | Sin borrado atómico a petición (ARCO) | M | Pendiente |
| M2 | 🟠 Media | Policy de bucket usa `user_metadata` | S | Pendiente |
</content>
