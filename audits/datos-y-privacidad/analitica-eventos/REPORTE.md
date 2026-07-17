# REPORTE — Analítica y eventos de negocio

**Fecha:** 2026-07-17 · **Auditor:** Claude Code (solo diagnóstico, análisis de código).

> ⚠️ **No hay tracking de conversión: falta por completo el evento `purchase`.**
> GA solo registra pageviews. Hoy es imposible saber cuántas ventas hubo, por qué
> monto, ni de qué canal vienen — se está optimizando a ciegas. No arreglo nada
> aquí; lo documento.

---

## Hallazgos

### 🔴 Severidad ALTA

**A1 — No existe el evento `purchase` (ni cliente ni servidor)**
- Evidencia: GA se carga con `gtag('config', ...)` pero solo dispara el pageview por defecto (`app/layout.tsx:128-138`); no hay ninguna llamada `gtag('event', 'purchase', ...)` en el repo, ni en el éxito de checkout ni en los webhooks (`app/checkout/success/layout.tsx` no emite eventos; búsqueda de `'purchase'` sin resultados de tracking).
- Riesgo: cero visibilidad de ingresos/conversión; no se puede medir ROI de anuncios, ni comparar cambios, ni detectar caídas de ventas.
- Fix propuesto: disparar `purchase` con `transaction_id`, `value`, `currency` e `items`. Idealmente **server-side desde el webhook** vía GA4 Measurement Protocol (el redirect del cliente se pierde a veces), usando el pedido ya confirmado como fuente de verdad del monto.
- Esfuerzo: **M**

**A2 — Sin eventos de funnel (pasos del wizard)**
- Evidencia: no hay eventos `begin_checkout`, `add_to_cart` ni por-paso en `app/order/**` (búsqueda de `gtag(`/`dataLayer` fuera de `layout.tsx`: sin resultados).
- Riesgo: no se sabe en qué paso del wizard se cae la gente → imposible priorizar mejoras de conversión con datos.
- Fix propuesto: emitir un evento GA4 por paso (`view_item`, `begin_checkout`, `add_shipping_info`, `add_payment_info`) desde el wizard.
- Esfuerzo: **M**

### 🟠 Severidad MEDIA

**M1 — Sin atribución UTM / canal de origen**
- Evidencia: no se capturan `utm_*`, `gclid` ni `fbclid` en ninguna parte (búsqueda sin resultados); los enlaces sociales del footer no llevan UTM (`components/SocialFloats.tsx:107,122`, `app/contact/page.tsx:51-54`).
- Riesgo: aunque hubiera evento `purchase`, no se sabría de qué canal (Instagram/TikTok/anuncio) viene cada venta → no se puede decidir dónde invertir.
- Fix propuesto: capturar UTM en la primera visita (persistir en cookie/storage), adjuntarlos al pedido y pasarlos como parámetros de sesión a GA; etiquetar los enlaces salientes propios con UTM.
- Esfuerzo: **M**

**M2 — Montos reportados no verificables (no hay evento con el que cuadrar)**
- Evidencia: al no existir `purchase` (A1), no hay ningún `value`/`currency` que contrastar contra los pedidos reales de la BD.
- Riesgo: cuando se instrumente, es fácil reportar el monto equivocado (mostrado vs cobrado, moneda local vs USD). Este proyecto ya cobra en 6 monedas.
- Fix propuesto: al implementar `purchase`, tomar `value`/`currency` del pedido confirmado (webhook), no del estado del cliente, y validar contra un pedido real en cada release.
- Esfuerzo: **S**

### ✅ Lo que ya está bien (mantener)

- **GA integrado y condicional** a `NEXT_PUBLIC_GA_ID` (no rompe si falta la env) con `Script strategy="afterInteractive"` (`app/layout.tsx:128-138`) ✅.
- **CSP ya permite analytics** sin romperse: `googletagmanager.com`, `google-analytics.com` y `analytics.ahrefs.com` en `script-src` y `connect-src` (`next.config.js:64,68`) — el problema histórico con Ahrefs está resuelto ✅.
- **Ahrefs condicional** a `NEXT_PUBLIC_AHREFS_KEY` (`app/layout.tsx:142-145`) ✅.
- **Página de éxito `noindex`** para no contaminar métricas de SEO/indexación (`app/checkout/success/layout.tsx:5-9`) ✅.

## Checklist del prompt

| Punto | Estado | Evidencia |
|---|---|---|
| Evento `purchase` con monto, moneda e items (idealmente server-side) | ❌ FALLA — no existe | A1 |
| Eventos de cada paso del wizard (funnel) | ❌ FALLA — no existen | A2 |
| Montos reportados cuadran con lo cobrado | ❌ FALLA — sin evento que validar | M2 |
| UTM / atribución de canal | ❌ FALLA — no se captura | M1 |
| Analytics no rompe la CSP | ✅ CUMPLE | `next.config.js:64,68` |

## Tabla-resumen (para marcar al arreglar)

| ID | Severidad | Hallazgo | Esfuerzo | Estado |
|---|---|---|---|---|
| A1 | 🔴 Alta | Falta el evento `purchase` (cliente y servidor) | M | Pendiente |
| A2 | 🔴 Alta | Sin eventos de funnel del wizard | M | Pendiente |
| M1 | 🟠 Media | Sin atribución UTM / canal de origen | M | Pendiente |
| M2 | 🟠 Media | Montos no verificables (sin evento que cuadrar) | S | Pendiente |
