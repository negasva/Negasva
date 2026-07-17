# BUENAS PRÁCTICAS — Cumplimiento legal (GDPR / Habeas Data / cookies) (negasva.shop)

Vendemos a la UE (EUR/GBP), Norteamérica y Colombia: aplican GDPR, ePrivacy,
Habeas Data colombiana y reglas de cookies. Al tocar analytics, scripts de
terceros, páginas legales, newsletter o emails de marketing:

1. **Nunca cargues cookies/tracking no esenciales antes del consentimiento.** GA,
   Ahrefs, píxeles o cualquier script de terceros de analítica/marketing arrancan
   SOLO tras el opt-in del visitante (Consent Mode v2, default `denied`). Al añadir
   un script en `app/layout.tsx`, pregúntate primero si es esencial; si no, va tras
   el banner.

2. **La política dice solo lo que el código cumple.** Antes de publicar cualquier
   afirmación sobre retención, borrado o seguridad en `/privacy` o `/terms`,
   verifica que exista la implementación. Una promesa incumplida es una declaración
   falsa en una disputa de pago.

3. **Todo email de marketing lleva baja funcional.** Newsletter y recuperación de
   carrito incluyen un link de unsubscribe con token que realmente da de baja. Sin
   unsubscribe operativo no se envía marketing.

4. **El opt-in es explícito, nunca premarcado.** El suscriptor envía el formulario
   activamente (con reCAPTCHA). No añadas casillas de consentimiento marcadas por
   defecto ni suscribas a alguien por comprar.

5. **Declara el tratamiento de imágenes de menores.** Las fotos pueden incluir
   niños; la política debe decir que el consentimiento lo da el adulto comprador y
   que el servicio no se dirige a menores. Al tocar el flujo de fotos, revisa que la
   cláusula siga presente.

6. **Mantén `/privacy`, `/terms` y `/cookies` existentes y enlazados en el footer.**
   Si añades una página legal nueva, enlázala el mismo día. Si retiras una, revisa
   que ningún email o página apunte a ella.

7. **Los derechos ARCO/GDPR deben ser ejercibles de verdad.** Mantén una vía de
   contacto para acceso/borrado y un proceso interno que los cumpla dentro de plazo
   (ver buenas prácticas de "datos personales y fotos").

8. **Cualquier script de terceros nuevo se documenta en `/cookies`.** Si añades un
   proveedor que setea cookies, actualiza la página de cookies y el banner en el
   mismo cambio.
</content>
