# REPORTE · Secretos y dependencias vulnerables

**Item 9/25 · P1 · Importante** · Auditoría solo-diagnóstico (sin cambios de código).
Fecha: 2026-07-13 · Alcance: historial completo de git (81 commits), `.gitignore`, `.env.example`, `package.json`/`package-lock.json`, `npm audit`, inventario `NEXT_PUBLIC_*`.

> Método: sin gitleaks/trufflehog disponibles en este entorno; se escaneó TODO el
> historial (`git grep` sobre `git rev-list --all`) con patrones de claves reales
> (sk_live/sk_test, AKIA…, JWTs `eyJ…`, APP_USR-, re_…, PRIVATE KEY, asignaciones
> `SECRET/TOKEN/API_KEY/PASSWORD=<valor largo>`). Recomendado repetir con gitleaks
> en CI como control permanente.

**Resultado clave: NO se encontró ninguna clave real filtrada en el historial.** Todas las coincidencias son nombres de variables, placeholders (`sk_test_...`, `mozscape-xxx`) o políticas SQL con la palabra `service_role`.

---

## Checklist del prompt

| Punto | Estado | Evidencia |
|---|---|---|
| Escanear TODO el historial buscando claves | ✅ CUMPLE | Escaneo sobre los 81 commits; solo placeholders (`GETTING_STARTED.md`: `sk_test_...`; `.env.example` con valores vacíos). Sin JWTs ni tokens reales |
| `.env.local` y variantes en `.gitignore`, nunca commiteadas | ✅ CUMPLE | `.gitignore:12-16` cubre `.env`, `.env.local`, `.env.*.local`; en el historial solo existe `.env.example` (git log --all) |
| Ninguna variable sensible con prefijo `NEXT_PUBLIC_` | ✅ CUMPLE | Inventario: GA_ID, AHREFS_KEY, MP_PUBLIC_KEY, PAYPAL_CLIENT_ID/ENV, RECAPTCHA_SITE_KEY, SITE_URL, STRIPE_PUBLISHABLE_KEY, SUPABASE_URL/ANON_KEY, WHATSAPP_NUMBER — todas son públicas por diseño. Secretos (SERVICE_ROLE, PAYPAL_SECRET, MP_ACCESS_TOKEN, PRINTFUL, RESEND, ADMIN_*) sin prefijo ✅ |
| npm audit: high/critical y plan | ❌ FALLA | 5 vulnerabilidades (4 high, 1 moderate) — ver H-01, H-03 |
| Dependencias de pago vigentes | ⚠️ PARCIAL | `@paypal/react-paypal-js` 10.1.2 (SDK v6, actual) ✅; MP se carga por CDN (sin paquete npm, siempre vigente) ✅; `stripe` 17.7.0 presente solo para el webhook legacy (H-04) |

---

## Hallazgos

### 🟠 ALTO

#### H-01 · Next.js 14.2.35 acumula un paquete largo de advisories high sin fix en la rama 14.x
- **Evidencia:** `npm audit` marca `next` (instalado 14.2.35, `package-lock.json`) con ~14 advisories, entre ellos cache poisoning de RSC (GHSA-wfc6-r584-vfw7), HTTP request smuggling en rewrites (GHSA-ggv3-7p47-pfv8), XSS con nonces CSP (GHSA-ffhc-5mcf-pf4q), DoS del Image Optimizer (GHSA-h64f-5h5j-jqjh); el fix propuesto por npm es `next@16` (breaking).
- **Riesgo:** vulnerabilidades conocidas y públicas en el framework que sirve todo el sitio, incluidas rutas de pago.
- **Matiz:** varios advisories aplican principalmente a self-hosted; en Vercel el Image Optimizer/CDN gestionado mitiga parte (DoS de imagen, caché). El riesgo residual (smuggling/cache-poisoning/XSS) no desaparece.
- **Fix propuesto:** plan de actualización mayor a Next 15/16 (OJO: `AGENTS.md` indica que esta versión de Next tiene breaking changes propios — leer `node_modules/next/dist/docs/` antes); mientras tanto, fijar la última 14.2.x disponible y revisar advisory por advisory cuáles aplican en Vercel.
- **Esfuerzo:** L (migración) / S (triage documentado)

### 🟡 MEDIO

#### H-02 · Sin escaneo automático de secretos ni de dependencias en CI
- **Evidencia:** no existe workflow de CI con gitleaks/`npm audit`/Dependabot en el repo (`.github/` sin workflows de seguridad).
- **Riesgo:** la próxima clave pegada por error en un commit pasaría inadvertida; este escaneo manual caduca mañana.
- **Fix propuesto:** activar GitHub secret scanning + push protection en el repo, Dependabot (npm) y un job de gitleaks en CI.
- **Esfuerzo:** S

#### H-03 · `eslint-config-next`/glob con advisory high (solo tooling de dev)
- **Evidencia:** `npm audit`: `glob` 10.2.0-10.4.5 (command injection vía CLI `-c/--cmd`, GHSA-5j98-mcp5-4vw2) vía `@next/eslint-plugin-next` ← `eslint-config-next` (devDependency); `postcss <8.5.10` (moderate) anidado bajo `next`.
- **Riesgo:** bajo en la práctica (no corre en producción ni con input externo), pero mantiene el audit en rojo y tapa alertas nuevas.
- **Fix propuesto:** subir `eslint-config-next` junto con la migración de Next (H-01); mientras, documentar la excepción.
- **Esfuerzo:** S

#### H-04 · Dependencias muertas instaladas (superficie de supply-chain gratis)
- **Evidencia:** sin ningún import en `app/lib/components/providers/scripts`: `axios` (^1.7.9), `react-hook-form`, `@hookform/resolvers`, `dotenv`. `stripe` (17.7.0) solo lo usa el webhook legacy `app/api/webhooks/stripe/route.ts:2`. `zustand` y `@supabase/auth-helpers-*` con 1 uso cada una (verificar si real).
- **Riesgo:** cada paquete instalado es un vector de supply-chain y ruido de audit aunque no se importe (scripts postinstall, typosquatting de transitivas).
- **Fix propuesto:** desinstalar `axios`, `react-hook-form`, `@hookform/resolvers`, `dotenv`; decidir el retiro del webhook Stripe legacy para quitar `stripe` y `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (coordinar con item 7 H-03).
- **Esfuerzo:** S

### 🟢 BAJO

#### H-05 · `GETTING_STARTED.md` enseña claves con nombres de env de Stripe ya obsoletos
- **Evidencia:** `GETTING_STARTED.md` documenta `STRIPE_SECRET_KEY=sk_test_...` como setup vigente.
- **Riesgo:** documentación que invita a configurar secretos que ya no se usan; confusión operativa.
- **Fix propuesto:** actualizar la doc al stack real (PayPal/MP/Printful/Resend/Upstash).
- **Esfuerzo:** S

#### H-06 · Lo que ya está bien (preservar)
- `.gitignore` correcto para todas las variantes de `.env` ✅ y nunca se commiteó un `.env` real ✅.
- `.env.example` completo, con placeholders vacíos y comentarios de operación ✅.
- Separación limpia cliente/servidor: ningún secreto con `NEXT_PUBLIC_` ✅; `SUPABASE_SERVICE_ROLE_KEY` solo en `lib/supabase/server.ts` ✅.
- Paquetes de seguridad al día: `@supabase/supabase-js` 2.104.1, `zod` 3.25.76, `@upstash/*` recientes ✅.
- PayPal con SDK oficial v6 vigente (`@paypal/react-paypal-js` 10.x) y MP por CDN oficial ✅.

---

## Tabla resumen

| ID | Severidad | Hallazgo | Esfuerzo | Estado |
|---|---|---|---|---|
| H-01 | Alto | Next 14.2.35 con advisories high (fix = major) | L/S | Pendiente |
| H-02 | Medio | Sin gitleaks/Dependabot/secret-scanning en CI | S | Pendiente |
| H-03 | Medio | glob/eslint-config-next high (solo dev tooling) | S | Pendiente |
| H-04 | Medio | Dependencias muertas: axios, RHF, dotenv, stripe legacy | S | Pendiente |
| H-05 | Bajo | Docs de setup con Stripe obsoleto | S | Pendiente |
| H-06 | — | Higiene de secretos correcta (preservar) | — | N/A |
