# Auditoría · Experiencia móvil

**Sección:** Conversión y UX de venta · **Prioridad:** P1 · Importante (hazlo este mes)

Copia TODO lo que está debajo de la línea y pégalo en Claude Code, parado en la raíz del repo:

---

Haz una auditoría de **experiencia móvil** en este repo (negasva.shop: e-commerce
Next.js App Router + Supabase + pagos con PayPal y Mercado Pago + Printful para
productos físicos, desplegado en Vercel).

Por qué importa en este proyecto: La mayoría del tráfico de e-commerce B2C es móvil, y el flujo NEGASVA (subir fotos, wizard de 5 pasos, popup de PayPal) es especialmente sensible a pantallas pequeñas y conexiones lentas.

Zonas clave donde empezar (no te limites a ellas — explora lo relacionado):
- app/order/page.tsx
- todos los componentes del wizard
- popup/redirect de PayPal en móvil

Revisa específicamente cada uno de estos puntos y márcalos como ✅ CUMPLE /
⚠️ PARCIAL / ❌ FALLA con evidencia (archivo:línea):
- Probar el flujo completo de compra en un teléfono real (iOS Safari y Android Chrome), no solo el emulador.
- El popup de PayPal en móvil: ¿abre bien, vuelve bien a la app, no se pierde el estado?
- Subir fotos desde la cámara/galería del teléfono: ¿funciona la compresión, hay timeouts adecuados? (ya hubo bugs de worker colgado — verificar los timeouts).
- Targets táctiles ≥ 44px, inputs que no provocan zoom en iOS (font-size ≥ 16px).
- El resumen de pedido sticky: ¿tapa contenido en pantallas pequeñas?

ENTREGABLES (no apliques fixes de código en esta pasada — solo audita y documenta):

1. `audits/conversion/mobile-responsive/REPORTE.md` — hallazgos ordenados por severidad
   (crítico / alto / medio / bajo). Cada hallazgo con: evidencia (archivo:línea),
   explicación del riesgo en una frase, fix propuesto concreto, y esfuerzo estimado
   (S/M/L). Incluye al final una tabla-resumen con columna "Estado" para ir marcando.

2. `audits/conversion/mobile-responsive/BUENAS_PRACTICAS.md` — reglas accionables y
   permanentes de experiencia móvil para ESTE proyecto, escritas en imperativo
   (ej. "Nunca X", "Siempre Y al tocar Z"), derivadas tanto de lo que ya se hace
   bien como de los fallos encontrados. Este archivo es la referencia que cualquier
   sesión futura de Claude Code debe seguir al tocar código de esta área.

3. Agrega (si no existe) una línea en `CLAUDE.md` bajo una sección
   "## Buenas prácticas por área" que diga: antes de tocar código relacionado con
   conversión y ux de venta, leer `audits/conversion/mobile-responsive/BUENAS_PRACTICAS.md`.

4. Commit de los .md siguiendo el flujo de git definido en CLAUDE.md (commit, push,
   PR con auto-merge), sin tocar código de la app en esta tanda.

Si durante la auditoría encuentras algo CRÍTICO explotable ahora mismo (fuga de
datos, bypass de pago), márcalo al inicio del reporte con 🚨 y dímelo de inmediato
en tu respuesta, no lo dejes enterrado en el archivo.
