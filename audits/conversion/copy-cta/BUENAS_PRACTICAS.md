# Buenas prácticas — Copy, CTAs e idiomas

Reglas permanentes para este proyecto (vende en EN/ES/FR y 6 monedas). Léelas
antes de tocar `lib/i18n/**`, textos del wizard/landing o los emails.

- **Nunca** dejes texto literal en un componente. Toda cadena visible vive en
  `lib/i18n/translations.ts` (o `lib/i18n/pages/**`) con sus tres variantes reales
  (EN/ES/FR) y se consume por key.
- **Nunca** uses `pick3(...)` con el mismo literal en las tres posiciones: eso es
  inglés disfrazado de i18n. Si usas `pick3`, las tres cadenas deben ser
  traducciones reales.
- **Siempre** guarda las cadenas en UTF-8 correcto (`María`, `Envío`, `sécurisé`).
  Nunca commitees mojibake (`Ã…`, `ÃƒÂ­`). Prefiere `translations.ts`, que ya está
  en UTF-8 sano, sobre literales incrustados en `.tsx`.
- **Siempre** revisa que NINGUNA pantalla mezcle idiomas, con foco especial en el
  paso de pago (badges de "pago seguro", ayudas, errores).
- **Siempre** escribe el CTA con el beneficio ("Crear mi retrato",
  "Personalizar mi pedido") en los pasos de decisión; deja "Siguiente/Next"
  solo para transiciones menores.
- **Siempre** envía los emails transaccionales (confirmación, recuperación de
  carrito) en el idioma del cliente. Persiste el idioma del pedido/carrito y
  renderiza la plantilla correspondiente; no asumas español.
- **Siempre** formatea precios, fechas y monedas según el locale del cliente
  (usar los helpers existentes, no concatenar a mano).
- El microcopy de error debe ser humano y accionable ("Completa los datos
  resaltados…"), nunca técnico ni un stacktrace.
