# REPORTE — Copy, CTAs e idiomas

**Fecha:** 2026-07-17 · **Auditor:** Claude Code (solo diagnóstico, análisis de código).

> ⚠️ **Hay inglés incrustado en la pantalla de pago y acentos rotos (mojibake)
> visibles al usuario.** El sitio vende en EN/ES/FR, pero varias cadenas del
> checkout están fijas en inglés o con caracteres corruptos — desconfianza justo
> en el paso del dinero. No arreglo nada aquí; lo documento.

---

## Hallazgos

### 🟠 Severidad MEDIA

**M1 — Texto fijo en inglés en la pantalla de pago (ignora el idioma del cliente)**
- Evidencia: `'Secure payment - 256-bit SSL - we never store your card'` se pasa igual a los tres idiomas vía `pick3` (`app/order/page.tsx:174-176`); `<span>Secure payment</span>` está literal sin traducir (`app/order/page.tsx:861`); `Fill in your name and email above to continue to payment.` fijo en inglés (`app/order/page.tsx:867`).
- Riesgo: un cliente en ES/FR ve mezcla EN/ES en el momento del pago (justo lo que mostraba la captura del paso 5) → percepción de sitio a medio hacer y abandono.
- Fix propuesto: mover estas cadenas a `lib/i18n/translations.ts` con las 3 variantes reales y consumirlas con la key, no con `pick3` de un literal repetido.
- Esfuerzo: **S**

**M2 — Mojibake (acentos doble-codificados) en cadenas visibles del wizard**
- Evidencia: `MarÃƒÂ­a GarcÃƒÂ­a` (`app/order/page.tsx:270`), `EnvÃƒÂ­o calculado` (`app/order/page.tsx:414`), `Paiement sÃƒÂ©curisÃƒÂ©` (`app/order/page.tsx:1077`) — UTF-8 doble-codificado que se renderiza como basura.
- Riesgo: el cliente ve "MarÃƒÂ­a" o "sÃƒÂ©curisÃƒÂ©" en placeholders y etiquetas → se ve roto y poco confiable.
- Fix propuesto: re-guardar esas cadenas en UTF-8 correcto (`María`, `Envío`, `sécurisé`); idealmente moverlas a `translations.ts` que ya está en UTF-8 sano.
- Esfuerzo: **S**

**M3 — Emails transaccionales solo en español, sin importar el idioma del cliente**
- Evidencia: `emails/order-confirmation.html` está fijo en `lang="es"` (`emails/order-confirmation.html:9`); el email de recuperación de carrito admite ser solo ES por diseño (`lib/notify/cartRecovery.ts:5-6` "Idioma: español (mercado principal)").
- Riesgo: un cliente que compró en EN/FR recibe la confirmación y la recuperación en español → confusión y menor recuperación de carritos.
- Fix propuesto: guardar el idioma del pedido/carrito y renderizar el email en ese idioma (plantillas EN/ES/FR o cadenas parametrizadas).
- Esfuerzo: **M**

### 🟡 Severidad BAJA

**B1 — CTA genérico "Siguiente / Next" en vez de orientado al beneficio**
- Evidencia: `next: 'Next' / 'Siguiente' / 'Suivant'` (`lib/i18n/translations.ts:182,498`) para avanzar en el wizard.
- Riesgo: bajo — un CTA con beneficio ("Crear mi retrato", "Personalizar mi pedido") convierte algo más que un "Siguiente" neutro.
- Fix propuesto: usar copy con beneficio en los pasos clave, dejando "Siguiente" solo para transiciones menores.
- Esfuerzo: **S**

### ✅ Lo que ya está bien (mantener)

- **i18n centralizado y completo** en `lib/i18n/translations.ts` (952 líneas) con las tres lenguas y páginas por sección en `lib/i18n/pages/**` ✅.
- **La mayoría del checkout SÍ está traducido** vía keys (`translations.ts:151,155,184,467`, `t.studio.step4.*`) — el problema son cadenas puntuales fuera del sistema ✅.
- **Microcopy de error humano y accionable** ("Completa los datos resaltados para continuar", no un stacktrace) (`translations.ts:185,501,817`) ✅.
- **CTA de pago con beneficio/seguridad** ("Pago seguro / Secure Checkout / Paiement sécurisé") bien traducido vía `pick3` con las 3 variantes reales (`app/order/page.tsx:1077`) ✅.

## Checklist del prompt

| Punto | Estado | Evidencia |
|---|---|---|
| Textos del checkout naturales en los 3 idiomas (sin mezclas EN/ES) | ❌ FALLA — inglés fijo en el paso de pago | M1 |
| CTAs con beneficio, no genéricos | ⚠️ PARCIAL — "Siguiente" neutro, pago sí con beneficio | B1 |
| Precios/fechas/monedas formateados por locale | ✅ CUMPLE (ver auditoría integridad-precios y mobile) | — |
| Emails de confirmación en el idioma del cliente | ❌ FALLA — solo español | M3 |
| Microcopy de errores humano y accionable | ✅ CUMPLE | `translations.ts:185` |
| (extra) Acentos correctos en todas las cadenas | ❌ FALLA — mojibake en el wizard | M2 |

## Tabla-resumen (para marcar al arreglar)

| ID | Severidad | Hallazgo | Esfuerzo | Estado |
|---|---|---|---|---|
| M1 | 🟠 Media | Inglés fijo en la pantalla de pago | S | Pendiente |
| M2 | 🟠 Media | Mojibake (acentos rotos) en el wizard | S | Pendiente |
| M3 | 🟠 Media | Emails transaccionales solo en español | M | Pendiente |
| B1 | 🟡 Baja | CTA "Siguiente" genérico, sin beneficio | S | Pendiente |
