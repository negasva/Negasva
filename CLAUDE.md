@AGENTS.md

# Flujo de trabajo de Git (instrucción permanente)

Estas reglas aplican SIEMPRE, en cada sesión, sin necesidad de que el usuario
las repita:

1. **Commit automático.** Al terminar una tarea (cambios completos y, cuando
   aplique, con el build pasando), haz `git commit` con un mensaje claro y
   descriptivo en presente. No preguntes para commitear.

2. **Push automático.** Después de commitear, haz `git push` a la rama de
   trabajo de la sesión sin preguntar. Usa `git push -u origin <rama>`.

3. **Pull request + auto-merge a `main`.** Tras el push, si no existe ya un PR
   para la rama, crea uno hacia `main` **siempre como *ready for review* (NO
   draft)** y habilita el **auto-merge** del PR (`enable_pr_auto_merge`, método
   `squash`). Así, cuando CI pase en verde, el PR se funde solo a `main` sin
   intervención manual.

4. **Mensajes de commit.** Claros, concisos, en presente (p. ej.
   `fix(navbar): ...`, `perf: ...`). Una línea de resumen y, si hace falta,
   cuerpo explicando el porqué.

5. **Seguridad.** No commitear secretos, `.env`, claves ni el identificador de
   modelo. Nunca forzar push (`--force`) sobre `main`.

## Buenas prácticas por área

Antes de tocar código de cada área, lee su archivo de buenas prácticas:

- Antes de tocar código relacionado con seguridad/autenticación admin, leer
  `audits/seguridad/autenticacion-admin/BUENAS_PRACTICAS.md`.
- Antes de tocar migraciones Supabase, RLS o clientes de base de datos, leer
  `audits/seguridad/rls-supabase/BUENAS_PRACTICAS.md`.
- Antes de tocar validación de inputs, esquemas Zod, subida de archivos o emails, leer
  `audits/seguridad/validacion-inputs/BUENAS_PRACTICAS.md`.
- Antes de tocar checkout, pagos, pricing o tasas de cambio, leer
  `audits/pagos-y-dinero/integridad-precios/BUENAS_PRACTICAS.md`.
- Antes de tocar webhooks de pago, leer
  `audits/pagos-y-dinero/webhooks/BUENAS_PRACTICAS.md`.
- Antes de tocar código relacionado con confiabilidad y operación, leer
  `audits/confiabilidad/manejo-errores/BUENAS_PRACTICAS.md`.
- Antes de tocar código relacionado con seguridad (CSP/headers), leer
  `audits/seguridad/csp-headers/BUENAS_PRACTICAS.md`.
- Antes de tocar rutas API o límites de tráfico, leer
  `audits/seguridad/rate-limiting-antiabuso/BUENAS_PRACTICAS.md`.
- Antes de tocar variables de entorno o dependencias, leer
  `audits/seguridad/secretos-dependencias/BUENAS_PRACTICAS.md`.
- Antes de tocar webhooks, estados de pedido o reembolsos, leer
  `audits/pagos-y-dinero/conciliacion-pedidos/BUENAS_PRACTICAS.md`.
- Antes de tocar rendimiento (Core Web Vitals), leer
  `audits/rendimiento/core-web-vitals/BUENAS_PRACTICAS.md`.
- Antes de tocar imágenes, leer
  `audits/rendimiento/imagenes/BUENAS_PRACTICAS.md`.
- Antes de tocar el bundle JS o el checkout, leer
  `audits/rendimiento/bundle-checkout/BUENAS_PRACTICAS.md`.
- Antes de tocar el funnel de checkout (conversión/UX), leer
  `audits/conversion/friccion-checkout/BUENAS_PRACTICAS.md`.
- Antes de tocar señales de confianza (reseñas, garantías, páginas legales), leer
  `audits/conversion/senales-confianza/BUENAS_PRACTICAS.md`.
- Antes de tocar experiencia móvil, el wizard de checkout o el order page, leer
  `audits/conversion/mobile-responsive/BUENAS_PRACTICAS.md`.
- Antes de tocar subida de fotos, el bucket `order-photos` o datos personales, leer
  `audits/datos-y-privacidad/datos-personales-fotos/BUENAS_PRACTICAS.md`.
- Antes de tocar analytics, scripts de terceros, páginas legales o newsletter, leer
  `audits/datos-y-privacidad/cumplimiento-legal/BUENAS_PRACTICAS.md`.
- Antes de tocar logging, alertas, webhooks o crons (monitoreo), leer
  `audits/confiabilidad/monitoreo-alertas/BUENAS_PRACTICAS.md`.
- Antes de tocar migraciones, buckets o configuración de infraestructura (backups), leer
  `audits/confiabilidad/backups-recuperacion/BUENAS_PRACTICAS.md`.
- Antes de tocar códigos de descuento, promociones o el conteo de usos, leer
  `audits/pagos-y-dinero/codigos-descuento/BUENAS_PRACTICAS.md`.
- Antes de tocar caching, cabeceras Cache-Control o TTLs de catálogo, leer
  `audits/rendimiento/caching-api/BUENAS_PRACTICAS.md`.
- Antes de tocar tokens de color, el wizard o componentes interactivos (accesibilidad), leer
  `audits/conversion/accesibilidad/BUENAS_PRACTICAS.md`.
- Antes de tocar textos, CTAs, i18n o emails transaccionales (copy), leer
  `audits/conversion/copy-cta/BUENAS_PRACTICAS.md`.
- Antes de tocar analytics, eventos de conversión o el evento purchase, leer
  `audits/datos-y-privacidad/analitica-eventos/BUENAS_PRACTICAS.md`.
