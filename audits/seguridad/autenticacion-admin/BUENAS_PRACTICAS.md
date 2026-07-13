# BUENAS PRÁCTICAS — Autenticación y autorización del panel admin

Reglas permanentes para este proyecto. Léelas antes de tocar `app/api/admin/**`,
`app/admin/**`, `app/adminlanding/**`, `lib/admin/**` o `middleware.ts`.

1. **Siempre** llama `requireAdminRoute()` como PRIMERA línea de cada handler nuevo en
   `/api/admin/*` y responde `errorResponse('Unauthorized', 401)` si devuelve null.
   Nunca confíes en que el layout del frontend ya protegió la ruta.
2. **Nunca** crees un cliente Supabase service-role (`createServiceClient`) en una ruta
   admin sin haber verificado antes la cookie de sesión. Usa siempre el que devuelve
   `requireAdminRoute()`.
3. **Siempre** aplica `validateSameOrigin(request)` en toda mutación admin
   (POST/PUT/PATCH/DELETE), incluido logout.
4. **Nunca** cambies los atributos de la cookie de sesión: debe seguir siendo
   `httpOnly`, `secure` en producción, `sameSite: 'lax'` y con `maxAge` ≤ 12 h.
5. **Nunca** compares contraseñas o firmas con `===`; usa `safeEqual`
   (`lib/admin/session.ts`).
6. **Siempre** devuelve el mismo error genérico ("Credenciales incorrectas", 401) ante
   cualquier fallo de login. Nunca distingas contraseña incorrecta de otras causas.
7. **Siempre** mantén rate limiting en el login admin (`rateLimitByIp`, prefix
   `admin-login`). Si añades otro endpoint de autenticación, dale su propio prefix.
8. **Nunca** loguees ni devuelvas al cliente `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`
   ni el valor de la cookie `admin_session`.
9. **Siempre** añade `Cache-Control: no-store` a respuestas nuevas que expongan datos
   de pedidos, clientes o fotos.
10. **Nunca** expongas rutas de páginas admin fuera de los route groups
    `(protected)`; toda página admin nueva vive bajo `app/admin/(protected)/` o
    `app/adminlanding/(protected)/`, cuyos layouts llaman `requireAdmin()`.
11. **Siempre** usa `pickFields()` en bodies de PUT/PATCH admin para no permitir
    columnas arbitrarias.
12. Al rotar credenciales: recuerda que hoy la clave HMAC es
    `ADMIN_SESSION_SECRET || ADMIN_PASSWORD` — si el secret está definido, rotar solo
    la contraseña NO cierra sesiones vivas (hallazgo A1 del REPORTE).
