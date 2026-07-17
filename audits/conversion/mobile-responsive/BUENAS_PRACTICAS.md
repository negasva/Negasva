# BUENAS PRÁCTICAS — Experiencia móvil (negasva.shop)

La mayoría del tráfico es móvil y el flujo (subir fotos + wizard de 5 pasos +
popup de PayPal) es sensible a pantallas pequeñas y conexiones lentas. Al tocar
`app/order/**`, el wizard o cualquier componente de checkout:

1. **Nunca pongas un `<input>`, `<textarea>` o `<select>` por debajo de 16px.**
   iOS Safari hace zoom automático al enfocar cualquier campo con `font-size < 16px`.
   Usa `text-base` (o `text-[16px]`) como mínimo en todo campo editable.

2. **Todo control táctil mide ≥ 44×44px.** Botones, enlaces de acción ("quitar",
   "cambiar paso"), checkboxes. Usa `min-h-[44px]` y padding suficiente; no confíes
   solo en `text-xs` + padding pequeño.

3. **Nunca fijes `maximumScale` ni `userScalable:false` en el viewport.** El
   pinch-zoom debe seguir disponible (accesibilidad). El viewport actual
   (`width=device-width`, `initialScale:1`, `viewportFit:"cover"`) es la
   referencia — no lo endurezcas.

4. **Toda compresión/procesamiento de imagen en cliente va con timeout y
   `AbortController`.** El patrón de `useCheckout.ts` (import con `withTimeout`,
   `useWebWorker:true`, abort en la subida) evita el "worker colgado". Si añades
   otro paso pesado, dale su propio timeout: el flujo SIEMPRE debe terminar en
   éxito o error visible, nunca quedarse girando.

5. **El popup de PayPal vuelve por `onApprove`, no por redirect.** Mantén el flujo
   in-context de `@paypal/react-paypal-js` para no perder el estado del wizard. Si
   el popup se cierra sin aprobar, muestra un estado claro de "pago no completado,
   reintenta"; y asegúrate de que la captura sea idempotente ante doble intento.

6. **Respeta el safe-area inferior en toda barra fija.** Cualquier CTA o barra
   `fixed bottom-0` lleva `pb-[max(...,env(safe-area-inset-bottom))]` para no
   quedar bajo la barra de gestos del iPhone.

7. **En móvil, el resumen de pedido se abre como modal a pantalla completa, no
   como sidebar encimado.** No conviertas el modal en un overlay que tape los
   campos del paso activo.

8. **Prueba en device real antes de dar por bueno un cambio de checkout.** El
   emulador no reproduce el popup de PayPal, el zoom de inputs ni el bloqueo de
   popups. Verifica en iOS Safari y Android Chrome el flujo completo: subir foto →
   wizard → pago → retorno.
</content>
