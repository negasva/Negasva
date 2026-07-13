# REPORTE — Row Level Security (RLS) en Supabase

**Fecha:** 2026-07-13 · **Auditor:** Claude Code (solo diagnóstico, sin cambios de código)

Sin 🚨 crítico confirmado explotable desde el repo, pero hay DOS hallazgos altos que
requieren verificación en el proyecto Supabase de producción (A1 y A2): la función
`is_admin()` confía en `user_metadata` (editable por el usuario si el signup está
abierto) y el endpoint `/api/track` lee `orders` con la anon key, cosa que las
políticas versionadas NO permiten — si el tracking funciona en producción, existe
una política anon-read sobre `orders` fuera del repo.

---

## Checklist del prompt

| Punto | Resultado | Evidencia |
|---|---|---|
| RLS habilitado en todas las tablas | ✅ CUMPLE | Las 21 tablas creadas en migraciones tienen `ENABLE ROW LEVEL SECURITY`: orders/order_images/transactions/profiles/rate_limits/analytics_events/audit_logs (`002_rls_policies.sql:2-10`), newsletter (`004:10`), prices/discount_codes/packages/backgrounds (`006:47-50`), admin_orders y portrait_styles (`008:25,62`), body_types (`010:42`), faqs (`012:13`), landing_config (`015:10`), page_content (`017:12`), translation_cache (`018:14`), gallery_items (`020:18`), carts (`025:50`). |
| Lectura pública solo de catálogo | ✅ CUMPLE (en migraciones) | Público solo lee: styles activos (`008:68`, `023:46`), backgrounds activos (`006:89`, `007:131`), body_types activos (`010:45`), faqs activos (`012:16`), prices (`013:8`), landing_config (`015:13`), page_content (`017:15`), translation_cache (`018:19`), gallery activa (`020:21`). Orders/carts/discount_codes/newsletter sin lectura pública (`002:23`, `025:52`, `006:71`, `004:21`). |
| Service role solo server-side | ✅ CUMPLE | `SUPABASE_SERVICE_ROLE_KEY` solo se lee en `lib/supabase/server.ts:30` (sin prefijo `NEXT_PUBLIC_`); `createServiceClient` solo se importa en route handlers/librerías server. Ningún componente cliente lo referencia. |
| Bucket de fotos de clientes privado + URLs firmadas cortas | ✅ CUMPLE | Bucket `order-photos` con `public = false` y límite 10 MB (`019_order_photos.sql:24-35`); lectura solo vía `createSignedUrls` con TTL 1 h generadas server-side (`lib/payments/orderPhotos.ts:31-45`). |
| Endpoints públicos sin columnas sensibles | ⚠️ PARCIAL | `public-stats` solo devuelve un conteo (`app/api/public-stats/route.ts:13-24`) ✅. `/api/track` exige orderId+email, error genérico 404 ✅, y solo devuelve estado (`app/api/track/route.ts:35-51`). PERO usa la ANON key contra `orders` — ver A2. |

---

## Hallazgos por severidad

### Alto

**A1 — `is_admin()` confía en `user_metadata.role`, que el propio usuario puede editar**
- Evidencia: `supabase/migrations/006_admin_tables.sql:53-61` (`auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'`); mismo patrón en la política del bucket (`019:44`).
- Riesgo: `user_metadata` es modificable por el usuario autenticado (`supabase.auth.updateUser`); si el signup de Supabase Auth está habilitado en el dashboard, cualquiera puede crearse una cuenta, ponerse `role: 'admin'` y leer/escribir prices, discount_codes, packages, backgrounds, admin_orders, carts y el bucket order-photos con la anon key.
- Fix: usar `app_metadata` (solo modificable con service role) en `is_admin()`, o deshabilitar signups en el dashboard y documentarlo. Verificar HOY el estado del signup en producción.
- Esfuerzo: S

**A2 — `/api/track` lee `orders` con la anon key, incompatible con las políticas versionadas**
- Evidencia: `app/api/track/route.ts:2,34-39` usa `getSupabase()` (anon, `lib/supabase/client.ts:7-10`); la única política SELECT de `orders` exige `auth.uid() = user_id` (`002_rls_policies.sql:23`).
- Riesgo: o el tracking está roto en producción, o existe una política anon-read sobre `orders` creada en el dashboard y NO versionada — en ese caso, cualquiera con la anon key (pública en el bundle) podría consultar la tabla `orders` vía PostgREST con filtros arbitrarios, saltándose el rate limit del API.
- Fix: verificar las políticas reales en producción (`select * from pg_policies where tablename='orders'`); cambiar `/api/track` a un cliente service role con la lógica de matching en el servidor y eliminar cualquier política anon sobre `orders`.
- Esfuerzo: S

### Medio

**M1 — Deriva de esquema: migraciones no aplicadas de forma reproducible**
- Evidencia: `019_order_photos.sql:14` ("Run once in the Supabase SQL editor"); A2 sugiere políticas fuera del repo.
- Riesgo: el repo no es la fuente de verdad de las políticas RLS reales; imposible auditar producción solo desde el código.
- Fix: volcar el esquema real (`supabase db pull` / `pg_dump --schema-only`) y reconciliarlo con `supabase/migrations`.
- Esfuerzo: M

**M2 — INSERT público sin restricciones en `newsletter_subscribers` vía PostgREST**
- Evidencia: `004_newsletter.sql:14-17` (`WITH CHECK (true)`).
- Riesgo: con la anon key se puede insertar directamente contra PostgREST, saltándose el rate limit del endpoint `/api/newsletter` (spam / llenado de tabla).
- Fix: quitar la política de INSERT anon y hacer el insert solo desde el API con service role (patrón ya usado en carts/orders).
- Esfuerzo: S

### Bajo

**B1 — Políticas `is_admin()` FOR ALL sin `WITH CHECK` explícito**
- Evidencia: p. ej. `006_admin_tables.sql:67,73,79,85`, `008:27`, `025:52`.
- Riesgo: `USING` sin `WITH CHECK` es válido (Postgres reutiliza USING), pero oculta la intención y facilita errores al editar.
- Fix: añadir `WITH CHECK (is_admin())` explícito en la próxima migración que toque estas tablas.
- Esfuerzo: S

**B2 — Tablas legacy sin uso aparente (`profiles`, `order_images`, `transactions`, `admin_orders`)**
- Evidencia: creadas en `001`/`008`; el código actual opera sobre `orders`, `carts`, `order-photos`.
- Riesgo: superficie muerta con políticas antiguas que nadie revisa.
- Fix: confirmar y eliminar (ya existe `CLEANUP.sql` como precedente).
- Esfuerzo: M

---

## Lo que ya está bien
- RLS habilitado en el 100 % de tablas versionadas; deny-by-default para orders/carts/newsletter.
- Service role key jamás expuesta al cliente; helper con mensaje claro (`lib/supabase/server.ts:29-33`).
- Bucket `order-photos` privado con MIME allowlist y límite de tamaño; URLs firmadas de 1 h solo server-side.
- `/api/track` no distingue "email incorrecto" de "pedido inexistente" (anti-enumeración, `app/api/track/route.ts:18-20`).

## Tabla resumen

| ID | Severidad | Hallazgo | Esfuerzo | Estado |
|---|---|---|---|---|
| A1 | Alto | `is_admin()` usa `user_metadata` editable por el usuario | S | Pendiente |
| A2 | Alto | `/api/track` lee orders con anon key → posible política anon no versionada | S | Pendiente |
| M1 | Medio | Deriva entre migraciones del repo y esquema real de producción | M | Pendiente |
| M2 | Medio | INSERT anon sin límite en newsletter vía PostgREST | S | Pendiente |
| B1 | Bajo | Políticas FOR ALL sin WITH CHECK explícito | S | Pendiente |
| B2 | Bajo | Tablas legacy con políticas sin uso | M | Pendiente |
