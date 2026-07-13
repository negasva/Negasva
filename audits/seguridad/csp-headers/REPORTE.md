# REPORTE · CSP y headers de seguridad

**Item 7/25 · P1 · Importante** · Auditoría solo-diagnóstico (sin cambios de código).
Fecha: 2026-07-13 · Alcance: `next.config.js` (headers/CSP), `middleware.ts`, inventario de dominios externos realmente usados en `app/`, `components/`, `lib/`.

> Nota de método: no fue posible probar la pantalla de pago en navegador desde este
> entorno; la verificación es estática (CSP declarada vs. dominios que el código
> carga en el navegador). Los dos hallazgos críticos son deterministas: el dominio
> no está en la lista, el navegador lo bloquea.

🚨 **CRÍTICO FUNCIONAL:** la CSP actual NO incluye `https://sdk.mercadopago.com` en
`script-src` ni `https://api.mercadopago.com` en `connect-src`. El Payment Brick de
Mercado Pago (checkout COP) carga su SDK desde ese dominio
(`components/MercadoPagoBrick.tsx:20`) → el navegador lo bloquea y el pago en COP
queda en error/carga infinita. Mismo patrón del bug ya visto con PayPal/Ahrefs.

---

## Checklist del prompt

| Punto | Estado | Evidencia |
|---|---|---|
| script/frame/connect-src incluyen exactamente los dominios usados hoy — y nada más | ❌ FALLA | Faltan Mercado Pago y Ahrefs (H-01, H-02); sobran Stripe y probablemente Google Fonts (H-03, H-08) |
| Eliminar lo que ya no se usa (js.stripe.com) | ❌ FALLA | `js.stripe.com` sigue en script-src y frame-src (`next.config.js:70,74`) sin ningún uso browser de Stripe (solo webhook server-side) |
| Evaluar `'unsafe-inline'` en script-src (nonces/hashes) | ⚠️ PARCIAL | `'unsafe-inline'` presente (`next.config.js:68-70`); sin nonces. Documentado el porqué (bootstrap Next + GA inline) pero no evaluada la migración (H-04) |
| HSTS, X-Content-Type-Options, Referrer-Policy, frame-ancestors, Permissions-Policy correctos | ✅ CUMPLE (con matices) | `next.config.js:85-93`; HSTS 1 año + includeSubDomains + preload ✅; frame-ancestors 'none' + X-Frame-Options DENY ✅; X-XSS-Protection obsoleto (H-06) |
| Pantalla de pago sin errores de CSP (PayPal y MP) | ❌ FALLA (estático) | PayPal: dominios presentes ✅; Mercado Pago: bloqueado por H-01 |

---

## Hallazgos

### 🔴 CRÍTICO

#### H-01 · CSP bloquea el SDK de Mercado Pago → checkout COP roto
- **Evidencia:** `components/MercadoPagoBrick.tsx:20` carga `https://sdk.mercadopago.com/js/v2`; `next.config.js:68-70` (script-src) no incluye `sdk.mercadopago.com`; `next.config.js:73` (connect-src) no incluye `api.mercadopago.com` (el Brick tokeniza tarjetas contra la API desde el navegador); `next.config.js:74` (frame-src) no incluye los iframes del Brick (`*.mercadopago.com` / `*.mercadolibre.com`).
- **Riesgo:** todo cliente colombiano (COP) ve "No se pudo cargar el pago" — venta perdida en el mercado local, hoy.
- **Fix propuesto:** añadir a script-src `https://sdk.mercadopago.com https://http2.mlstatic.com`; a connect-src `https://api.mercadopago.com https://api-static.mercadopago.com https://events.mercadopago.com`; a frame-src `https://*.mercadopago.com https://*.mercadolibre.com`; luego probar un pago COP real con consola abierta y recortar lo no pedido.
- **Esfuerzo:** S (config) + prueba manual

### 🟠 ALTO

#### H-02 · CSP bloquea Ahrefs Analytics (el bug reportado sigue sin arreglar)
- **Evidencia:** `app/layout.tsx:143-145` carga `https://analytics.ahrefs.com/analytics.js`; no está en script-src (`next.config.js:68-70`) ni su beacon en connect-src (`:73`).
- **Riesgo:** analítica SEO ciega (y ruido de errores CSP en consola que enmascara errores reales).
- **Fix propuesto:** añadir `https://analytics.ahrefs.com` a script-src y connect-src, o quitar el script si ya no se quiere Ahrefs.
- **Esfuerzo:** S

#### H-03 · Stripe permitido en CSP sin ningún uso en navegador
- **Evidencia:** `next.config.js:70` (script-src) y `:74` (frame-src) incluyen `https://js.stripe.com`; no existe ningún `import`/`Script` de Stripe en código cliente (solo el webhook legacy `app/api/webhooks/stripe/route.ts`, que corre en servidor y no necesita CSP). `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` sigue expuesta en `next.config.js:22` sin consumidor.
- **Riesgo:** superficie de ataque innecesaria: un XSS podría cargar scripts desde un dominio permitido que nadie vigila.
- **Fix propuesto:** eliminar `js.stripe.com` de script-src y frame-src y la env `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` del bloque `env`.
- **Esfuerzo:** S

### 🟡 MEDIO

#### H-04 · `'unsafe-inline'` en script-src sin plan de nonces
- **Evidencia:** `next.config.js:68-70`; scripts inline reales: GA (`app/layout.tsx:134-139`) y JSON-LD (`app/layout.tsx:124`, `components/BreadcrumbSchema.tsx`).
- **Riesgo:** anula gran parte de la protección anti-XSS de la CSP: cualquier inyección de `<script>` inline ejecuta.
- **Fix propuesto:** migrar a CSP con nonce generada en `middleware.ts` (patrón oficial de Next App Router: header `x-nonce` + `<Script nonce>`), manteniendo `'unsafe-inline'` solo en style-src. Requiere probar PayPal/MP/reCAPTCHA tras el cambio. Alternativa mínima: hashes para los 2 scripts inline propios.
- **Esfuerzo:** M

#### H-05 · `img-src https:` permite imágenes desde cualquier origen HTTPS
- **Evidencia:** `next.config.js:72`.
- **Riesgo:** exfiltración vía imagen (un XSS puede mandar datos en la URL de una img a cualquier dominio) y tracking-pixels arbitrarios.
- **Fix propuesto:** acotar a `'self' data: blob: https://*.supabase.co https://www.google-analytics.com https://www.paypalobjects.com` + los dominios de MP que pida el Brick.
- **Esfuerzo:** S

#### H-06 · `Cross-Origin-Opener-Policy: same-origin` con checkout en popup/modal de terceros
- **Evidencia:** `next.config.js:91`; PayPal SDK v6 con `presentationMode="modal"` (`app/order/page.tsx:905-935`) y PSE de MP redirige al banco.
- **Riesgo:** si algún flujo de PayPal/MP degrada a popup, COOP `same-origin` corta la comunicación `window.opener` y el pago no vuelve (fallo silencioso difícil de reproducir).
- **Fix propuesto:** cambiar a `same-origin-allow-popups` (mantiene la protección esencial sin romper popups de pago).
- **Esfuerzo:** S

### 🟢 BAJO

#### H-07 · `X-XSS-Protection: 1; mode=block` está obsoleto
- **Evidencia:** `next.config.js:87`.
- **Riesgo:** el auditor XSS fue retirado de los navegadores; en navegadores viejos `1; mode=block` habilitaba side-channels. Recomendación actual: `0` u omitir.
- **Fix propuesto:** cambiar a `0` o eliminar el header.
- **Esfuerzo:** S

#### H-08 · Google Fonts permitido pero las fuentes parecen locales
- **Evidencia:** `next.config.js:71-72` permite `fonts.googleapis.com`/`fonts.gstatic.com`; existe `app/fonts/` (fuentes self-hosted) y no se encontró `<link>` a Google Fonts.
- **Riesgo:** dominio permitido sin uso (mismo principio que H-03).
- **Fix propuesto:** confirmar en el HTML servido y retirar ambos dominios si no se usan.
- **Esfuerzo:** S

#### H-09 · Lo que ya está bien (preservar)
- `poweredByHeader: false` (`next.config.js:7`) ✅.
- HSTS 1 año + includeSubDomains + preload (`next.config.js:90`) ✅.
- `frame-ancestors 'none'` + `X-Frame-Options: DENY` (`:86,89`) ✅ anti-clickjacking.
- `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `upgrade-insecure-requests` (`:75-79`) ✅.
- `Referrer-Policy: strict-origin-when-cross-origin` y `Permissions-Policy` restrictiva (`:88-89`) ✅.
- `Cache-Control: no-store` en endpoints sensibles (`:104-107`) ✅.
- reCAPTCHA servido desde `www.recaptcha.net` y contemplado en script-src/frame-src ✅ (`components/RecaptchaScript.tsx:18`).
- Redirect www→apex y anti-hotlinking de `/backgrounds` en `middleware.ts` ✅.

---

## Tabla resumen

| ID | Severidad | Hallazgo | Esfuerzo | Estado |
|---|---|---|---|---|
| H-01 | Crítico | CSP bloquea SDK/API de Mercado Pago (checkout COP roto) | S | Pendiente |
| H-02 | Alto | CSP bloquea Ahrefs Analytics | S | Pendiente |
| H-03 | Alto | Stripe en CSP y env pública sin uso browser | S | Pendiente |
| H-04 | Medio | `'unsafe-inline'` en script-src sin nonces | M | Pendiente |
| H-05 | Medio | `img-src https:` demasiado amplio | S | Pendiente |
| H-06 | Medio | COOP `same-origin` puede romper popups de pago | S | Pendiente |
| H-07 | Bajo | X-XSS-Protection obsoleto | S | Pendiente |
| H-08 | Bajo | Google Fonts en CSP posiblemente sin uso | S | Pendiente |
| H-09 | — | Headers correctos ya presentes (preservar) | — | N/A |
