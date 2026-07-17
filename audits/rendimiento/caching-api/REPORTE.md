# REPORTE — Caching de API y datos

**Fecha:** 2026-07-17 · **Auditor:** Claude Code (solo diagnóstico, análisis de código).

> ✅ **Nada crítico.** La capa de CDN (Cache-Control) y la de cliente ya están
> bien puestas: los endpoints de catálogo cachean con `s-maxage` + SWR, el
> keepalive es `force-dynamic` y las páginas de estilos son ISR. Lo que falta es
> la capa de servidor (memorizar lecturas de catálogo entre requests). No arreglo
> nada aquí; lo documento.

---

## Hallazgos

### 🟠 Severidad MEDIA

**M1 — Las lecturas de catálogo en el servidor no están cacheadas: cada quote/checkout pega a Supabase**
- Evidencia: `loadPricingConfig()` y las lecturas de `prices`/`body_types` se ejecutan en cada POST de quote y checkout sin memorización (`app/api/pricing/quote/route.ts:34`, `app/api/checkout/route.ts`); no se usa `unstable_cache`, `React.cache` ni `revalidateTag` en el lado servidor. La nota del propio prompt lo anticipa: "ya existe `cachedFetchJSON` en el cliente — falta la capa del servidor".
- Riesgo: carga innecesaria sobre Supabase (plan free) y latencia añadida en el paso más sensible (cotizar/pagar) para datos que casi no cambian.
- Fix propuesto: envolver `loadPricingConfig` y lecturas de catálogo en `unstable_cache` con `revalidate` corto (60–120 s) y `tags`, invalidando con `revalidateTag` desde el admin al editar precios/estilos.
- Esfuerzo: **M**

### 🟡 Severidad BAJA

**B1 — TTL del cliente (5 min) más largo que el `s-maxage` de precios (120 s)**
- Evidencia: `clientCache` usa `DEFAULT_TTL = 5 min` (`lib/cache/clientCache.ts:28`) y `/api/prices` declara `s-maxage=120` (`app/api/prices/route.ts:18`); el fetch de precios del wizard no pasa `ttlMs` (`app/order/useCheckout.ts:292`), así que hereda 5 min.
- Riesgo: bajo — un cambio de precio desde el admin puede tardar hasta 5 min en verse dentro de una sesión ya abierta, más que la ventana de CDN.
- Fix propuesto: pasar `ttlMs` explícito a las lecturas de precios acorde al `s-maxage` (p. ej. 120 s), o invalidar `clientCache` al detectar cambios.
- Esfuerzo: **S**

**B2 — Endpoints dinámicos GET sin `no-store` explícito (dependen del default)**
- Evidencia: rutas por-usuario/estado (p. ej. carrito, order) no declaran `Cache-Control: no-store`; funcionan porque Next no cachea rutas dinámicas por defecto, pero es implícito.
- Riesgo: bajo — un refactor futuro (volver una ruta estática, o un proxy intermedio) podría cachear datos por-usuario sin querer.
- Fix propuesto: `Cache-Control: no-store` explícito en cualquier endpoint con datos por-usuario o de estado de pago; el quote/checkout son POST (no cacheables) y el keepalive ya es `force-dynamic`.
- Esfuerzo: **S**

### ✅ Lo que ya está bien (mantener)

- **Catálogo con CDN cache + SWR**: styles (`s-maxage=60, swr=300`), backgrounds (60/300), prices (120/600), body-types (120/600), rates (3600/600) — todos con `Cache-Control` público (`app/api/styles/route.ts:22`, `backgrounds:38`, `prices:17`, `body-types:19`, `rates:16`) ✅.
- **Keepalive nunca cacheado**: `export const dynamic = 'force-dynamic'` con comentario explicando por qué (`app/api/keepalive/route.ts:8`) ✅.
- **Páginas de estilos y pricing como ISR** (`revalidate = 300`) en vez de dinámicas (`app/styles/page.tsx:14`, `app/styles/[slug]/page.tsx:14`, `app/pricing/page.tsx:9`) ✅.
- **Cache de cliente en 3 capas** (memoria → sessionStorage → dedupe in-flight) con TTL e invalidación (`lib/cache/clientCache.ts`) ✅.
- **Shipping de Printful cacheado en servidor** 6 h (`lib/printful.ts:160,180`) ✅.

## Checklist del prompt

| Punto | Estado | Evidencia |
|---|---|---|
| Catálogo con `s-maxage` + `stale-while-revalidate` (CDN) | ✅ CUMPLE | styles/bg/prices/body-types/rates |
| Quote y checkout NUNCA cacheados | ✅ CUMPLE — son POST, no cacheables | quote/checkout |
| Páginas de estilos estáticas/ISR | ✅ CUMPLE | `styles/page.tsx:14` |
| TTLs del clientCache coherentes con cambios de precio | ⚠️ PARCIAL — 5 min > s-maxage 120 s | B1 |
| `/api/keepalive` no cacheado | ✅ CUMPLE | `keepalive/route.ts:8` |
| Capa de caché en el servidor para catálogo | ❌ FALLA — no existe | M1 |

## Tabla-resumen (para marcar al arreglar)

| ID | Severidad | Hallazgo | Esfuerzo | Estado |
|---|---|---|---|---|
| M1 | 🟠 Media | Lecturas de catálogo en servidor sin cache | M | Pendiente |
| B1 | 🟡 Baja | TTL cliente (5 min) > s-maxage precios (120 s) | S | Pendiente |
| B2 | 🟡 Baja | GET dinámicos sin `no-store` explícito | S | Pendiente |
