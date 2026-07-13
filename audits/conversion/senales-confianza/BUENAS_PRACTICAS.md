# BUENAS PRÁCTICAS — Señales de confianza (negasva.shop)

1. **Una sola versión de la garantía en todo el sitio.** Antes de tocar copy de
   revisiones/reembolsos/tiempos, revisa que home, FAQ, términos, blog y checkout
   digan EXACTAMENTE lo mismo. La fuente de verdad es `/terms`.

2. **Nunca marques como "Verified purchase" (ni equivalente) una reseña que no
   corresponda a un pedido real verificable.** Sello opcional por testimonio,
   default apagado.

3. **No promesas que no se cumplen operativamente.** "Unlimited revisions" solo
   si de verdad son ilimitadas; si son 1, di "1 revisión incluida" — específico
   vende más que inflado y no explota en disputas.

4. **El paso de pago siempre lleva:** candado + método + "no guardamos tu
   tarjeta" + una vía de contacto humana inmediata (WhatsApp). Al tocar el paso
   5, no elimines la `PaymentTrustStrip`.

5. **Los placeholders "Photo here" jamás deben verse en producción.** Antes de
   publicar cambios de landing, verifica hero, marquee y reseñas con contenido
   real cargado.

6. **Track-order es una señal de confianza, no solo una utilidad:** mantenlo
   enlazado en el footer y en el email post-compra; toda respuesta debe seguir
   siendo 404 genérico ante datos incorrectos (anti-enumeración).

7. **Prueba social dinámica con umbral:** el badge "N portraits this week" solo
   se muestra con N ≥ 3. Mantén ese patrón para cualquier contador nuevo: un
   número pobre resta más de lo que suma.

8. **Toda página legal nueva se enlaza en el footer** (columna Legal) el mismo
   día que se publica.
