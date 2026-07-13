# REPORTE — Optimización de imágenes

**Fecha:** 2026-07-13 · **Auditor:** Claude Code (solo diagnóstico)
**Nota:** no fue posible reproducir en vivo los errores 400 de `/_next/image` (la
política de red del sandbox bloquea `negasva.shop`); el diagnóstico de esa parte es
por análisis de configuración y de todas las fuentes de URLs de imagen del código.

---

## Hallazgos

### 🔴 Severidad ALTA

**A1 — Las fotos de clientes NUNCA se recomprimen en el servidor**
- Evidencia: `app/api/order/upload/route.ts:52-62` — el buffer se sube tal cual al bucket `order-photos` (límite 10 MB por archivo, `:22`). La compresión solo ocurre en el cliente con `browser-image-compression`, que tiene fallback explícito al original si falla o tarda (`app/order/useCheckout.ts:483-496`: `catch { out = file; }`).
- Riesgo: cualquier navegador donde el worker de compresión falle sube originales de hasta 10 MB × 8 fotos, inflando storage y el ancho de banda del ilustrador.
- Fix propuesto: recomprimir en el servidor con `sharp` (¡ya está en `devDependencies`, `package.json:42`, sin uso!): resize a ~2200 px máx y recompresión a JPEG/WebP q80 antes del upload a Supabase.
- Esfuerzo: **S**

**A2 — Causa probable de los 400 en `/_next/image`: URLs fuera del único remotePattern permitido**
- Evidencia: `next.config.js:11-13` solo permite `https://**.supabase.co/storage/v1/object/public/**`. Pero varios componentes pasan a `next/image` URLs que vienen de la BD/admin sin garantía de cumplir ese patrón:
  - `components/GalleryMarquee.tsx:40-47` (`image_url` de `/api/gallery`),
  - `app/order/page.tsx:678-685` (imágenes de `pod_products` de `landing_config`),
  - `app/order/StepStyle.tsx:34-42` (`/api/styles` → `example_image_url`),
  - `components/TestimonialsScroll.tsx:39-47` (`photo` editable del admin).
  Cualquier URL firmada (`/object/sign/**`, como las que genera `lib/payments/orderPhotos.ts:40`), de otro host (CDN de Printful, imgur, etc.) o `http://` produce exactamente un 400 del optimizador.
- Riesgo: imágenes rotas en catálogo/galería (conversión) y ruido de errores en consola; ya se observaron 400 en producción.
- Fix propuesto: (1) en los admins, validar al guardar que la URL matchee el patrón público de Supabase; (2) inventariar las URLs actuales en `landing_config`/`gallery`/`portrait_styles` y corregir las que no cumplan; (3) si se necesitan otros hosts, añadirlos a `remotePatterns` conscientemente.
- Esfuerzo: **M**

**A3 — Los 4 retratos de la landing (hero y "3 steps") son `<img>` crudo con el original**
- Evidencia: `app/home-islands.tsx:62,75` (hero) y `:100,110,123,133` (steps) — sin `next/image`, sin `srcset`, sin `loading="lazy"` en los de steps (están bajo el fold y se descargan eager).
- Riesgo: son las imágenes más pesadas de la página más visitada; sin variantes responsive un móvil descarga el original completo 4 veces.
- Fix propuesto: migrarlas a `next/image` (`fill` + `sizes`; `priority` solo en las 2 del hero, lazy implícito en las de steps). El slot del admin ya recomienda tamaños (`lib/siteImages.ts:20-25`) pero nada lo garantiza — la recompresión del admin ayuda también aquí.
- Esfuerzo: **S**

### 🟠 Severidad MEDIA

**M1 — Peso de la landing < 1.5 MB: no verificable y sin guardarraíl**
- Evidencia: el peso real depende de 4 imágenes subidas por el admin sin límite de tamaño en el slot (`lib/siteImages.ts`) + marquee de galería. No hay presupuesto de peso ni chequeo automático.
- Riesgo: un solo upload descuidado del admin (foto de 6 MB de cámara) rompe el objetivo sin que nadie lo note.
- Fix propuesto: recompresión server-side al subir imágenes del admin (mismo `sharp` de A1) con techo (~300 KB para slots de landing); medir el peso real con PSI cuando haya acceso.
- Esfuerzo: **M**

**M2 — El marquee de galería renderiza cada imagen dos veces y baraja en cliente**
- Evidencia: `components/GalleryMarquee.tsx:105-109` — la lista se duplica (`[...half, ...half]`) para el loop infinito y `shuffle()` corre en cliente tras un fetch `no-store` (`:100`).
- Riesgo: bajo en bytes (el navegador cachea la URL repetida) pero el fetch sin caché en cada visita y el orden aleatorio impiden aprovechar la caché del optimizador de forma estable. `loading="lazy"` + `sizes="260px"` ✅ están bien.
- Fix propuesto: servir la lista desde el server component (ISR) y barajar con seed diaria.
- Esfuerzo: **S**

### 🟡 Severidad BAJA

**B1 — Configuración base del optimizador: correcta**
- Evidencia: `next.config.js:8-17` — `formats: ['image/avif', 'image/webp']` ✅, `minimumCacheTTL` 24 h ✅, `remotePatterns` restringido a Supabase público ✅ (bien por seguridad; el problema es el contenido que no lo cumple, ver A2). `/backgrounds/*` con `Cache-Control immutable` ✅ (`next.config.js:109-115`).
- Estado: ✅ nada que arreglar aquí.

**B2 — `priority` correcto en landings de estilo; ausente en catálogos (correcto también)**
- Evidencia: `app/styles/[slug]/page.tsx:189-195` usa `priority` en el hero ✅; las grillas usan `fill` + `sizes` responsivos ✅ (`app/page.tsx:241-247`, `app/order/StepStyle.tsx:34-42`).
- Estado: ✅ patrón correcto; mantenerlo.

**B3 — `public/` liviano**
- Evidencia: 956 KB totales, ningún archivo > 300 KB (webp+jpg de fondos).
- Estado: ✅.

---

## Checklist del prompt

| Punto | Estado | Evidencia |
|---|---|---|
| Investigar los 400 de `/_next/image` | ⚠️ PARCIAL — no reproducible desde el sandbox; causa más probable: URLs de BD/admin fuera del único remotePattern (firmadas, otro host) | A2 |
| Catálogo con next/image + sizes (no `<img>` crudo) | ⚠️ PARCIAL — catálogos ✅; hero y steps de la landing ❌ `<img>` crudo | A3, B2 |
| Compresión server-side de fotos de clientes | ❌ FALLA — upload sube el buffer tal cual; sharp instalado y sin uso | A1 |
| Lazy bajo el fold; priority solo en hero | ⚠️ PARCIAL — marquee ✅ lazy; steps de landing ❌ eager `<img>`; priority ✅ en styles/[slug] | A3, M2 |
| Peso landing < 1.5 MB primera carga móvil | ❌ NO VERIFICABLE desde el sandbox; sin guardarraíl que lo garantice | M1 |

## Tabla resumen

| ID | Hallazgo | Severidad | Esfuerzo | Estado |
|---|---|---|---|---|
| A1 | Sin recompresión server-side de fotos de clientes | Alta | S | Pendiente |
| A2 | 400 de `/_next/image` por URLs fuera de remotePatterns | Alta | M | Pendiente |
| A3 | Hero + steps de landing con `<img>` crudo del original | Alta | S | Pendiente |
| M1 | Sin presupuesto/límite de peso para imágenes del admin | Media | M | Pendiente |
| M2 | Marquee: fetch no-store + shuffle cliente | Media | S | Pendiente |
| B1 | Config del optimizador correcta | — | — | ✅ OK |
| B2 | priority/sizes correctos en styles y grillas | — | — | ✅ OK |
| B3 | public/ liviano | — | — | ✅ OK |
