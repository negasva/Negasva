# BUENAS PRÁCTICAS · Manejo de errores y estados de fallo (negasva.shop)

Reglas permanentes para cualquier sesión que toque confiabilidad, checkout o APIs.

## Red y timeouts
1. **Nunca** hagas un `fetch` a un proveedor externo (PayPal, Mercado Pago, Printful, Resend, reCAPTCHA, DeepL) sin timeout: usa `AbortSignal.timeout(10_000)` server-side o `AbortController` + timer en cliente.
2. **Siempre** que una promesa pueda colgarse en el flujo de compra, envuélvela con el helper `withTimeout` de `app/order/useCheckout.ts` — replica el patrón de `uploadPhotos`/`createPayPalOrder`.
3. reCAPTCHA es **best-effort**: si tarda o falla, continúa sin token (el backend no bloquea). Nunca dejes que reCAPTCHA cuelgue un pago.

## Qué ve el usuario
4. **Nunca** un `catch` vacío o solo-`console.error` en una acción iniciada por el usuario (pagar, subir fotos, aplicar código): siempre `setError(...)` con mensaje traducido y opción de reintentar.
5. `catch(() => null)` solo se permite en cargas **con fallback visible** (catálogos con `FALLBACK_*`) o telemetría best-effort (sync de carrito). Documenta el porqué en un comentario.
6. Todo botón que dispare red debe salir SIEMPRE del estado "cargando": éxito, error visible o timeout. Prohibido el spinner infinito.
7. Errores post-aprobación de pago (captura) se comunican distinto a errores pre-pago: incluye la referencia/orderID y "no vuelvas a pagar; revisa tu email o contáctanos".

## Página de éxito y estado de pedidos
8. **Nunca** asumas éxito por llegar a `/checkout/success` ni por query params: el estado autoritativo vive en la BD (lo fija el webhook). Valida el `ref` contra el servidor antes de mostrar "¡Pago recibido!".
9. Los pasos post-pago críticos (subir fotos) nunca se ocultan por un error de red: muestra reintento; `hidden` solo si el servidor confirma que no aplica.

## APIs
10. **Siempre** usa `errorResponse()` de `lib/security/apiHelpers.ts` para errores JSON: mensaje público seguro, detalle solo en logs. Nunca devuelvas mensajes de error de Supabase/proveedores al cliente.
11. Incluye (cuando se implemente) el `requestId` de correlación en el log y en la respuesta de error, y muéstralo en la UI del checkout.
12. Webhooks: responde 200 rápido a lo que no aplica y 4xx/5xx solo cuando quieras retry del proveedor; jamás filtres detalle interno.

## Precios
13. El precio autoritativo viene SIEMPRE del servidor (`/api/pricing/quote`); el cliente solo renderiza. Nunca reintroduzcas aritmética de precios en cliente.
14. No permitas avanzar al pago con `quote.total === 0` habiendo selección válida: eso es un quote fallido, no un pedido gratis.

## Estructura
15. Mantén `app/error.tsx`, `app/global-error.tsx` y `app/not-found.tsx` (cuando existan) con branding, CTA de recuperación y logging — no los borres al refactorizar.
