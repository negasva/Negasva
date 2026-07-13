# REPORTE — Señales de confianza

**Fecha:** 2026-07-13 · **Auditor:** Claude Code (solo diagnóstico, análisis de código
y contenido; sin acceso a producción desde el sandbox).

---

## Hallazgos

### 🟠 Severidad MEDIA (no hay críticos; la base es sólida)

**M1 — "✓ Verified purchase" hardcodeado en TODAS las reseñas, sean reales o no**
- Evidencia: `components/TestimonialsScroll.tsx:69` — el sello se pinta incondicionalmente para cada testimonio; los testimonios se editan libremente en el admin (`landing_config.home_content`) y el default del repo trae ejemplos de fábrica (`lib/content/homeContent.ts`).
- Riesgo: si un visitante (o la FTC/consumer authority del mercado objetivo, EE.UU.) detecta reseñas de relleno marcadas como "compra verificada", el daño de confianza supera con creces el beneficio; es además terreno legal delicado en EE.UU.
- Fix propuesto: hacer del sello un campo por-testimonio en el admin (default off) y usarlo solo con pedidos reales verificables; considerar enlazar reseñas de una fuente externa (Google, Trustpilot, Etsy) que un escéptico pueda comprobar.
- Esfuerzo: **S**

**M2 — La garantía existe pero es inconsistente entre superficies**
- Evidencia: la home promete "Unlimited revisions" (`lib/content/homeContent.ts:134`); las traducciones dicen "Revisions included" (`lib/i18n/translations.ts:40`); los términos dicen "Minor adjustments are included at no extra cost during the first 24 hours after delivery" y reembolso solo en 7 días si no llegó o no coincide con las instrucciones (`app/terms/page.tsx:52-54`); el blog dice "a revision included" (`lib/content/blogPosts.ts:315`).
- Riesgo: "ilimitadas" vs "una" vs "ajustes menores 24 h" — el comprador escéptico que compara (justo el que más necesita la garantía) encuentra la contradicción; y en disputa de pago, el texto más generoso publicado juega en contra.
- Fix propuesto: definir UNA política (p. ej. "1 revisión incluida, reembolso si no te llega o no se parece") y alinearla en home, FAQ, términos y blog; mostrarla también en el paso 5.
- Esfuerzo: **S**

**M3 — El track-order funciona pero no reduce toda la ansiedad que podría**
- Evidencia: `app/track-order/page.tsx` + `app/api/track/route.ts` — flujo completo, requiere referencia + email (bien por privacidad, 404 genérico anti-enumeración ✅), muestra 4 etapas de producción. No muestra fecha estimada de entrega ni el compromiso de 48 h/exprés del pedido, y el label de estado llega solo en español (`STATUS_LABEL`, `app/api/track/route.ts:11-17`) aunque la UI esté en EN/FR.
- Riesgo: el comprador post-pago con ansiedad quiere una fecha, no solo una etapa; el label en español rompe la experiencia EN.
- Fix propuesto: añadir `createdAt + SLA` → "entrega estimada: X"; devolver el status key y traducirlo en el cliente (la infraestructura i18n ya existe).
- Esfuerzo: **S**

### 🟡 Severidad BAJA

**B1 — Refuerzo de confianza en el paso de pago: bueno, con un hueco**
- Evidencia: paso 5 con candado + "SSL" + proveedor + "no guardamos tu tarjeta" (`app/order/page.tsx:859-863` y `PaymentTrustStrip`, `:164-184`); flotante de WhatsApp visible también en `/order` (`components/SocialFloats.tsx:97,105`).
- Hueco: no hay una línea explícita "¿Dudas? Escríbenos por WhatsApp" junto a los botones de pago (el flotante compite con la barra fija y puede pasar inadvertido), ni recordatorio de la garantía/revisiones en el momento exacto del pago.
- Fix propuesto: una línea bajo `PaymentTrustStrip` con la garantía y el link `wa.me` directo.
- Esfuerzo: **S**

**B2 — Galería y testimonios dependen 100% del contenido cargado en el admin**
- Evidencia: `components/GalleryMarquee.tsx:17-22` cae a 4 placeholders "Photo here" si `/api/gallery` viene vacío; los retratos del hero muestran "Photo here" sin imagen configurada (`app/home-islands.tsx:13-29`); las tarjetas de reseña muestran icono de cámara sin foto (`components/TestimonialsScroll.tsx:37-48`).
- Riesgo: si el contenido real no está cargado en producción, la landing muestra cajas vacías — la anti-señal de confianza por excelencia. No verificable desde el sandbox: **revisar producción**.
- Fix propuesto: checklist de contenido mínimo en producción (hero before/after real, ≥8 piezas de galería, ≥4 reseñas con foto del retrato entregado).
- Esfuerzo: **S** (tarea de contenido, no de código)

### ✅ Lo que ya está bien (mantener)

- **Páginas legales completas y enlazadas:** `/terms`, `/privacy`, `/cookies`, `/contact`, `/faq` existen y están en el footer en las 3 columnas editables (`components/PageFooter.tsx:50-57`) ✅.
- **Ejemplos antes de comprar:** hero Before/After real (`app/home-islands.tsx:45-83`), marquee "Real portraits, hand-drawn" (`components/GalleryMarquee.tsx`), `/gallery`, `BeforeAfterSlider` en landings ✅.
- **Promesas concretas arriba del fold:** "Delivered in 48 hours · revisions · 100% hand-drawn, no AI" (trust strip, `app/page.tsx:163-170`) + prueba social dinámica "N portraits ordered this week" solo si N ≥ 3 (`app/home-islands.tsx:145-158`, umbral sensato que evita mostrar cifras pobres) ✅.
- **Confianza en el pago:** candado/SSL/métodos/no guardamos tarjeta + cuotas sin interés para COP ✅ (B1 solo pide rematarlo).
- **Track-order seguro** (referencia + email, 404 genérico, rate limit) ✅.
- **FAQ con garantía de reembolso si la foto no da** (`lib/i18n/pages/faq.ts:45`) ✅.

---

## Checklist del prompt

| Punto | Estado | Evidencia |
|---|---|---|
| ¿Ejemplos reales de retratos entregados antes de comprar? | ✅ CUMPLE en código (hero, marquee, /gallery); contenido real en prod: verificar | ✅ / B2 |
| ¿Reseñas/testimonios con foto y creíbles? | ⚠️ PARCIAL — estructura sí (foto + nombre + estrellas); "Verified purchase" hardcodeado resta credibilidad | M1 |
| ¿Garantía explícita (revisiones, reembolso, tiempos)? | ⚠️ PARCIAL — existe en 4 sitios con 3 versiones distintas | M2 |
| ¿Términos, privacidad, reembolsos y contacto enlazados? | ✅ CUMPLE | ✅ |
| ¿Refuerzo de confianza en el paso de pago? | ⚠️ PARCIAL — candado/métodos/SSL ✅; falta garantía + WhatsApp explícito ahí | B1 |
| ¿Track-order funciona y da info útil? | ⚠️ PARCIAL — funciona y es seguro; sin fecha estimada y label solo ES | M3 |

## Tabla resumen

| ID | Hallazgo | Severidad | Esfuerzo | Estado |
|---|---|---|---|---|
| M1 | "Verified purchase" hardcodeado en todas las reseñas | Media | S | Pendiente |
| M2 | Garantía inconsistente (ilimitada vs 1 revisión vs 24 h) | Media | S | Pendiente |
| M3 | Track-order sin fecha estimada; label solo en español | Media | S | Pendiente |
| B1 | Falta garantía + WhatsApp explícito junto al botón de pago | Baja | S | Pendiente |
| B2 | Verificar contenido real cargado en producción (hero/galería/reseñas) | Baja | S | Pendiente |
