# Auditoría · Monitoreo, logging y alertas

**Sección:** Confiabilidad y operación · **Prioridad:** P1 · Importante (hazlo este mes)

Copia TODO lo que está debajo de la línea y pégalo en Claude Code, parado en la raíz del repo:

---

Haz una auditoría de **monitoreo, logging y alertas** en este repo (negasva.shop: e-commerce
Next.js App Router + Supabase + pagos con PayPal y Mercado Pago + Printful para
productos físicos, desplegado en Vercel).

Por qué importa en este proyecto: Hoy los errores viven en console.error de funciones serverless: nadie los lee. Sin alertas, un webhook roto puede pasar días perdiendo pedidos sin que lo notes.

Zonas clave donde empezar (no te limites a ellas — explora lo relacionado):
- console.error en app/api/**
- lib/notify/newOrder.ts (Resend ya integrado)
- vercel.json (cron)

Revisa específicamente cada uno de estos puntos y márcalos como ✅ CUMPLE /
⚠️ PARCIAL / ❌ FALLA con evidencia (archivo:línea):
- ¿Existe tracking de errores (Sentry o similar) en server y cliente? Si no, los errores de producción son invisibles.
- Alertas activas para los eventos que cuestan dinero: webhook fallando, captura fallando, pedidos pending viejos, quote caído.
- Logs con contexto (referencia del pedido) para poder investigar un caso puntual.
- Uptime monitoring del sitio y del endpoint de checkout (UptimeRobot o similar).
- Revisar qué loguean hoy los console.error: ¿se filtran datos personales a los logs?

ENTREGABLES (no apliques fixes de código en esta pasada — solo audita y documenta):

1. `audits/confiabilidad/monitoreo-alertas/REPORTE.md` — hallazgos ordenados por severidad
   (crítico / alto / medio / bajo). Cada hallazgo con: evidencia (archivo:línea),
   explicación del riesgo en una frase, fix propuesto concreto, y esfuerzo estimado
   (S/M/L). Incluye al final una tabla-resumen con columna "Estado" para ir marcando.

2. `audits/confiabilidad/monitoreo-alertas/BUENAS_PRACTICAS.md` — reglas accionables y
   permanentes de monitoreo, logging y alertas para ESTE proyecto, escritas en imperativo
   (ej. "Nunca X", "Siempre Y al tocar Z"), derivadas tanto de lo que ya se hace
   bien como de los fallos encontrados. Este archivo es la referencia que cualquier
   sesión futura de Claude Code debe seguir al tocar código de esta área.

3. Agrega (si no existe) una línea en `CLAUDE.md` bajo una sección
   "## Buenas prácticas por área" que diga: antes de tocar código relacionado con
   confiabilidad y operación, leer `audits/confiabilidad/monitoreo-alertas/BUENAS_PRACTICAS.md`.

4. Commit de los .md siguiendo el flujo de git definido en CLAUDE.md (commit, push,
   PR con auto-merge), sin tocar código de la app en esta tanda.

Si durante la auditoría encuentras algo CRÍTICO explotable ahora mismo (fuga de
datos, bypass de pago), márcalo al inicio del reporte con 🚨 y dímelo de inmediato
en tu respuesta, no lo dejes enterrado en el archivo.
