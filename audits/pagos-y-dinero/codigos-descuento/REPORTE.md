# REPORTE — Códigos de descuento y promociones

**Fecha:** 2026-07-17 · **Auditor:** Claude Code (solo diagnóstico, análisis de código).

> ✅ **No hay nada crítico explotable ahora mismo.** El diseño ya es sólido: el
> uso se registra en el webhook (pago capturado), el descuento está capeado y la
> fuerza bruta tiene rate limit propio. Lo que queda son bordes de carrera y
> límites que faltan. No arreglo nada aquí; lo documento.

---

## Hallazgos

### 🟠 Severidad MEDIA

**M1 — Carrera en el conteo de usos: el chequeo de `max_uses` y el incremento no son atómicos**
- Evidencia: `applyDiscountCode` lee `current_uses` y compara contra `max_uses` (`lib/pricing/server.ts:143`); el incremento ocurre después, en el webhook, con un read-then-write no atómico (`lib/pricing/server.ts:165-174`). Nada reserva el uso entre el quote y la captura.
- Riesgo: dos compras simultáneas con el último uso disponible pueden pasar ambas y dejar `current_uses` por encima de `max_uses` (dinero que se escapa, acotado).
- Fix propuesto: incremento atómico con condición en la BD (`UPDATE ... SET current_uses = current_uses + 1 WHERE id = ? AND (max_uses IS NULL OR current_uses < max_uses)`) o un RPC/`increment` de Postgres; tratar 0 filas afectadas como código agotado.
- Esfuerzo: **M**

**M2 — No hay tope de usos por cliente**
- Evidencia: la tabla `discount_codes` tiene `max_uses` global pero no un límite por email/cliente (`supabase/migrations/006_admin_tables.sql:15-25`); `applyDiscountCode` no recibe identidad del comprador (`lib/pricing/server.ts:125-159`).
- Riesgo: un mismo cliente puede reutilizar un código pensado como "uno por persona" tantas veces como quiera hasta agotar el tope global.
- Fix propuesto: tabla `discount_code_uses (code_id, email, used_at)` y validar contra ella en el quote/checkout; para el cupón de newsletter ya se guarda `newsletter_subscribers.discount_code` (`027_conversion_mechanisms.sql`), reutilizar esa señal.
- Esfuerzo: **M**

### 🟡 Severidad BAJA

**B1 — No se valida el formato del código al crearlo (adivinables si el admin usa nombres cortos)**
- Evidencia: el admin inserta el código libre en mayúsculas sin reglas de longitud/entropía (`app/api/admin/discount-codes/route.ts:63-72`); la defensa real contra fuerza bruta es solo el rate limit `discount-try` de 10/min (`app/api/pricing/quote/route.ts:30-33`).
- Riesgo: códigos cortos/secuenciales (p. ej. `PROMO1`) son adivinables pese al rate limit si el atacante rota IPs.
- Fix propuesto: exigir en el schema del admin una longitud mínima (≥8) y recomendar sufijo aleatorio; mantener el rate limit por IP como capa extra.
- Esfuerzo: **S**

**B2 — `active=false` y expiración se evalúan en app, no en la BD**
- Evidencia: `active`, `expires_at` y `max_uses` se filtran en JS dentro de `applyDiscountCode` (`lib/pricing/server.ts:141-143`), no con constraints ni una vista.
- Riesgo: bajo — cualquier ruta futura que consulte `discount_codes` directamente sin pasar por `applyDiscountCode` podría saltarse estas reglas.
- Fix propuesto: mantener toda validación de códigos detrás de `applyDiscountCode` (nunca consultar la tabla en crudo desde otra ruta).
- Esfuerzo: **S**

### ✅ Lo que ya está bien (mantener)

- **El uso se registra SOLO con pago capturado**, en los cuatro webhooks (`app/api/webhooks/paypal/route.ts:85`, `stripe:110`, `mercadopago:112`, `wompi:86`) — nunca al aplicar el código en el quote ✅.
- **Descuento capeado**: `Math.min(Math.max(raw, 0), base)` impide dejar el total en 0 o negativo (`lib/pricing/server.ts:151`) ✅.
- **Expiración, tope global y estado activo** existen en el modelo y se respetan (`lib/pricing/server.ts:141-143`) ✅.
- **Rate limit específico anti-fuerza-bruta** además del general de la ruta (`app/api/pricing/quote/route.ts:30-33`) ✅.
- **Códigos no combinables** bien modelados: anulan la promo por personas sobre la base correcta (`lib/pricing/server.ts:148-149`, `027_conversion_mechanisms.sql`) ✅.

## Checklist del prompt

| Punto | Estado | Evidencia |
|---|---|---|
| Cada código con expiración, tope de usos, tope por cliente y activo/inactivo | ⚠️ PARCIAL — falta tope por cliente | M2 |
| Uso registrado solo con pago capturado (webhook) | ✅ CUMPLE | webhooks |
| Carrera con el último uso disponible | ❌ FALLA — chequeo/incremento no atómico | M1 |
| Descuento capeado para nunca dejar total en 0/negativo | ✅ CUMPLE | `server.ts:151` |
| Códigos no adivinables en masa (rate limit + formato) | ⚠️ PARCIAL — rate limit sí, formato no forzado | B1 |

## Tabla-resumen (para marcar al arreglar)

| ID | Severidad | Hallazgo | Esfuerzo | Estado |
|---|---|---|---|---|
| M1 | 🟠 Media | Carrera: chequeo/incremento de usos no atómico | M | Pendiente |
| M2 | 🟠 Media | Sin tope de usos por cliente | M | Pendiente |
| B1 | 🟡 Baja | Formato de código no forzado (adivinable) | S | Pendiente |
| B2 | 🟡 Baja | Validez evaluada en app, no en BD | S | Pendiente |
