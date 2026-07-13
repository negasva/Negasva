# REPORTE · Manejo de errores y estados de fallo

**Item 6/25 · P0 · Crítico** · Auditoría solo-diagnóstico (sin cambios de código).
Fecha: 2026-07-13 · Alcance: flujo de compra (`app/order/*`, `app/api/**`, `app/checkout/success`), componentes de pago y librerías server-side.

---

## Checklist del prompt

| Punto | Estado | Evidencia |
|---|---|---|
| Todos los catch del flujo de compra muestran algo al usuario | ⚠️ PARCIAL | Checkout/pago sí (`useCheckout.ts:536-538,610-615`); quote de precio, quote de envío y PhotoDelivery fallan en silencio (ver H-05, H-06, H-07) |
| Timeouts en toda operación de red del checkout | ⚠️ PARCIAL | `uploadPhotos` (`useCheckout.ts:502-510`) y `createPayPalOrder` (`:586-587`) ✅; `capturePayPalOrder` y `createMpOrder` ❌ (H-02, H-03); server-side ninguno (H-04) |
| `/checkout/success` valida referencia contra BD | ❌ FALLA | Estado sale solo de query params, default `'APPROVED'` (`app/checkout/success/page.tsx:189`) — H-01 |
| Errores de API consistentes (código + mensaje seguro + correlación) | ⚠️ PARCIAL | `errorResponse` en 35/43 rutas, no filtra stacks ✅ (`lib/security/apiHelpers.ts:54-63`); sin id de correlación (H-08) |
| Degradación si Supabase/Printful/reCAPTCHA caen | ⚠️ PARCIAL | Fallbacks de catálogo ✅ (`useCheckout.ts:171-179`), Printful no bloquea checkout ✅ (`:202-204`), reCAPTCHA best-effort en PayPal ✅ (`:577-582`) pero NO en Mercado Pago (H-03); sin error boundaries de Next (H-09) |

---

## Hallazgos

### 🔴 CRÍTICO

#### H-01 · `/checkout/success` muestra "¡Pago recibido!" sin consultar la BD
- **Evidencia:** `app/checkout/success/page.tsx:189` — `rawStatus` se lee de la URL con default `'APPROVED'`; `:194-197` — el spinner "Confirmando pago…" es un `setTimeout(600)` cosmético, no una verificación; `:199-206` — el título/ícono de éxito dependen solo del query param.
- **Riesgo:** cualquier visitante (o un pago rechazado/pendiente cuyo provider no devuelva `status`) ve confirmación de pago falsa; el cliente cree que compró cuando la BD dice otra cosa.
- **Fix propuesto:** al montar, consultar el estado real por `ref` (reutilizar `/api/track` o un endpoint `GET /api/checkout/status?ref=`) y renderizar éxito/pendiente/fallo según la BD; tratar la URL solo como pista inicial. Mostrar "verificando…" real hasta tener respuesta, con reintento.
- **Esfuerzo:** M

### 🟠 ALTO

#### H-02 · `capturePayPalOrder` sin timeout y con error indistinguible de "no pagaste"
- **Evidencia:** `app/order/useCheckout.ts:619-634` — fetch a `/api/checkout/paypal/capture` sin `AbortController` (a diferencia de `createPayPalOrder:586-603`); si falla, lanza `capture failed` y la UI muestra el error genérico `t.studio.errors.payment` (`app/order/page.tsx:934,943`).
- **Riesgo:** el comprador ya aprobó el pago; si la captura falla o cuelga ve "error de pago" sin referencia ni instrucciones, y puede pagar dos veces o irse creyendo que no se le cobró (el webhook puede completar el pedido después).
- **Fix propuesto:** timeout de 20 s como en createOrder; ante fallo, mensaje específico ("tu pago pudo haberse procesado, guarda esta referencia / revisa tu email, no pagues de nuevo") con el `orderID`, y 1 reintento automático de la captura.
- **Esfuerzo:** M

#### H-03 · `createMpOrder` puede colgarse para siempre (patrón "ventana en blanco" replicado en Mercado Pago)
- **Evidencia:** `app/order/useCheckout.ts:638-656` — `await getRecaptchaToken('checkout')` sin `withTimeout` ni try/catch (contrasta con PayPal `:577-582`), y el fetch a `/api/checkout` sin abort. Si recaptcha o la API cuelgan, la promesa de `createOrder` del Brick nunca resuelve y el usuario queda en "Cargando el pago seguro…" indefinido (`components/MercadoPagoBrick.tsx:165-171`).
- **Riesgo:** checkout COP colgado sin mensaje = venta perdida, exactamente el fallo ya visto en vivo con PayPal.
- **Fix propuesto:** replicar el patrón de `createPayPalOrder`: `withTimeout(getRecaptchaToken(), 8000)` best-effort + `AbortController` de 20 s en el fetch + devolver `null` en catch (el Brick ya muestra error con `order == null`, `MercadoPagoBrick.tsx:85`).
- **Esfuerzo:** S

#### H-04 · Ningún fetch server-side a proveedores externos tiene timeout
- **Evidencia:** `lib/payments/paypal.ts:15,61,111,142`, `lib/payments/mercadopago.ts:27,107,148`, `lib/printful.ts:105`, `lib/security/recaptcha.ts:37`, `lib/notify/email.ts:21` — todos `fetch()` sin `AbortSignal.timeout`.
- **Riesgo:** si PayPal/MP/Printful cuelgan, la función de Vercel espera hasta su límite; el cliente aborta a los 20 s sin saber si la orden pending se creó (posible orden duplicada y captura huérfana).
- **Fix propuesto:** `signal: AbortSignal.timeout(10_000)` (15 s para capture) en todos los fetch de `lib/payments/*`, `lib/printful.ts`, `lib/security/recaptcha.ts`, `lib/notify/*`, con catch que devuelva error controlado.
- **Esfuerzo:** S

### 🟡 MEDIO

#### H-05 · El quote de precios falla en silencio: se puede llegar al pago con total 0 o desactualizado
- **Evidencia:** `app/order/useCheckout.ts:344` (`if (!res.ok) return;`) y `:360` (`catch { /* keep last known quote */ }`) — sin estado de error ni reintento; si el primer quote falla, `quote` queda en `ZERO_QUOTE`.
- **Riesgo:** el usuario ve total $0 o un precio viejo y el desajuste aparece recién en el proveedor de pago (confusión/abandono).
- **Fix propuesto:** estado `quoteError` + banner "No pudimos calcular tu precio — reintentar", y bloquear el paso 5 si `quote.total === 0` con `bodyType` elegido.
- **Esfuerzo:** M

#### H-06 · PhotoDelivery desaparece si la consulta falla: pedidos pagados sin fotos
- **Evidencia:** `app/checkout/success/page.tsx:29-33` — `catch(() => setState('hidden'))`: un fallo de red oculta el formulario post-pago de subir fotos, que es el insumo del artista.
- **Riesgo:** cliente pagó, no sube fotos y nadie se entera hasta que el pedido se atrasa.
- **Fix propuesto:** en catch mostrar estado de error con botón "Reintentar" (re-fetch) en lugar de `hidden`; `hidden` solo cuando el server responde `found:false`.
- **Esfuerzo:** S

#### H-07 · Estimado de envío falla en silencio
- **Evidencia:** `app/order/useCheckout.ts:381` (`if (!res.ok) return;`) y `:384` (`catch { /* deja el último estimado */ }`).
- **Riesgo:** estimado stale o ausente sin aviso; menor porque el envío definitivo se re-cotiza server-side, pero el total mostrado puede diferir del cobrado.
- **Fix propuesto:** nota "estimado no disponible" cuando falla, en vez de dejar el valor anterior.
- **Esfuerzo:** S

#### H-08 · Sin correlación entre el error que ve el usuario y los logs
- **Evidencia:** `lib/security/apiHelpers.ts:54-63` — `errorResponse` loguea internamente ✅ y no filtra stacks ✅, pero no genera un id de correlación; el cliente solo recibe `{ error }`.
- **Riesgo:** un cliente reporta "me salió error al pagar" y no hay forma de encontrar SU request en los logs de Vercel.
- **Fix propuesto:** generar `requestId` corto (`crypto.randomUUID().slice(0,8)`), incluirlo en el `console.error` y en el JSON de respuesta; mostrarlo en los mensajes de error del checkout ("código de error: abc123").
- **Esfuerzo:** S

#### H-09 · No existen `app/error.tsx`, `app/global-error.tsx` ni `app/not-found.tsx`
- **Evidencia:** ausentes en `app/` (verificado).
- **Riesgo:** cualquier excepción no capturada en un componente rinde la pantalla de error por defecto de Next (o página rota) sin branding, sin CTA de recuperación y sin reporte.
- **Fix propuesto:** añadir error boundaries con mensaje amigable + botón "Reintentar"/"Volver al inicio" y logging del error.
- **Esfuerzo:** S

### 🟢 BAJO

#### H-10 · 8 rutas no usan `errorResponse` (formato de error inconsistente)
- **Evidencia:** `app/api/rates`, `app/api/geo`, `app/api/keepalive`, `app/api/cron/recover-carts` y los 4 `app/api/webhooks/*` (grep `errorResponse` negativo).
- **Riesgo:** bajo — webhooks responden a proveedores, no a usuarios; pero conviene revisar que ninguna devuelva detalle interno.
- **Fix propuesto:** unificar sobre `errorResponse` donde la respuesta sea JSON de error.
- **Esfuerzo:** S

#### H-11 · Lo que ya está bien (para no romperlo)
- Fallbacks locales de catálogo si Supabase cae: `lib/pricing/fallbacks` + `useCheckout.ts:171-179,285-303` ✅.
- Printful caído no bloquea el checkout: `useCheckout.ts:202-204` ✅.
- `uploadPhotos` con timeouts en compresión (8s/12s) y subida (60s), y fallback al archivo original: `useCheckout.ts:478-511` ✅.
- reCAPTCHA best-effort en PayPal (no bloquea si falla): `useCheckout.ts:577-582` ✅.
- Errores de pago visibles en paso 5 y en la barra de navegación: `app/order/page.tsx:955-958,994-997` ✅.
- Sin `NEXT_PUBLIC_PAYPAL_CLIENT_ID` se muestra mensaje explícito en vez de recuadro vacío: `app/order/page.tsx:901-906` ✅.

---

## Tabla resumen

| ID | Severidad | Hallazgo | Esfuerzo | Estado |
|---|---|---|---|---|
| H-01 | Crítico | Success page no valida el pago contra la BD | M | Pendiente |
| H-02 | Alto | Captura PayPal sin timeout ni mensaje post-aprobación | M | Pendiente |
| H-03 | Alto | createMpOrder puede colgarse (sin timeout/try-catch) | S | Pendiente |
| H-04 | Alto | Fetches server-side a proveedores sin timeout | S | Pendiente |
| H-05 | Medio | Quote de precios falla en silencio (total 0/stale) | M | Pendiente |
| H-06 | Medio | PhotoDelivery se oculta ante fallo de red | S | Pendiente |
| H-07 | Medio | Estimado de envío falla en silencio | S | Pendiente |
| H-08 | Medio | Sin requestId de correlación en errores de API | S | Pendiente |
| H-09 | Medio | Faltan error.tsx / global-error.tsx / not-found.tsx | S | Pendiente |
| H-10 | Bajo | 8 rutas fuera del helper errorResponse | S | Pendiente |
| H-11 | — | Prácticas correctas ya presentes (preservar) | — | N/A |
