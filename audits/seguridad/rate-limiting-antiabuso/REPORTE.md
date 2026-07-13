# REPORTE · Rate limiting y anti-abuso

**Item 8/25 · P1 · Importante** · Auditoría solo-diagnóstico (sin cambios de código).
Fecha: 2026-07-13 · Alcance: `lib/security/rateLimit.ts`, `lib/security/apiHelpers.ts`, `lib/security/recaptcha.ts`, todas las rutas `app/api/**`.

---

## Checklist del prompt

| Punto | Estado | Evidencia |
|---|---|---|
| UPSTASH_REDIS_REST_URL/TOKEN configurados en producción | ⚠️ NO VERIFICABLE desde el repo | El código lo soporta (`lib/security/rateLimit.ts:49-50`) y `.env.example:109-110` lo documenta vacío; **verificar en Vercel → Settings → Environment Variables** (H-01) |
| TODOS los endpoints costosos con límite | ✅ CUMPLE (casi total) | checkout 20/min (`app/api/checkout/route.ts:14`), capture 20/min, upload 10/min, quote 60/min, newsletter 5/min, admin-login 10/min, mp-pay 15/min, track 10/min… 40+ rutas cubiertas. Excepciones menores: `/api/geo` y webhooks (H-05, H-06) |
| Verificación server-side de reCAPTCHA activa | ⚠️ PARCIAL | Implementada y llamada (`lib/security/recaptcha.ts:30-52`, `app/api/checkout/route.ts:24`), pero sin `RECAPTCHA_SECRET_KEY` en prod se omite en silencio (`recaptcha.ts:32`) — verificar en Vercel (H-02) |
| Límite estricto por IP para probar códigos de descuento | ❌ FALLA | Los códigos se prueban vía `/api/pricing/quote` (60/min por IP, `app/api/pricing/quote/route.ts:15,38-39`) sin límite propio más estricto (H-03) |
| Límites sensatos y 429 con mensaje claro | ✅ CUMPLE | `rateLimitResponse` devuelve 429 + `Retry-After` + `X-RateLimit-*` (`lib/security/apiHelpers.ts:65-77`) |

---

## Hallazgos

### 🟠 ALTO

#### H-01 · Sin confirmación de Upstash en producción, el rate limit es por instancia (casi nulo)
- **Evidencia:** `lib/security/rateLimit.ts:49-50` activa Redis solo si existen las env; `:141-150` cae a memoria por instancia si faltan o si Redis falla (fail-open documentado). `.env.example:109-110` las lista vacías. Desde el repo no se puede saber si están en Vercel.
- **Riesgo:** en serverless cada instancia lleva su propio contador y se resetea en cold start: el tope real es `max × instancias`, un bot distribuido casi no siente el límite.
- **Fix propuesto:** (acción de operación, no de código) crear la BD en Upstash y setear `UPSTASH_REDIS_REST_URL/TOKEN` en Vercel (Production); opcional: loguear una advertencia al bootear en producción sin Upstash para que el hueco sea visible.
- **Esfuerzo:** S

#### H-02 · La IP del rate limit se toma del primer hop de `X-Forwarded-For` (spoofeable)
- **Evidencia:** `lib/security/apiHelpers.ts:10-23` — `getClientIp` devuelve `xff.split(',')[0]`. En Vercel el cliente puede enviar su propio `X-Forwarded-For` y el proxy **antepone/conserva** los valores del cliente; el primer hop es controlado por el atacante.
- **Riesgo:** un bot rota el header (`X-Forwarded-For: 1.2.3.4`, `1.2.3.5`, …) y obtiene un bucket nuevo por request → bypass total del rate limit en checkout, upload, login admin, códigos.
- **Fix propuesto:** en Vercel usar `x-vercel-forwarded-for` (o `request.ip` de Next) como fuente primaria, o tomar el ÚLTIMO hop no confiable del XFF; dejar el primer hop solo como último recurso.
- **Esfuerzo:** S

#### H-03 · Fuerza bruta de códigos de descuento a 60 intentos/min por IP
- **Evidencia:** `app/api/pricing/quote/route.ts:15` (límite genérico `pricing-quote` 60/min) y `:38-39` — el mismo endpoint valida `discountCode` sin límite diferenciado ni contador de fallos.
- **Riesgo:** 60 códigos/min por IP (multiplicado por H-01/H-02) permite enumerar códigos cortos tipo `PROMO10` en horas y quemar promociones.
- **Fix propuesto:** cuando el body trae `discountCode`, aplicar un segundo límite estricto (p. ej. `discount-try` 10/min por IP) y, opcionalmente, backoff por código fallido; loguear intentos fallidos para alertas.
- **Esfuerzo:** S/M

### 🟡 MEDIO

#### H-04 · reCAPTCHA se omite en silencio si falta el secret (y no es verificable desde el repo)
- **Evidencia:** `lib/security/recaptcha.ts:32` — `if (!secret) return true;` sin log; en checkout el token ausente tampoco bloquea (`:34`, decisión documentada para no perder ventas).
- **Riesgo:** si `RECAPTCHA_SECRET_KEY` no está en Vercel, todo el anti-bot del checkout/newsletter es decorativo y nadie se entera.
- **Fix propuesto:** verificar la env en Vercel; añadir `console.warn` una vez por cold start cuando falta el secret en producción. Mantener el modo best-effort del checkout (razonable) pero medible: loguear cuántos checkouts llegan sin token.
- **Esfuerzo:** S

#### H-05 · Webhooks de pago sin rate limit (mitigado por firma)
- **Evidencia:** `app/api/webhooks/{paypal,stripe,mercadopago,wompi}/route.ts` — sin `rateLimitByIp`; todos verifican firma (paypal `:15-16`, stripe `:43-54`, wompi `:27-28`) ✅.
- **Riesgo:** bajo-medio: un flood de payloads inválidos consume cómputo y llamadas de verificación (PayPal verifica contra su API por request).
- **Fix propuesto:** límite laxo por IP (p. ej. 120/min) antes de verificar firma; nunca tan bajo que tire webhooks legítimos en ráfaga.
- **Esfuerzo:** S

### 🟢 BAJO

#### H-06 · `/api/geo` sin rate limit
- **Evidencia:** `app/api/geo/route.ts` — sin límite; endpoint barato (solo lee un header).
- **Riesgo:** mínimo (sin BD ni terceros), pero es la única ruta pública sin límite — inconsistencia.
- **Fix propuesto:** `rateLimitByIp` 60/min por uniformidad.
- **Esfuerzo:** S

#### H-07 · Fail-open del limiter cuando Redis cae
- **Evidencia:** `lib/security/rateLimit.ts:141-148` — si Upstash lanza, cae a memoria (documentado: disponibilidad > tope global).
- **Riesgo:** aceptado por diseño; solo señalar que durante una caída de Upstash el límite vuelve a ser por instancia.
- **Fix propuesto:** ninguno obligatorio; opcional loguear el fallo con contador para detectarlo.
- **Esfuerzo:** S

#### H-08 · Lo que ya está bien (preservar)
- Cobertura amplia y consistente: 40+ rutas con `rateLimitByIp` y prefijos por ruta ✅.
- Valores sensatos por sensibilidad: login admin 10/min, upload 10/min, newsletter 5/min, track 10/min (anti-enumeración de refs), checkout 20/min ✅.
- 429 con `Retry-After` y `X-RateLimit-*` (`lib/security/apiHelpers.ts:65-77`) ✅.
- reCAPTCHA `required:true` en newsletter (`app/api/newsletter/route.ts:22`) y validación de action + score ✅.
- Cron protegido con `Bearer CRON_SECRET` y deny-by-default (`app/api/cron/recover-carts/route.ts:29-34`) ✅.
- CSRF por Origin (`validateSameOrigin`) y `readJson` con tope de 32 KB (`lib/security/apiHelpers.ts:31-47,109-122`) ✅.

---

## Tabla resumen

| ID | Severidad | Hallazgo | Esfuerzo | Estado |
|---|---|---|---|---|
| H-01 | Alto | Upstash sin confirmar en prod → límite por instancia | S (ops) | Pendiente |
| H-02 | Alto | IP tomada del primer hop XFF (spoofeable → bypass) | S | Pendiente |
| H-03 | Alto | Códigos de descuento a 60 intentos/min sin límite propio | S/M | Pendiente |
| H-04 | Medio | reCAPTCHA se omite en silencio sin secret | S | Pendiente |
| H-05 | Medio | Webhooks sin rate limit (firma sí) | S | Pendiente |
| H-06 | Bajo | /api/geo sin límite | S | Pendiente |
| H-07 | Bajo | Fail-open al caer Redis (aceptado, medir) | S | Pendiente |
| H-08 | — | Cobertura y valores correctos ya presentes (preservar) | — | N/A |
