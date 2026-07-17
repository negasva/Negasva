# Buenas prácticas — Accesibilidad (a11y)

Reglas permanentes para este proyecto. Léelas antes de tocar tokens de color, el
wizard (`app/order/**`) o cualquier componente interactivo.

- **Nunca** uses el rosa claro `#FC90B6` (`primary`, `primary-light`,
  `primary-lighter`) como color de TEXTO sobre fondo claro, ni texto blanco
  sobre ese rosa: no llega a 4.5:1. Reserva el rosa claro para elementos no
  textuales (iconos decorativos, bordes, fondos).
- **Siempre** usa un tono de acción con contraste ≥4.5:1 (texto normal) o ≥3:1
  (texto grande / iconos de UI) para superficies con texto. Verifica cada
  combinación nueva con un chequeo de contraste antes de commitear.
- **Nunca** dejes `outline-none` sin un reemplazo visible. Siempre añade
  `focus-visible:ring-2` (con color de contraste ≥3:1) en botones, inputs y
  enlaces. El teclado debe poder recorrer todo el wizard con foco visible.
- **Siempre** asocia un `<label>` a cada input por `id`/`htmlFor` (o al menos
  `aria-label`). El `placeholder` NO es una etiqueta.
- **Siempre** anuncia los errores de validación en una región
  `role="alert"`/`aria-live` y mueve el foco al primer campo inválido.
- **Siempre** da `alt` significativo a las imágenes de catálogo (patrón actual:
  `alt={s.name}`), y `alt=""` a las puramente decorativas.
- **Siempre** pon `aria-label` a los botones que solo tienen icono (patrón ya
  usado para añadir/quitar/cerrar).
- No comuniques estado solo con color: acompaña con icono, texto o forma (como
  el anillo del paso activo del wizard).
- Corre axe-core/Lighthouse a11y sobre home, `/order` y `/pricing` antes de
  cerrar cualquier cambio de UI grande.
