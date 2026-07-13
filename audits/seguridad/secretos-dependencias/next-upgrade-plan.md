# Plan de upgrade Next 14 → 15/16 (no ejecutar todavía)

## Advisories high actuales (`npm audit --audit-level=high`, next@14.2.35)

```
glob  10.2.0 - 10.4.5
Severity: high
glob CLI: Command injection via -c/--cmd executes matches with shell:true - https://github.com/advisories/GHSA-5j98-mcp5-4vw2
(vía eslint-config-next → @next/eslint-plugin-next → glob; solo devDependency, no corre en producción)

next  9.3.4-canary.0 - 16.3.0-canary.5
Severity: high
- Next.js self-hosted apps vulnerable to DoS via Image Optimizer remotePatterns config - GHSA-9g9p-9gw9-jx7f
- Next.js HTTP request deserialization DoS con RSC inseguro - GHSA-h25m-26qc-wcjf
- Next.js: HTTP request smuggling in rewrites - GHSA-ggv3-7p47-pfv8
- Next.js: Unbounded next/image disk cache growth puede agotar disco - GHSA-3x4c-7xq6-9pq8
- Next.js DoS with Server Components - GHSA-q4gf-8mx6-v5v3 / GHSA-8h8q-6873-q5fj
- Next.js Middleware/Proxy redirects cache-poisoning - GHSA-3g8h-86w9-wvmq
- Next.js XSS en App Router con CSP nonces - GHSA-ffhc-5mcf-pf4q
- Next.js cache poisoning vía colisiones en RSC cache-busting - GHSA-vfv6-92ff-j949
- Next.js XSS en beforeInteractive scripts con input no confiable - GHSA-gx5p-jg67-6x7h
- Next.js DoS en Image Optimization API - GHSA-h64f-5h5j-jqjh
- Next.js SSRF vía WebSocket upgrades - GHSA-c4j6-fc7j-m34r
- Next.js cache poisoning en respuestas RSC - GHSA-wfc6-r584-vfw7
- Next.js Middleware/Proxy bypass en Pages Router con i18n - GHSA-36qx-fr4f-26g5

postcss  <8.5.10
Severity: moderate (arrastrado por next → glob/postcss transitivo)
PostCSS XSS vía </style> sin escapar en su output - GHSA-qx2v-qp2m-jg93
```

## Cuáles aplican a este deploy (Vercel)

- **DoS Image Optimizer / cache sin límite**: mitigado. Vercel gestiona el Image Optimizer y el disco de forma administrada (no self-hosted), y `next.config.js` ya restringe `images.remotePatterns` a `**.supabase.co`.
- **HTTP request smuggling en rewrites / cache poisoning / Middleware bypass i18n**: **revisar**. Usamos `redirects()` en `next.config.js` pero no `middleware.ts` con rewrites de i18n ni proxy propio — riesgo bajo, pero pendiente de confirmar tras leer el changelog exacto de cada CVE al migrar.
- **XSS en App Router con CSP nonces**: no aplica hoy (no usamos nonces en CSP, ver `audits/seguridad/csp-headers/`), pero bloquea adoptar nonces hasta migrar.
- **SSRF vía WebSocket upgrades**: no usamos WebSockets en la app — no aplica.
- **glob command injection (devDependency)**: no corre en producción (solo `eslint-config-next` en dev/CI).

## Pasos para migrar a Next 15 (cuando se decida)

1. Leer `node_modules/next/dist/docs/` y `AGENTS.md` — esta base ya advierte que la versión de Next instalada tiene breaking changes propios respecto al Next "de siempre"; los mismos docs cubren el path de upgrade.
2. Ejecutar el codemod oficial: `npx @next/codemod@latest upgrade latest` (o el script equivalente que indiquen los docs locales) en una rama aparte.
3. Repasar cada advisory de la lista de arriba contra el changelog de la versión objetivo — confirmar cuáles quedan resueltos.
4. Revalidar manualmente: checkout completo (PayPal popup + Mercado Pago Brick COP), CSP (sin `Refused to load` en consola), `next/image` con Supabase Storage, y cualquier uso de Server Actions/RSC.
5. Solo tras CI verde + validación manual, mergear a `main`.

**No se migra en este PR** — este documento es solo el plan.
