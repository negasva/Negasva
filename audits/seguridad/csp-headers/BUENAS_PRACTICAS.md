# BUENAS PRÁCTICAS · CSP y headers de seguridad (negasva.shop)

1. **Siempre** que añadas un script/SDK/iframe de terceros (pagos, analítica, chat), actualiza la CSP en `next.config.js` EN EL MISMO commit: `script-src`, `connect-src`, `frame-src` e `img-src` según lo que el SDK necesite. Un SDK sin CSP = feature rota en producción y silenciosa en dev.
2. **Siempre** que elimines un tercero (p. ej. Stripe), retira sus dominios de la CSP y sus `NEXT_PUBLIC_*` de `next.config.js`. Dominio permitido sin uso = superficie de XSS gratis.
3. Tras CUALQUIER cambio de CSP, prueba el flujo de pago completo (PayPal modal + tarjeta guest, y Mercado Pago Brick + PSE en COP) con la consola abierta: cero errores `Refused to load`.
4. Dominios canónicos de este proyecto: PayPal (`www.paypal.com`, `www.paypalobjects.com`, `api-m[.sandbox].paypal.com`), Mercado Pago (`sdk.mercadopago.com`, `api.mercadopago.com`, iframes `*.mercadopago.com`), reCAPTCHA (`www.recaptcha.net`, `www.google.com`, `www.gstatic.com`), GA (`www.googletagmanager.com`, `www.google-analytics.com`), Ahrefs (`analytics.ahrefs.com`), Supabase (`*.supabase.co`), divisas (`api.exchangerate-api.com`). Nada más sin justificarlo en el commit.
5. **Nunca** relajes la CSP a `*` ni añadas `'unsafe-eval'` en producción para "arreglar" un bloqueo: identifica el dominio exacto que pide la consola y permite solo ese.
6. **Nunca** quites ni debilites: `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, HSTS con preload, `X-Content-Type-Options: nosniff`, `poweredByHeader: false`.
7. Mantén `img-src` acotado a dominios conocidos; no vuelvas a `https:` genérico.
8. Si se implementan nonces (plan H-04): el nonce se genera en `middleware.ts` y TODO script inline (GA, JSON-LD) debe llevarlo; verifica que los SDKs de pago sigan cargando.
9. COOP: usa `same-origin-allow-popups` mientras existan flujos de pago con popup/redirect; nunca `same-origin` estricto sin probar PayPal.
10. Endpoints sensibles (`/api/admin|checkout|track|newsletter|webhooks`) siempre con `Cache-Control: no-store`; los públicos cacheables definen su propio header por ruta — no los pises con reglas globales.
11. `X-XSS-Protection` está obsoleto: no lo "arregles" reactivándolo; el valor correcto moderno es `0` u omitirlo.
