# REPORTE — Fricción en el funnel de checkout

**Fecha:** 2026-07-13 · **Auditor:** Claude Code (solo diagnóstico)
**Nota:** sin acceso a GA ni a producción desde el sandbox (red bloqueada), el mapeo
del funnel con datos reales queda pendiente — y de hecho ese es el hallazgo A1: hoy
NO existen eventos que permitan mapearlo.

---

## Hallazgos

### 🔴 Severidad ALTA

**A1 — El funnel no se puede medir: GA no tiene NINGÚN evento de pasos ni de compra**
- Evidencia: el único uso de `gtag` en todo el repo es el config base (`app/layout.tsx:128-141`). No hay `begin_checkout`, `add_payment_info`, `purchase`, ni eventos por paso del wizard (grep de `gtag|dataLayer` en `app/`, `components/`, `lib/`: 0 resultados fuera del layout).
- Riesgo: es imposible saber en qué paso se abandona; toda decisión de conversión se toma a ciegas.
- Fix propuesto: instrumentar eventos GA4 de e-commerce: `view_item` (paso 1), paso alcanzado (2-4), `begin_checkout` (ir al pago), `add_payment_info`, `purchase` en `/checkout/success`, y un evento por error de pago/subida.
- Esfuerzo: **M**

**A2 — Si la captura de PayPal falla, no se garantiza mensaje al usuario**
- Evidencia: `app/order/useCheckout.ts:619-634` — `capturePayPalOrder` lanza `Error('capture failed')` sin `setCheckoutError`; en `app/order/page.tsx:931,942` el `onApprove` simplemente propaga. El `onError` del SDK cubre errores del SDK, pero el rechazo del capture puede dejar al usuario con el modal cerrado, dinero "aprobado" y ninguna explicación de qué pasó ni qué hacer.
- Riesgo: el peor momento posible para el silencio: usuario que ya aprobó el pago y no sabe si pagó — ticket de soporte o carrito perdido garantizado.
- Fix propuesto: capturar el error en `onApprove`, mostrar `checkoutError` específico ("Tu pago fue aprobado pero no pudimos confirmarlo; escríbenos por WhatsApp con la referencia…") y loguear la referencia.
- Esfuerzo: **S**

### 🟠 Severidad MEDIA

**M1 — Subida de fotos sin indicador de progreso: en móvil lento parece colgado**
- Evidencia: `app/order/useCheckout.ts:478-511` — compresión + upload de hasta 8 fotos en un solo POST; el único feedback es el spinner del botón (`app/order/page.tsx:1013-1015`). Con 60 s de timeout (`:503`) un usuario en 3G puede mirar un spinner un minuto sin saber si avanza.
- Lo que ya está bien: timeouts en cada fase (import 8 s, compresión 12 s/foto, upload 60 s) garantizan que el flujo siempre termina — el bug histórico del botón colgado está resuelto ✅.
- Fix propuesto: texto de estado bajo el botón ("Comprimiendo foto 2 de 4…", "Subiendo fotos…") y, si es viable, `XMLHttpRequest`/`fetch` con progreso real.
- Esfuerzo: **M**

**M2 — El upsell aparece también en el momento de pagar**
- Evidencia: el hint "¡Añade a alguien más: 2º retrato con −X%!" del resumen se renderiza también en el paso 5 (`app/order/page.tsx:452-474`, el sidebar/drawer con `OrderSummary` vive en todos los pasos ≥2, `:1028-1037`), y `FamilyTierBar` en el drawer del carrito (`:1064`).
- Riesgo: en los pasos 2-4 el incentivo ayuda; en el paso 5 (tarjeta en mano) cualquier CTA que saque al usuario del pago es fricción neta — volver atrás re-abre decisiones ya tomadas.
- Fix propuesto: suprimir los hints de upsell cuando `step === 5` (dejar el resumen puro).
- Esfuerzo: **S**

**M3 — Errores de reCAPTCHA divergentes entre PayPal y Mercado Pago**
- Evidencia: en PayPal el token es best-effort con timeout (`app/order/useCheckout.ts:577-582` — si falla, sigue sin token); en MP es bloqueante: `createMpOrder` hace `await getRecaptchaToken('checkout')` sin try/catch ni timeout (`:640`) — si grecaptcha no cargó (adblocker, red), la promesa puede quedar pendiente y el Brick muestra un error genérico o nada.
- Riesgo: los usuarios COP (mitad del negocio) tienen un modo de fallo silencioso que los USD no tienen.
- Fix propuesto: replicar el patrón best-effort con `withTimeout` en `createMpOrder`.
- Esfuerzo: **S**

### 🟡 Severidad BAJA

**B1 — Fotos perdidas al recargar, sin aviso**
- Evidencia: la persistencia restaura selección/paso/contacto pero no las fotos (`app/order/useCheckout.ts:243-265`, `photos: []` explícito — los `File` no son serializables).
- Riesgo: usuario que recarga en el paso 4 cree que sus fotos siguen; el contador vuelve a 0 sin explicación. Mitigado porque las fotos son opcionales y hay "envíalas después".
- Fix propuesto: al rehidratar con fotos previamente elegidas (guardar solo el count), mostrar un aviso "Vuelve a añadir tus fotos o envíalas después".
- Esfuerzo: **S**

### ✅ Lo que ya está bien (mantener)

- **Persistencia real del carrito:** localStorage rehidrata selección + contacto + paso (máx 4) al recargar (`useCheckout.ts:243-265`) ✅; entrada con `?style=` resetea a funnel nuevo ✅.
- **Recuperación de carritos abandonados:** sync best-effort al servidor con contacto y paso (`useCheckout.ts:409-440`) + cron `api/cron/recover-carts` + código en URL del email (`?code=`, `useCheckout.ts:229-237`) ✅.
- **Pagar sin fotos, enviarlas después:** implementado y comunicado (banner verde `StartNowBanner`, `app/order/page.tsx:36-53,651`; fotos opcionales en `canAdvance`, `useCheckout.ts:460-468`; `/checkout/success` pide las fotos si faltan) ✅ — exactamente lo que el prompt sugería evaluar.
- **Errores de validación por paso:** ring rojo + shake + scroll al campo (`useCheckout.ts:513-525`) y mensaje visible en la barra fija ✅.
- **Ventana en blanco de PayPal:** resuelta con SDK v6 `presentationMode="modal"` + abort/timeout en `createOrder` (`app/order/page.tsx:908-936`, `useCheckout.ts:584-607`) ✅.
- **Error de upload con mensaje claro** (`t.studio.errors.upload`, `useCheckout.ts:532-539`) ✅.

---

## Checklist del prompt

| Punto | Estado | Evidencia |
|---|---|---|
| Mapear funnel real con GA | ❌ FALLA — no hay eventos GA en el código; imposible medir | A1 |
| Cronometrar subida con conexión lenta / indicador de progreso | ⚠️ PARCIAL — timeouts sólidos, pero único feedback es spinner del botón | M1 |
| Estados de error: ¿el usuario siempre sabe qué pasó? | ⚠️ PARCIAL — upload/creación de orden ✅; captura PayPal ❌; reCAPTCHA en MP ❌ | A2, M3 |
| ¿Pagar sin fotos y enviarlas después? | ✅ CUMPLE — implementado con banner + success que las pide | ✅ |
| Botón "Add 2 more and get 15% OFF": ¿ayuda o distrae? | ⚠️ PARCIAL — útil en pasos 2-4; distrae en el paso 5 | M2 |
| Persistencia al recargar en paso 4 | ✅ CUMPLE (salvo fotos, sin aviso) | ✅ / B1 |

## Tabla resumen

| ID | Hallazgo | Severidad | Esfuerzo | Estado |
|---|---|---|---|---|
| A1 | Funnel sin eventos GA: conversión a ciegas | Alta | M | Pendiente |
| A2 | Fallo de captura PayPal sin mensaje garantizado | Alta | S | Pendiente |
| M1 | Subida de fotos sin progreso visible | Media | M | Pendiente |
| M2 | Upsell visible en el paso de pago | Media | S | Pendiente |
| M3 | reCAPTCHA bloqueante solo en el flujo MP (COP) | Media | S | Pendiente |
| B1 | Fotos perdidas al recargar, sin aviso | Baja | S | Pendiente |
