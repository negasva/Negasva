# Auditoría · Copy, CTAs e idiomas

**Sección:** Conversión y UX de venta · **Prioridad:** P2 · Mejora (cuando lo anterior esté hecho)

Copia TODO lo que está debajo de la línea y pégalo en Claude Code, parado en la raíz del repo:

---

Haz una auditoría de **copy, ctas e idiomas** en este repo (negasva.shop: e-commerce
Next.js App Router + Supabase + pagos con PayPal y Mercado Pago + Printful para
productos físicos, desplegado en Vercel).

Por qué importa en este proyecto: El sitio vende en 3 idiomas (EN/ES/FR) y 6 monedas. Un CTA débil o una traducción a medias en el momento del pago genera desconfianza justo donde más duele.

Zonas clave donde empezar (no te limites a ellas — explora lo relacionado):
- lib/i18n/**
- textos de la landing y el wizard
- emails/order-confirmation.html

Revisa específicamente cada uno de estos puntos y márcalos como ✅ CUMPLE /
⚠️ PARCIAL / ❌ FALLA con evidencia (archivo:línea):
- Revisar que TODOS los textos del checkout existan y suenen naturales en los 3 idiomas (nada de mezclas EN/ES en la misma pantalla — la captura del paso 5 mostraba 'Secure payment' con UI en español).
- Que los CTAs digan el beneficio ('Crear mi retrato') y no genéricos ('Siguiente').
- Que precios, fechas estimadas y monedas se formateen según el locale.
- Emails de confirmación en el idioma del cliente.
- Microcopy de errores: humano y accionable, no técnico.

ENTREGABLES (no apliques fixes de código en esta pasada — solo audita y documenta):

1. `audits/conversion/copy-cta/REPORTE.md` — hallazgos ordenados por severidad
   (crítico / alto / medio / bajo). Cada hallazgo con: evidencia (archivo:línea),
   explicación del riesgo en una frase, fix propuesto concreto, y esfuerzo estimado
   (S/M/L). Incluye al final una tabla-resumen con columna "Estado" para ir marcando.

2. `audits/conversion/copy-cta/BUENAS_PRACTICAS.md` — reglas accionables y
   permanentes de copy, ctas e idiomas para ESTE proyecto, escritas en imperativo
   (ej. "Nunca X", "Siempre Y al tocar Z"), derivadas tanto de lo que ya se hace
   bien como de los fallos encontrados. Este archivo es la referencia que cualquier
   sesión futura de Claude Code debe seguir al tocar código de esta área.

3. Agrega (si no existe) una línea en `CLAUDE.md` bajo una sección
   "## Buenas prácticas por área" que diga: antes de tocar código relacionado con
   conversión y ux de venta, leer `audits/conversion/copy-cta/BUENAS_PRACTICAS.md`.

4. Commit de los .md siguiendo el flujo de git definido en CLAUDE.md (commit, push,
   PR con auto-merge), sin tocar código de la app en esta tanda.

Si durante la auditoría encuentras algo CRÍTICO explotable ahora mismo (fuga de
datos, bypass de pago), márcalo al inicio del reporte con 🚨 y dímelo de inmediato
en tu respuesta, no lo dejes enterrado en el archivo.
