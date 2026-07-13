# REPORTE — Autenticación y autorización del panel admin

**Fecha:** 2026-07-13 · **Auditor:** Claude Code (solo diagnóstico, sin cambios de código)

Sin hallazgos 🚨 críticos explotables ahora mismo. La base es sólida: las 14 rutas
`/api/admin/*` verifican sesión en el servidor, la cookie está bien configurada y el
login tiene rate limit y comparación en tiempo constante.

---

## Checklist del prompt

| Punto | Resultado | Evidencia |
|---|---|---|
| Todas las rutas `/api/admin/*` verifican sesión en servidor | ✅ CUMPLE | Las 14 rutas llaman `requireAdminRoute()` y responden 401 (p. ej. `app/api/admin/orders/route.ts:15-16`, `app/api/admin/upload/route.ts:25-30`). Única sin guard: `login/route.ts` (correcto). Los layouts `app/admin/(protected)/layout.tsx:22` y `app/adminlanding/(protected)/layout.tsx:20` llaman `requireAdmin()` además. |
| Cookie HttpOnly, Secure, SameSite, expiración razonable | ✅ CUMPLE | `app/api/admin/login/route.ts:26-32`: `httpOnly: true`, `secure` en prod, `sameSite: 'lax'`, `maxAge` 12 h (`lib/admin/session.ts:11`). |
| HMAC no forjable / rotar ADMIN_PASSWORD invalida sesiones | ⚠️ PARCIAL | HMAC-SHA256 con comparación constante, no forjable (`lib/admin/session.ts:19-45`). PERO la clave es `ADMIN_SESSION_SECRET \|\| ADMIN_PASSWORD` (`session.ts:14`): si `ADMIN_SESSION_SECRET` está definido, rotar la contraseña NO invalida sesiones vivas (contradice el comentario del código). |
| Rate limit en login + error genérico | ✅ CUMPLE | `login/route.ts:14`: 10 req/min por IP. Error único "Credenciales incorrectas" (`:22`), `safeEqual` en tiempo constante (`session.ts:23-29`). |
| Sin IDOR | ✅ CUMPLE | Modelo de un solo rol admin (contraseña compartida): todo endpoint admin exige la cookie; no hay recursos "de otro usuario" alcanzables por id. Cliente service-role solo se crea tras verificar cookie (`lib/admin/auth.ts:26-29`). |
| Respuestas admin con `Cache-Control: no-store` | ⚠️ PARCIAL | `/backgrounds/*` sí (`middleware.ts:73`). Las respuestas JSON de `/api/admin/*` no fijan `no-store` explícito; son dinámicas por defecto en Next (riesgo bajo), pero falta el header defensivo. |

---

## Hallazgos por severidad

### Alto

**A1 — Rotar `ADMIN_PASSWORD` no invalida sesiones si existe `ADMIN_SESSION_SECRET`**
- Evidencia: `lib/admin/session.ts:14` (`ADMIN_SESSION_SECRET || ADMIN_PASSWORD`).
- Riesgo: tras un compromiso de contraseña, el atacante con cookie viva sigue con acceso hasta 12 h aunque rotes la contraseña.
- Fix: firmar con `HMAC(secret, ADMIN_PASSWORD + issuedAt)` o incluir un hash de la contraseña en el token, de modo que rotar cualquiera de los dos invalide sesiones. Documentar en `.env.example`.
- Esfuerzo: S

### Medio

**M1 — Sin revocación de sesión del lado servidor**
- Evidencia: `lib/admin/session.ts:37-45` — el token solo valida firma + edad; no hay lista de revocación ni nonce.
- Riesgo: una cookie robada es válida hasta 12 h sin forma de matarla salvo rotar el secreto.
- Fix: incluir un `sessionVersion` (env o fila en Supabase) en el HMAC; incrementarlo revoca todo.
- Esfuerzo: M

**M2 — `getClientIp` confía en el primer valor de `X-Forwarded-For`**
- Evidencia: `lib/security/apiHelpers.ts:12-16`.
- Riesgo: un atacante puede inyectar su propio XFF y rotar la clave del rate limit del login (fuerza bruta distribuida barata).
- Fix: en Vercel, preferir `x-real-ip` / `x-vercel-forwarded-for` (fijados por la plataforma) antes que el primer hop de XFF.
- Esfuerzo: S

**M3 — Contraseña única compartida, sin MFA ni auditoría por usuario**
- Evidencia: diseño global (`lib/admin/auth.ts:8-13`).
- Riesgo: no hay trazabilidad de quién hizo qué ni segundo factor; un filtrado de la contraseña da acceso total a pedidos y fotos de clientes.
- Fix (roadmap): migrar a Supabase Auth con rol admin + MFA, o al menos contraseña de alta entropía + alerta de login.
- Esfuerzo: L

### Bajo

**B1 — Respuestas `/api/admin/*` sin `Cache-Control: no-store` explícito**
- Evidencia: ningún `no-store` en `app/api/admin/**` (solo middleware para `/backgrounds/*`, `middleware.ts:73`).
- Riesgo: caching intermedio accidental de datos de pedidos si cambia la config de CDN/proxy.
- Fix: añadir `Cache-Control: no-store` en `errorResponse`/respuestas admin o un helper `adminJson()`.
- Esfuerzo: S

**B2 — Logout (`DELETE /api/admin/login`) sin check de origen**
- Evidencia: `app/api/admin/login/route.ts:36-39`.
- Riesgo: CSRF de logout (molestia, no fuga).
- Fix: aplicar `validateSameOrigin` también al DELETE.
- Esfuerzo: S

**B3 — `safeEqual` corta antes en longitudes distintas**
- Evidencia: `lib/admin/session.ts:26` (`if (ab.length !== bb.length) return false;`).
- Riesgo: fuga teórica de la longitud de la contraseña por timing (muy difícil de explotar en serverless).
- Fix: comparar contra un HMAC de ambos valores para longitud fija.
- Esfuerzo: S

---

## Lo que ya está bien
- Guard servidor en el 100 % de handlers admin (guards ≥ handlers en los 13 archivos protegidos).
- `validateSameOrigin` (anti-CSRF por header Origin) en todas las mutaciones admin.
- Rate limit con backend Upstash Redis global cuando está configurado (`lib/security/rateLimit.ts`).
- Errores genéricos sin filtrar detalles de Supabase (`apiHelpers.ts:55-63`).
- Hotlinking de fotos de clientes bloqueado + `no-store` en `/backgrounds/*` (`middleware.ts:57-75`).

## Tabla resumen

| ID | Severidad | Hallazgo | Esfuerzo | Estado |
|---|---|---|---|---|
| A1 | Alto | Rotar ADMIN_PASSWORD no invalida sesiones (fallback de clave HMAC) | S | Pendiente |
| M1 | Medio | Sin revocación de sesión servidor | M | Pendiente |
| M2 | Medio | XFF spoofable debilita rate limit del login | S | Pendiente |
| M3 | Medio | Contraseña única compartida, sin MFA/auditoría | L | Pendiente |
| B1 | Bajo | Falta `no-store` explícito en `/api/admin/*` | S | Pendiente |
| B2 | Bajo | Logout sin check de origen | S | Pendiente |
| B3 | Bajo | `safeEqual` revela longitud por timing | S | Pendiente |
