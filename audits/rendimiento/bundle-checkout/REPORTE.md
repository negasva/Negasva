# REPORTE — Bundle JS y peso del checkout

**Fecha:** 2026-07-13 · **Auditor:** Claude Code (solo diagnóstico)
**Método:** `next build` real del repo (Next 14.2.x) + inspección de chunks generados
(`.next/static/chunks`). `@next/bundle-analyzer` no está en las dependencias; las
cifras salen del build oficial y de medir los chunks con gzip, que es equivalente
para este nivel de detalle.

## Números medidos (gzip, build de producción)

| Ruta | JS propio | First Load JS total |
|---|---|---|
| `/order` | **29.7 kB** | **147 kB** ← la más pesada del sitio |
| `/` (landing) | ~9 kB | ~123 kB |
| `/styles/[slug]` | 242 B | 118 kB |
| `/products` | 1.18 kB | 113 kB |
| Shared por todas | — | 87.4 kB (framework 53.6 + app 31.7) |

Chunks del route `/order`: página 23 kB gz (85 kB raw) + 4 chunks propios (12+9+6+3 kB gz).
`browser-image-compression` = chunk async separado `4937.*.js` (52 kB raw) que NO
entra en el first load ✅.

---

## Hallazgos

### 🟠 Severidad MEDIA (no hay críticos ni altos: el estado general es bueno)

**M1 — reCAPTCHA se descarga desde el paso 1 para todos los visitantes de `/order`**
- Evidencia: `app/order/page.tsx:522` — `<RecaptchaScript />` en el layout del wizard; el script externo de Google (`components/RecaptchaScript.tsx:17-20`, `afterInteractive`) carga aunque el usuario solo mire estilos y se vaya. El token solo se usa al crear el pago (`app/order/useCheckout.ts:579,640`).
- Riesgo: ~150-200 kB de JS de terceros + main-thread en el primer paso del funnel, donde más sensible es el INP.
- Fix propuesto: montar `RecaptchaScript` recién en el paso 4 (o al entrar al 5); grecaptcha necesita ~1 s para estar listo, que el paso de subida de fotos cubre de sobra.
- Esfuerzo: **S**

**M2 — El wrapper de PayPal se importa estático y entra al bundle inicial de `/order` para todos (incluido COP)**
- Evidencia: `app/order/page.tsx:12` — `import { PayPalProvider, … } from '@paypal/react-paypal-js/sdk-v6'` en el módulo raíz. El wrapper pesa ~6 kB gz (chunks `a6fbb9d6` + `7607`); el SDK externo de PayPal sí se difiere hasta que `PayPalProvider` se monta en el paso 5 ✅ (`app/order/page.tsx:916-921`).
- Riesgo: moderado (6 kB gz), pero es código muerto para usuarios COP (que pagan con Mercado Pago) y para los pasos 1-4.
- Fix propuesto: `next/dynamic` para el bloque de pago PayPal (se monta solo en paso 5 con `currency !== 'COP'`).
- Esfuerzo: **S**

**M3 — `/order` monolítico: 1080 líneas + los 3 Step* en un solo chunk de página**
- Evidencia: `app/order/page.tsx` (1080 líneas) importa estáticamente `StepStyle`, `StepBody`, `StepBackground`, `ShippingCalculator`, `MercadoPagoBrick` (`:13-20`); todo cae en el chunk de página (23 kB gz propio, first load 147 kB).
- Riesgo: el paso 1 (elegir estilo) paga el JS de los 5 pasos, el drawer, el brick y el calculador de envío.
- Fix propuesto: `next/dynamic` para pasos ≥2, `ShippingCalculator` y `MercadoPagoBrick`. Objetivo razonable: first load de `/order` ≤ 120 kB gz.
- Esfuerzo: **M**

### 🟡 Severidad BAJA

**B1 — `browser-image-compression` en `devDependencies` siendo dependencia de runtime**
- Evidencia: `package.json:38` — se importa dinámicamente en `app/order/useCheckout.ts:485`. Funciona porque el bundler la incluye igualmente, pero un `npm install --omit=dev` local rompe el build.
- Fix propuesto: moverla a `dependencies`.
- Esfuerzo: **S**

**B2 — Sin `@next/bundle-analyzer` ni presupuesto de tamaño en CI**
- Evidencia: `package.json` no lo incluye; no hay script `analyze`.
- Riesgo: las regresiones de bundle solo se notan si alguien mira el output del build.
- Fix propuesto: añadir `@next/bundle-analyzer` como devDependency con script `ANALYZE=true next build`, y anotar el first load actual de `/order` como línea base.
- Esfuerzo: **S**

### ✅ Lo que ya está bien (mantener)

- **Mercado Pago:** el SDK externo se inyecta SOLO cuando el Brick se monta (paso 5 con COP) — `components/MercadoPagoBrick.tsx:20-43` con promesa compartida ✅.
- **`browser-image-compression`:** import dinámico con timeout → chunk async separado, no entra al first load — `app/order/useCheckout.ts:485` ✅.
- **lucide-react:** imports nombrados, tree-shaking efectivo (el chunk compartido con iconos pesa 6 kB gz, no la librería entera) ✅. No hay librerías duplicadas ni pesadas injustificadas en el árbol del checkout (sin framer-motion, sin lodash, sin moment).
- **GA `afterInteractive`** (`app/layout.tsx:130-140`) ✅; Ahrefs es `<script async>` crudo — ver item 11 (B1) para migrarlo a `lazyOnload`.

---

## Checklist del prompt

| Punto | Estado | Evidencia |
|---|---|---|
| Correr bundle analyzer y mapear el chunk de /order | ⚠️ PARCIAL — sin @next/bundle-analyzer en deps; se midió con `next build` + gzip de chunks (tabla arriba) | Números medidos |
| MP solo con COP; PayPal solo en paso 5 | ⚠️ PARCIAL — SDKs externos ✅ diferidos; wrapper PayPal estático en el bundle inicial | M2, ✅ |
| browser-image-compression como import dinámico | ✅ CUMPLE — chunk async separado | ✅ |
| Librerías duplicadas/pesadas; tree-shaking de lucide | ✅ CUMPLE — lucide tree-shaken (6 kB gz), sin libs pesadas | ✅ |
| GA/Ahrefs afterInteractive/lazyOnload | ⚠️ PARCIAL — GA ✅; Ahrefs script crudo (item 11 B1) | ✅/B1 item 11 |

## Tabla resumen

| ID | Hallazgo | Severidad | Esfuerzo | Estado |
|---|---|---|---|---|
| M1 | reCAPTCHA carga desde el paso 1 | Media | S | Pendiente |
| M2 | Wrapper PayPal estático en bundle inicial (también para COP) | Media | S | Pendiente |
| M3 | /order monolítico: 147 kB first load, un chunk para 5 pasos | Media | M | Pendiente |
| B1 | browser-image-compression en devDependencies | Baja | S | Pendiente |
| B2 | Sin bundle-analyzer ni presupuesto en CI | Baja | S | Pendiente |
