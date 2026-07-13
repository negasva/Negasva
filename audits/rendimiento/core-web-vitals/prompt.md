# Auditoría · Core Web Vitals (Lighthouse)

**Sección:** Rendimiento · **Prioridad:** P1 · Importante (hazlo este mes)

Copia TODO lo que está debajo de la línea y pégalo en Claude Code, parado en la raíz del repo:

---

Haz una auditoría de **core web vitals (lighthouse)** en este repo (negasva.shop: e-commerce
Next.js App Router + Supabase + pagos con PayPal y Mercado Pago + Printful para
productos físicos, desplegado en Vercel).

Por qué importa en este proyecto: LCP, CLS e INP afectan tanto la conversión como el ranking en Google. Un e-commerce visual como NEGASVA (imágenes grandes de estilos) es especialmente propenso a LCP alto en móvil.

Zonas clave donde empezar (no te limites a ellas — explora lo relacionado):
- app/page.tsx (landing)
- app/order/page.tsx
- app/styles/**
- next.config.js (images)

Revisa específicamente cada uno de estos puntos y márcalos como ✅ CUMPLE /
⚠️ PARCIAL / ❌ FALLA con evidencia (archivo:línea):
- Correr Lighthouse (móvil y desktop) sobre: landing, /order, /styles/[slug], /products y anotar LCP/CLS/INP/TBT.
- Identificar el elemento LCP de cada página y si su imagen tiene priority/preload.
- Buscar fuentes que causen FOUT/CLS (Montserrat: ¿next/font o <link> bloqueante?).
- Detectar layout shifts en la grilla de estilos y el resumen del pedido.
- Revisar datos reales de campo (CrUX / Vercel Analytics) además del lab.

ENTREGABLES (no apliques fixes de código en esta pasada — solo audita y documenta):

1. `audits/rendimiento/core-web-vitals/REPORTE.md` — hallazgos ordenados por severidad
   (crítico / alto / medio / bajo). Cada hallazgo con: evidencia (archivo:línea),
   explicación del riesgo en una frase, fix propuesto concreto, y esfuerzo estimado
   (S/M/L). Incluye al final una tabla-resumen con columna "Estado" para ir marcando.

2. `audits/rendimiento/core-web-vitals/BUENAS_PRACTICAS.md` — reglas accionables y
   permanentes de core web vitals (lighthouse) para ESTE proyecto, escritas en imperativo
   (ej. "Nunca X", "Siempre Y al tocar Z"), derivadas tanto de lo que ya se hace
   bien como de los fallos encontrados. Este archivo es la referencia que cualquier
   sesión futura de Claude Code debe seguir al tocar código de esta área.

3. Agrega (si no existe) una línea en `CLAUDE.md` bajo una sección
   "## Buenas prácticas por área" que diga: antes de tocar código relacionado con
   rendimiento, leer `audits/rendimiento/core-web-vitals/BUENAS_PRACTICAS.md`.

4. Commit de los .md siguiendo el flujo de git definido en CLAUDE.md (commit, push,
   PR con auto-merge), sin tocar código de la app en esta tanda.

Si durante la auditoría encuentras algo CRÍTICO explotable ahora mismo (fuga de
datos, bypass de pago), márcalo al inicio del reporte con 🚨 y dímelo de inmediato
en tu respuesta, no lo dejes enterrado en el archivo.
