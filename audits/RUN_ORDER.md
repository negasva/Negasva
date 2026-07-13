# ORDEN DE EJECUCIÓN — Auditorías negasva.shop

Ejecuta los items EN ESTE ORDEN EXACTO (de arriba hacia abajo). No saltes ninguno.

| # | Prioridad | Sección | Item | Carpeta del prompt |
|---|---|---|---|---|
| 1 | P0 · Crítico | Seguridad | Autenticación y autorización del panel admin | `audits/seguridad/autenticacion-admin/prompt.md` |
| 2 | P0 · Crítico | Seguridad | Row Level Security (RLS) en Supabase | `audits/seguridad/rls-supabase/prompt.md` |
| 3 | P0 · Crítico | Seguridad | Validación de inputs y subida de archivos | `audits/seguridad/validacion-inputs/prompt.md` |
| 4 | P0 · Crítico | Pagos y dinero | Integridad de precios end-to-end | `audits/pagos-y-dinero/integridad-precios/prompt.md` |
| 5 | P0 · Crítico | Pagos y dinero | Webhooks de pago (PayPal / Mercado Pago / legacy) | `audits/pagos-y-dinero/webhooks/prompt.md` |
| 6 | P0 · Crítico | Confiabilidad y operación | Manejo de errores y estados de fallo | `audits/confiabilidad/manejo-errores/prompt.md` |
| 7 | P1 · Importante | Seguridad | CSP y headers de seguridad | `audits/seguridad/csp-headers/prompt.md` |
| 8 | P1 · Importante | Seguridad | Rate limiting y anti-abuso | `audits/seguridad/rate-limiting-antiabuso/prompt.md` |
| 9 | P1 · Importante | Seguridad | Secretos y dependencias vulnerables | `audits/seguridad/secretos-dependencias/prompt.md` |
| 10 | P1 · Importante | Pagos y dinero | Conciliación de pedidos y reembolsos | `audits/pagos-y-dinero/conciliacion-pedidos/prompt.md` |
| 11 | P1 · Importante | Rendimiento | Core Web Vitals (Lighthouse) | `audits/rendimiento/core-web-vitals/prompt.md` |
| 12 | P1 · Importante | Rendimiento | Optimización de imágenes | `audits/rendimiento/imagenes/prompt.md` |
| 13 | P1 · Importante | Rendimiento | Bundle JS y peso del checkout | `audits/rendimiento/bundle-checkout/prompt.md` |
| 14 | P1 · Importante | Conversión y UX de venta | Fricción en el funnel de checkout | `audits/conversion/friccion-checkout/prompt.md` |
| 15 | P1 · Importante | Conversión y UX de venta | Señales de confianza | `audits/conversion/senales-confianza/prompt.md` |
| 16 | P1 · Importante | Conversión y UX de venta | Experiencia móvil | `audits/conversion/mobile-responsive/prompt.md` |
| 17 | P1 · Importante | Datos y privacidad | Ciclo de vida de fotos y datos personales | `audits/datos-y-privacidad/datos-personales-fotos/prompt.md` |
| 18 | P1 · Importante | Datos y privacidad | Cumplimiento legal (GDPR / Habeas Data / cookies) | `audits/datos-y-privacidad/cumplimiento-legal/prompt.md` |
| 19 | P1 · Importante | Confiabilidad y operación | Monitoreo, logging y alertas | `audits/confiabilidad/monitoreo-alertas/prompt.md` |
| 20 | P1 · Importante | Confiabilidad y operación | Backups y recuperación ante desastres | `audits/confiabilidad/backups-recuperacion/prompt.md` |
| 21 | P2 · Mejora | Pagos y dinero | Códigos de descuento y promociones | `audits/pagos-y-dinero/codigos-descuento/prompt.md` |
| 22 | P2 · Mejora | Rendimiento | Caching de API y datos | `audits/rendimiento/caching-api/prompt.md` |
| 23 | P2 · Mejora | Conversión y UX de venta | Accesibilidad (a11y) | `audits/conversion/accesibilidad/prompt.md` |
| 24 | P2 · Mejora | Conversión y UX de venta | Copy, CTAs e idiomas | `audits/conversion/copy-cta/prompt.md` |
| 25 | P2 · Mejora | Datos y privacidad | Analítica y eventos de negocio | `audits/datos-y-privacidad/analitica-eventos/prompt.md` |
