# BUENAS PRÁCTICAS — RLS en Supabase

Léelas antes de tocar `supabase/migrations/**`, `lib/supabase/**` o cualquier ruta
que consulte la base de datos.

1. **Siempre** habilita RLS (`ENABLE ROW LEVEL SECURITY`) en la MISMA migración que
   crea una tabla nueva. Nunca dejes una tabla sin RLS "para después".
2. **Nunca** crees políticas de lectura pública (`USING (true)` o `is_active = true`)
   sobre tablas con datos de clientes (orders, carts, newsletter_subscribers,
   order_images, transactions). Lectura pública SOLO para catálogo: styles, prices,
   backgrounds, body_types, faqs, landing_config, page_content, gallery,
   translation_cache.
3. **Nunca** uses `user_metadata` en políticas ni funciones de autorización — el
   usuario puede editarla. Si algún día se usa Supabase Auth para roles, la fuente es
   `app_metadata`.
4. **Nunca** referencies `SUPABASE_SERVICE_ROLE_KEY` fuera de `lib/supabase/server.ts`
   ni en nada con prefijo `NEXT_PUBLIC_`. `createServiceClient()` solo en route
   handlers/librerías server, y en rutas admin solo vía `requireAdminRoute()`.
5. **Nunca** consultes `orders`, `carts` u otra tabla sensible con el cliente anon
   (`getSupabase()` / `createAnonClient()`). Las lecturas sensibles van con service
   role en el servidor, con el filtrado hecho en código.
6. **Siempre** que crees una política en el dashboard de Supabase, replícala el mismo
   día como migración en `supabase/migrations/`. El repo debe ser la fuente de verdad.
7. **Siempre** mantén el bucket `order-photos` privado (`public = false`); el acceso de
   lectura es únicamente por `createSignedUrls` server-side con TTL ≤ 1 h. Nunca
   generes URLs firmadas en el cliente ni subas fotos de clientes a buckets públicos.
8. **Siempre** define allowlist de MIME types y `file_size_limit` al crear buckets.
9. **Siempre** acompaña `FOR ALL USING (...)` con `WITH CHECK (...)` explícito en
   políticas nuevas.
10. **Nunca** permitas INSERT anon directo (`WITH CHECK (true)`) en tablas nuevas; los
    writes públicos pasan por un route handler con rate limit y service role.
11. **Siempre** que un endpoint público devuelva datos de un pedido, exige al menos
    dos identificadores (id + email), responde el mismo 404 genérico en todo fallo y
    selecciona solo columnas de estado — nunca email, teléfono, dirección o fotos.
