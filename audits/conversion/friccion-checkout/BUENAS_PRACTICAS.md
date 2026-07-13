# BUENAS PRÁCTICAS — Funnel de checkout (negasva.shop)

1. **Todo estado de error del checkout debe decirle al usuario qué pasó Y qué
   hacer.** Nunca un `throw` sin `setCheckoutError` en un camino que el usuario
   pueda pisar (upload, create order, capture, brick). El peor error es el
   silencioso después de aprobar un pago.

2. **Toda operación async del checkout lleva timeout/abort** (patrón
   `withTimeout` de `useCheckout.ts`). Un botón de pago jamás puede quedar
   cargando para siempre. Aplícalo igual en los flujos PayPal Y Mercado Pago —
   sin divergencias entre monedas.

3. **Operaciones > 3 s necesitan feedback de progreso**, no solo spinner:
   subida de fotos, compresión, redirecciones a banco.

4. **En el paso de pago (5) no se vende nada más.** Upsells, incentivos
   familiares y descuentos viven en los pasos 1-4; el paso 5 es resumen + pago.

5. **Nunca rompas la persistencia del carrito:** cambios en
   `CheckoutSelection` deben seguir siendo serializables a localStorage y
   compatibles con el estado guardado previo (o migrar/descartar con gracia,
   nunca crashear al rehidratar).

6. **Las fotos son opcionales por diseño** ("paga ya, envíalas después"). No
   agregues validaciones que vuelvan a exigirlas antes de pagar.

7. **Instrumenta lo que toques:** cualquier cambio al wizard debe mantener (o
   añadir) los eventos GA4 del funnel (paso alcanzado, begin_checkout,
   add_payment_info, purchase, error de pago). Sin datos no hay optimización.

8. **reCAPTCHA es best-effort en el cliente**: nunca puede bloquear un pago si
   Google no responde; el servidor decide qué hacer cuando falta el token.

9. **Prueba cada cambio del checkout en móvil con red lenta** (DevTools →
   Slow 3G) y con adblocker activo antes de dar por bueno el flujo.
