# REPORTE — Cumplimiento legal (GDPR / Habeas Data / cookies)

**Fecha:** 2026-07-16 · **Auditor:** Claude Code (solo diagnóstico, análisis de
código y contenido; no es asesoría legal — es una revisión técnica de qué exige la
ley y qué hace hoy el código).

> 🚨 **ADVERTENCIA:** Google Analytics y Ahrefs se cargan **sin banner de
> consentimiento** para visitantes de la UE (ver A1), y la política de privacidad
> promete un borrado de fotos a 30 días que no se ejecuta (ver A2). Ambos son
> incumplimientos activos para un negocio que vende a la UE. No los arreglo aquí;
> los documento.

---

## Hallazgos

### 🔴 Severidad ALTA

**A1 — Analytics (GA + Ahrefs) se cargan antes de cualquier consentimiento; no hay banner de cookies**
- Evidencia: `app/layout.tsx:128-141` inyecta `gtag.js` con `strategy="afterInteractive"` en cuanto existe `NEXT_PUBLIC_GA_ID`, y `:142-148` carga `analytics.ahrefs.com` si existe `NEXT_PUBLIC_AHREFS_KEY`. No hay ningún componente de consentimiento (búsqueda de `consent/CookieBanner` solo aparece en `app/terms`). Existe `/cookies` como página informativa, pero **sin mecanismo de control**.
- Riesgo: cargar cookies/tracking no esenciales antes del opt-in del visitante UE viola GDPR + ePrivacy (y contradice la propia página `/cookies`, que dice "cómo puedes controlarlas"); expone a sanción y a reclamaciones.
- Fix propuesto: banner de consentimiento con Google Consent Mode v2 (default `denied` para analytics/ads); cargar `gtag.js` y Ahrefs **solo** tras opt-in; recordar la elección. Gate por región si se quiere evitar el banner fuera de la UE.
- Esfuerzo: **M**

**A2 — La política de privacidad promete borrado de fotos a 30 días que no ocurre**
- Evidencia: `app/privacy/page.tsx:65` — "automatically deleted 30 days after delivery"; no existe cron/código que borre `order-photos` (ver REPORTE del item 17, A1/A2).
- Riesgo: declaración legal falsa ante el cliente y ante PayPal/MP si piden la política en una disputa; incumplimiento de retención GDPR.
- Fix propuesto: implementar el cron de borrado (item 17 A1) o, provisionalmente, corregir el texto para reflejar la práctica real.
- Esfuerzo: **S** (texto) / **M** (implementación)

### 🟠 Severidad MEDIA

**M1 — El newsletter no tiene baja funcional (unsubscribe)**
- Evidencia: `app/api/newsletter/route.ts:53-55` hace `upsert` en `newsletter_subscribers` y emite un cupón; no existe endpoint ni link de baja (búsqueda de `unsubscribe/opt-out` no encuentra flujo). Los emails de recuperación de carrito (`lib/notify/cartRecovery.ts`) tampoco muestran unsubscribe en el inventario revisado.
- Riesgo: GDPR y CAN-SPAM exigen un mecanismo de baja simple y funcional en cada email de marketing; sin él hay riesgo legal y de reputación (marcado como spam).
- Fix propuesto: link de baja con token por suscriptor + endpoint que lo marque de baja; incluirlo en el pie de todo email de marketing. (El opt-in en sí es válido: requiere que el usuario envíe el formulario, con reCAPTCHA y sin casilla premarcada.)
- Esfuerzo: **M**

**M2 — La política no menciona a los menores pese a que las fotos pueden incluir niños**
- Evidencia: `app/privacy/page.tsx` no contiene ninguna cláusula sobre menores/niños (búsqueda de `minor/child` sin resultados).
- Riesgo: se procesan imágenes de menores sin declarar la base (consentimiento del adulto comprador), laguna sensible en GDPR y Habeas Data.
- Fix propuesto: cláusula que declare que las fotos pueden incluir menores, que el consentimiento lo da el adulto que compra, y que no se dirige el servicio a menores.
- Esfuerzo: **S**

### 🟡 Severidad BAJA

**B1 — `/cookies` describe el control de cookies pero no hay dónde ejercerlo**
- Evidencia: `app/cookies/page.tsx` explica cookies "essential, analytics and functional" y "how you can control them", pero sin banner ni panel de preferencias el único control es el del navegador.
- Riesgo: expectativa incumplida; refuerza A1.
- Fix propuesto: una vez exista el banner (A1), enlazar desde `/cookies` a "Gestionar preferencias".
- Esfuerzo: **S**

### ✅ Lo que ya está bien (mantener)

- **Páginas legales existen y están enlazadas:** `/privacy`, `/terms`, `/cookies` (y `/contact`, `/faq`), presentes en el footer editable ✅.
- **Opt-in de newsletter real:** requiere envío explícito del formulario + reCAPTCHA (`app/api/newsletter/route.ts:21-23`), sin casillas premarcadas ✅.
- **Derechos ARCO/GDPR anunciados:** `/privacy:72` indica cómo pedir acceso/corrección/borrado por email ✅ (falta el proceso atómico — item 17 M1).
- **Datos en servidores cifrados (Supabase/PostgreSQL)** declarado en `/privacy:65` ✅.

## Checklist del prompt

| Punto | Estado | Evidencia |
|---|---|---|
| Privacidad, términos y reembolsos/envíos existen y enlazados | ✅ CUMPLE (reembolsos dentro de `/terms`) | footer + `/privacy` `/terms` `/cookies` |
| Cookies/tracking cargan tras consentimiento para UE | ❌ FALLA — GA/Ahrefs sin gate | A1 (`layout.tsx:128-148`) |
| Base legal del newsletter (opt-in real) + baja funcional | ⚠️ PARCIAL — opt-in sí, unsubscribe no | M1 |
| Derechos ARCO/GDPR: cómo pide acceso/borrado el cliente | ⚠️ PARCIAL — por email, sin proceso atómico | `/privacy:72` / item 17 M1 |
| Menores: la política los menciona | ❌ FALLA — no se mencionan | M2 |

## Tabla-resumen (para marcar al arreglar)

| ID | Severidad | Hallazgo | Esfuerzo | Estado |
|---|---|---|---|---|
| A1 | 🔴 Alta | GA/Ahrefs sin banner de consentimiento (UE) | M | Pendiente |
| A2 | 🔴 Alta | Privacidad promete borrado 30d no implementado | S/M | Pendiente |
| M1 | 🟠 Media | Newsletter sin baja funcional | M | Pendiente |
| M2 | 🟠 Media | Sin cláusula de menores | S | Pendiente |
| B1 | 🟡 Baja | `/cookies` sin control real de cookies | S | Pendiente |
</content>
