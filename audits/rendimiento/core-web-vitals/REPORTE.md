# REPORTE — Core Web Vitals (Lighthouse)

**Fecha:** 2026-07-13 · **Alcance:** landing (`/`), `/order`, `/styles/[slug]`, `/products`
**Auditor:** Claude Code (solo diagnóstico, sin cambios de código)

## Nota metodológica (importante)

No fue posible correr Lighthouse ni PageSpeed Insights contra `https://negasva.shop`
desde este entorno: la política de red del sandbox bloquea el dominio (CONNECT 403
del proxy) y la API pública de PSI devolvió 429 (cuota agotada de la clave anónima).
Este reporte se basa en **análisis estático exhaustivo del código** de las 4 páginas
y sus componentes. Las métricas numéricas de campo (LCP/CLS/INP reales) quedan como
acción pendiente para el dueño del repo:

- Correr manualmente https://pagespeed.web.dev/ sobre `/`, `/order`,
  `/styles/simpsons-style-portrait` y `/products` (móvil y desktop) y pegar los
  números en la tabla final.
- Revisar CrUX en Search Console y activar RUM (ver hallazgo A3).

---

## Hallazgos

### 🔴 Severidad ALTA

**A1 — Las imágenes LCP del hero se sirven como `<img>` crudo con el original de Supabase**
- Evidencia: `app/home-islands.tsx:62` y `app/home-islands.tsx:75` — `<img src={img1} … fetchPriority="high" />` con la URL pública de Supabase Storage tal cual (sin `next/image`, sin `srcset`, sin `sizes`).
- Riesgo: el elemento LCP de la landing descarga el archivo original completo (posiblemente varios MB subidos desde el admin) en móvil, disparando el LCP.
- Lo que sí está bien: `fetchPriority="high"` presente, contenedor con `aspect-ratio` fijo (sin CLS), `preconnect` al host de Supabase en `app/layout.tsx:118-122`, y el primer paint usa `initialImages` del servidor (la imagen está en el HTML inicial, no depende de un fetch cliente).
- Fix propuesto: pasar los dos retratos del hero a `next/image` con `fill`/`sizes` + `priority` (ya hay `remotePatterns` para `**.supabase.co` en `next.config.js:11-13`), o al menos generar variantes redimensionadas al subir desde el admin. Añadir `<link rel="preload" as="image">` del LCP si se mantiene `<img>`.
- Esfuerzo: **S**

**A2 — `/order` es 100% client-side: LCP tardío e INP en riesgo en la página que convierte**
- Evidencia: `app/order/page.tsx:1` (`'use client'`, 1080 líneas) + `app/order/useCheckout.ts` (791 líneas); el H1 del paso 1 solo existe tras hidratar. Carga además `RecaptchaScript` (`app/order/page.tsx:522`) en todos los pasos e importa el provider de PayPal en el módulo raíz (`app/order/page.tsx:12`).
- Riesgo: en móvil de gama media el usuario ve página en blanco/esqueleto hasta que baja y ejecuta todo el JS del wizard, justo en la página de compra.
- Fix propuesto: mover header/H1/progreso a un server component contenedor; cargar `StepStyle`… con `next/dynamic`; diferir el import de `@paypal/react-paypal-js` al paso 5 (ver auditoría de bundle, item 13).
- Esfuerzo: **M**

**A3 — Cero telemetría de campo: no hay forma de saber los CWV reales**
- Evidencia: no existe `useReportWebVitals`, `web-vitals`, `@vercel/analytics` ni `@vercel/speed-insights` en el repo (grep en `app/`, `lib/`, `components/`, `package.json`). Solo hay GA4 con el config por defecto (`app/layout.tsx:128-141`).
- Riesgo: cualquier regresión de LCP/CLS/INP pasa inadvertida hasta que baja el ranking o la conversión.
- Fix propuesto: activar Vercel Speed Insights (1 componente) o `useReportWebVitals` → evento GA4; revisar CrUX/Search Console mensualmente.
- Esfuerzo: **S**

### 🟠 Severidad MEDIA

**M1 — `WeeklyOrdersBadge` inyecta contenido en el hero tras un fetch → CLS**
- Evidencia: `app/home-islands.tsx:145-159` — el badge aparece post-fetch de `/api/public-stats` dentro de la columna izquierda del hero (`app/page.tsx:151`), empujando hacia abajo lo que sigue.
- Riesgo: layout shift visible en la zona más vista de la landing (cuenta para CLS si ocurre <500 ms tras load… y suele ocurrir).
- Fix propuesto: reservar la altura del badge con un contenedor `min-h` fijo, o renderizarlo con datos del servidor (la home ya es ISR con `revalidate = 300`).
- Esfuerzo: **S**

**M2 — La sección FAQ de la home aparece entera tras un fetch cliente**
- Evidencia: `app/home-islands.tsx:164-183` — `HomeFaq` devuelve `null` hasta que `/api/faqs` responde (fetch `no-store`), y entonces inserta toda la sección.
- Riesgo: shift de layout bajo el fold y contenido SEO (FAQ) invisible para el HTML inicial.
- Fix propuesto: pasar las FAQs como props desde el server component (la home ya hace 5 fetches de servidor en `app/page.tsx:70-76`; añadir el sexto) y dejar el estado abierto/cerrado como única lógica cliente.
- Esfuerzo: **S**

**M3 — Resumen del pedido: líneas que aparecen/desaparecen según respuestas async**
- Evidencia: `app/order/useCheckout.ts:326-363` (quote debounced 200 ms) y `:367-387` (estimado de envío 300 ms); las filas del resumen (`app/order/page.tsx:313-477`) crecen cuando llegan las respuestas.
- Riesgo: micro-shifts en el sidebar/carrito mientras el usuario decide — molesto más que penalizante (el resumen suele estar fuera del viewport inicial).
- Fix propuesto: mantener la última cifra en pantalla ya se hace (bien); reservar una fila fija «Envío: calculando…» en vez de insertar la línea al llegar.
- Esfuerzo: **S**

### 🟡 Severidad BAJA

**B1 — Script de Ahrefs como `<script async>` crudo en `<head>`**
- Evidencia: `app/layout.tsx:142-148`.
- Riesgo: compite por red en el arranque; `next/script` con `strategy="lazyOnload"` lo sacaría del camino crítico. GA ya usa `afterInteractive` (`app/layout.tsx:130-140`) ✅.
- Fix propuesto: migrar a `<Script strategy="lazyOnload">`.
- Esfuerzo: **S**

**B2 — Doble fetch de `/api/landing-config` en la landing**
- Evidencia: `app/home-islands.tsx:36-40` (revalidación `no-store` de siteImages) y `components/PageFooter.tsx:132-139` (footer) piden el mismo endpoint en cada carga.
- Riesgo: red y main-thread extra en móvil sin cambio visual en el 99% de las cargas (el primer paint ya viene del servidor).
- Fix propuesto: un solo fetch compartido (contexto o `ttlMs` > 0 en `cachedFetchJSON`).
- Esfuerzo: **S**

**B3 — Fuentes: bien resuelto, con margen menor**
- Evidencia: `app/layout.tsx:10-22` — Montserrat y Caveat vía `next/font` con `display: "swap"` (sin `<link>` bloqueante, sin FOIT). ✅
- Riesgo residual: 5 pesos entre las 2 familias; Caveat es puramente decorativa.
- Fix propuesto: nada urgente; si se buscan puntos extra, reducir pesos de Caveat a 1.
- Esfuerzo: **S**

---

## Checklist del prompt

| Punto | Estado | Evidencia |
|---|---|---|
| Correr Lighthouse (móvil/desktop) sobre landing, /order, /styles/[slug], /products | ❌ FALLA (bloqueado por red del sandbox; PSI 429). Pendiente correr manualmente | Nota metodológica |
| Identificar elemento LCP y si tiene priority/preload | ⚠️ PARCIAL — landing: retratos hero `<img>` con `fetchPriority="high"` pero sin next/image ni preload (`app/home-islands.tsx:62,75`); `/styles/[slug]`: `<Image priority>` ✅ (`app/styles/[slug]/page.tsx:189-195`); `/order`: LCP es texto client-rendered (A2) | A1, A2 |
| Fuentes FOUT/CLS (Montserrat next/font vs link bloqueante) | ✅ CUMPLE — `next/font` + swap (`app/layout.tsx:10-22`) | B3 |
| Layout shifts en grilla de estilos y resumen de pedido | ⚠️ PARCIAL — grilla home con `aspect-[4/3]` ✅ (`app/page.tsx:240-247`); badge semanal y FAQ shiftean (M1, M2); resumen con micro-shifts (M3) | M1–M3 |
| Datos reales de campo (CrUX / Vercel Analytics) | ❌ FALLA — no hay RUM en el repo; CrUX no consultable desde el sandbox | A3 |

## Tabla resumen

| ID | Hallazgo | Severidad | Esfuerzo | Estado |
|---|---|---|---|---|
| A1 | Hero LCP con `<img>` crudo del original de Supabase | Alta | S | Pendiente |
| A2 | /order 100% cliente: LCP/INP en riesgo en el checkout | Alta | M | Pendiente |
| A3 | Sin telemetría de campo (RUM/CrUX) | Alta | S | Pendiente |
| M1 | CLS del WeeklyOrdersBadge en el hero | Media | S | Pendiente |
| M2 | FAQ de la home aparece tras fetch cliente | Media | S | Pendiente |
| M3 | Micro-shifts en el resumen del pedido | Media | S | Pendiente |
| B1 | Ahrefs como `<script async>` crudo | Baja | S | Pendiente |
| B2 | Doble fetch de /api/landing-config | Baja | S | Pendiente |
| B3 | Fuentes OK; posible poda de pesos | Baja | S | Pendiente |
| — | Correr PSI/Lighthouse manual y anotar LCP/CLS/INP/TBT | Alta | S | Pendiente |
