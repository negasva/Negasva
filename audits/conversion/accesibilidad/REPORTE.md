# REPORTE — Accesibilidad (a11y)

**Fecha:** 2026-07-17 · **Auditor:** Claude Code (solo diagnóstico, análisis de
código y cálculo de contraste; no se corrió axe/Lighthouse en el sandbox —
marcado como "verificar en navegador" donde aplica).

> ⚠️ **El color de marca falla contraste en todos lados.** El rosa `#FC90B6`
> sobre blanco (y el texto blanco sobre ese rosa en los botones) ronda **1.9:1**,
> muy por debajo del mínimo AA de 4.5:1. Es el hallazgo dominante y afecta CTAs
> de venta. No arreglo nada aquí; lo documento.

---

## Hallazgos

### 🔴 Severidad ALTA

**A1 — Texto blanco sobre botón rosa `#FC90B6`: contraste ~1.9:1 (falla AA) en los CTAs de compra**
- Evidencia: el botón primario del wizard usa `bg-primary ... text-white` (`app/order/page.tsx:992`), igual que la barra de pasos y multiples chips (`app/order/page.tsx:539,570,707,795`). `primary = #FC90B6` (`tailwind.config.ts:12`). Blanco sobre `#FC90B6` ≈ 1.9:1; AA pide ≥4.5:1 (o ≥3:1 para texto grande).
- Riesgo: el texto de los botones de pago es difícil de leer para baja visión y bajo sol en móvil — justo donde se decide la venta.
- Fix propuesto: oscurecer el rosa de acción para texto blanco (usar algo tipo `#C2185B`/`primary-dark` real que dé ≥4.5:1), o poner texto oscuro sobre el rosa claro. Definir un token "primary-accessible" solo para superficies con texto.
- Esfuerzo: **M**

**A2 — `text-primary` (rosa) sobre blanco en 162 usos: contraste ~1.9:1 (falla AA)**
- Evidencia: `text-primary` aparece 162 veces (precios, enlaces, énfasis) sobre fondos claros, p. ej. `app/admin/(protected)/orders/page.tsx:310`, breadcrumbs `app/blog/[slug]/page.tsx:91-93`. Mismo cálculo que A1.
- Riesgo: precios y enlaces clave ilegibles para parte del público; también penaliza percepción de calidad y SEO/legal.
- Fix propuesto: reservar el rosa claro para elementos NO textuales (iconos decorativos, bordes, fondos) y usar un tono accesible para texto. Auditar cada uso de `text-primary` sobre fondo claro.
- Esfuerzo: **L**

### 🟠 Severidad MEDIA

**M1 — Foco no visible: `outline-none` en 39 sitios, `focus-visible` solo en 2**
- Evidencia: `outline-none` se usa 39 veces en `app`/`components`; `focus-visible` solo 2. Muchos controles quitan el contorno del foco sin reemplazarlo.
- Riesgo: navegar el wizard solo con teclado es casi imposible sin un anillo de foco visible — barrera dura para usuarios de teclado/lector.
- Fix propuesto: sustituir cada `outline-none` por un estilo `focus-visible:ring-2 focus-visible:ring-primary-dark` (o equivalente con contraste ≥3:1) en botones, inputs y enlaces.
- Esfuerzo: **M**

**M2 — Inputs de texto sin `<label>` asociado (solo placeholder)**
- Evidencia: nombre, email y teléfono usan solo `placeholder` sin `<label htmlFor>` ni `aria-label` (`app/order/page.tsx:267-295`); `htmlFor` no aparece en el archivo (0 ocurrencias). El código de descuento igual (`app/order/page.tsx:83-86`).
- Riesgo: el placeholder desaparece al escribir y los lectores de pantalla no anuncian el campo → errores y abandono; falla WCAG 1.3.1/4.1.2.
- Fix propuesto: añadir `<label>` visible asociado por `id`/`htmlFor` (o `aria-label` como mínimo) a cada input; no depender del placeholder como etiqueta.
- Esfuerzo: **M**

**M3 — Errores de validación no anunciados a lectores de pantalla (`aria-live`)**
- Evidencia: los mensajes de campos faltantes se muestran visualmente (`translations.ts:185,501` "Completa los datos resaltados…") pero no hay región `aria-live` que los anuncie; búsqueda de `aria-live` en el wizard: sin resultados relevantes.
- Riesgo: un usuario de lector de pantalla no sabe por qué no avanza el checkout.
- Fix propuesto: envolver el resumen de errores en un contenedor `role="alert"`/`aria-live="assertive"` y mover el foco al primer campo inválido.
- Esfuerzo: **M**

### ✅ Lo que ya está bien (mantener)

- **Alt text significativo** en imágenes de catálogo: `alt={s.name}` / `alt={bg.name}` (`app/order/StepStyle.tsx:37`, `StepBackground.tsx:87`) ✅.
- **`aria-label` en botones de icono** (añadir/quitar producto, cerrar, ver carrito) (`app/order/page.tsx:540,701,711,1043,1125`) ✅.
- **Estados de paso con más señal que solo color** (anillo `ring-4` en el paso activo, no solo tono) (`app/order/page.tsx:571`) ✅.

## Checklist del prompt

| Punto | Estado | Evidencia |
|---|---|---|
| Contraste WCAG AA del rosa `#FC90B6` sobre blanco | ❌ FALLA — ~1.9:1 | A1, A2 |
| Navegar todo el wizard con teclado (foco visible, sin trampas) | ❌ FALLA — foco no visible | M1 |
| Labels reales en todos los inputs | ❌ FALLA — solo placeholder | M2 |
| Errores anunciados con `aria-live` | ❌ FALLA — sin región live | M3 |
| Alt text significativo en catálogo | ✅ CUMPLE | StepStyle/StepBackground |
| Correr axe-core/Lighthouse a11y | ⚠️ VERIFICAR — pendiente en navegador | — |

## Tabla-resumen (para marcar al arreglar)

| ID | Severidad | Hallazgo | Esfuerzo | Estado |
|---|---|---|---|---|
| A1 | 🔴 Alta | Botón rosa + texto blanco: contraste ~1.9:1 | M | Pendiente |
| A2 | 🔴 Alta | `text-primary` sobre blanco (162 usos) falla AA | L | Pendiente |
| M1 | 🟠 Media | Foco no visible (`outline-none` sin reemplazo) | M | Pendiente |
| M2 | 🟠 Media | Inputs sin label (solo placeholder) | M | Pendiente |
| M3 | 🟠 Media | Errores sin `aria-live` | M | Pendiente |
