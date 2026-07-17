# REPORTE — Experiencia móvil

**Fecha:** 2026-07-16 · **Auditor:** Claude Code (solo diagnóstico, análisis de
código; sin dispositivos físicos ni acceso a producción desde el sandbox — los
puntos que exigen un teléfono real quedan marcados como "verificar en device").

---

## Hallazgos

### 🟠 Severidad MEDIA (no hay críticos; la base móvil es sólida)

**M1 — Inputs a `text-sm` (14px) provocan zoom automático al enfocar en iOS Safari**
- Evidencia: los `<input>` del wizard usan `text-sm` (0.875rem = 14px): código de descuento `app/order/page.tsx:88`, y los campos de contacto (nombre / email / WhatsApp / dirección) `app/order/page.tsx:156,273,285,299`.
- Riesgo: iOS Safari hace zoom-in automático sobre cualquier input con `font-size < 16px` al recibir foco; el usuario móvil (la mayoría del tráfico) ve la página saltar y descuadrarse justo al escribir sus datos de pago — fricción directa en el paso más sensible.
- Fix propuesto: subir los inputs a `text-base` (16px) en móvil (o `text-[16px]`), manteniendo el tamaño visual con el resto de estilos. Regla general: ningún `<input>`/`<textarea>`/`<select>` por debajo de 16px.
- Esfuerzo: **S**

### 🟡 Severidad BAJA

**B1 — Targets táctiles en el límite de 44px en botones secundarios**
- Evidencia: los botones principales usan `py-3`/`py-3.5` (≈ 44px con el texto) y están bien, pero los botones-enlace pequeños tipo "cambiar/quitar" usan `text-xs` sin altura mínima (`app/order/page.tsx:76` y similares).
- Riesgo: en pantallas pequeñas un target < 44×44px es difícil de acertar; aumenta el mistap en acciones como quitar un producto o editar un paso.
- Fix propuesto: `min-h-[44px]` (y padding horizontal suficiente) en todo control táctil, incluidos los enlaces de acción pequeños.
- Esfuerzo: **S**

**B2 — El flujo de PayPal en móvil depende de que el popup no sea bloqueado**
- Evidencia: se usa `@paypal/react-paypal-js` con `createOrder`/`onApprove` (`app/order/page.tsx:896-909`); el SDK abre el flujo in-context y vuelve a la SPA por `onApprove`, así que **el estado del wizard se conserva** (no es un redirect que recargue) ✅. El riesgo residual es el popup bloqueado por el navegador o la app enviada a segundo plano a mitad del pago.
- Riesgo: si el usuario cierra el popup o el navegador lo bloquea, `onApprove` no dispara y no hay feedback claro de "reintenta".
- Fix propuesto: verificar en device iOS Safari / Android Chrome que, si el popup se cierra sin aprobar, la UI muestra un estado de "pago no completado, reintenta" y que `capturePayPalOrder` es idempotente ante doble captura. (verificar en device)
- Esfuerzo: **S**

### ✅ Lo que ya está bien (mantener)

- **Viewport correcto y accesible:** `app/layout.tsx:24-30` — `width=device-width`, `initialScale:1`, `viewportFit:"cover"` (usa el área del notch) y **NO** fija `maximumScale`/`userScalable:false`, así que el pinch-zoom sigue disponible (accesibilidad) ✅.
- **Compresión de fotos robusta (el bug de "worker colgado" está atendido):** `app/order/useCheckout.ts:485-486` importa `browser-image-compression` con `withTimeout(..., 8000)` y comprime con `useWebWorker:true`, `maxSizeMB:1.5`, `maxWidthOrHeight:2200`; las subidas usan `AbortController` (`:502,586,652`) y hay timeouts en todo el flujo (`:80,476`) para que **siempre** termine con éxito o error visible ✅.
- **Barra de acción fija con safe-area:** el CTA móvil fijo respeta el notch inferior con `pb-[max(0.75rem,env(safe-area-inset-bottom))]` (`app/order/page.tsx:969`) ✅.
- **Resumen de pedido sin tapar contenido:** en desktop es sidebar `sticky top-24` (`:320,1013`); en móvil se abre como modal a pantalla completa (`fixed inset-0`, `:1026`) en vez de encimarse — no oculta los campos ✅.
- **Inputs de foto desde cámara/galería:** el `<input type="file">` acepta imágenes y la compresión corre en cliente antes de subir, con límites (8 fotos, 10 MB c/u, 40 MB total) alineados con `app/api/order/upload/route.ts:21-23` ✅.

---

## Checklist del prompt

| Punto | Estado | Evidencia |
|---|---|---|
| Flujo completo de compra en teléfono real (iOS/Android) | ⚠️ VERIFICAR EN DEVICE — el código es correcto, pero exige prueba física | B2 |
| Popup de PayPal: abre, vuelve, no pierde estado | ✅ CUMPLE en arquitectura (SPA + onApprove); verificar popup bloqueado | `app/order/page.tsx:896-909` / B2 |
| Subir fotos cámara/galería: compresión + timeouts | ✅ CUMPLE — worker con timeout 8s + AbortController | `useCheckout.ts:485-486,502` |
| Targets táctiles ≥ 44px | ⚠️ PARCIAL — principales OK, secundarios al límite | B1 |
| Inputs sin zoom en iOS (font-size ≥ 16px) | ❌ FALLA — inputs a 14px | M1 (`page.tsx:88,156,273,285,299`) |
| Resumen sticky no tapa contenido en pantallas pequeñas | ✅ CUMPLE — modal a pantalla completa en móvil | `page.tsx:1026` |

## Tabla-resumen (para marcar al arreglar)

| ID | Severidad | Hallazgo | Esfuerzo | Estado |
|---|---|---|---|---|
| M1 | 🟠 Media | Inputs a 14px → zoom iOS al enfocar | S | Pendiente |
| B1 | 🟡 Baja | Targets táctiles secundarios < 44px | S | Pendiente |
| B2 | 🟡 Baja | Popup PayPal: feedback si se bloquea/cierra | S | Pendiente |
</content>
</invoke>
