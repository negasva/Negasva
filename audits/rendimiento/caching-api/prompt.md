# Auditoría · Caching de API y datos

**Sección:** Rendimiento · **Prioridad:** P2 · Mejora (cuando lo anterior esté hecho)

Copia TODO lo que está debajo de la línea y pégalo en Claude Code, parado en la raíz del repo:

---

Haz una auditoría de **caching de api y datos** en este repo (negasva.shop: e-commerce
Next.js App Router + Supabase + pagos con PayPal y Mercado Pago + Printful para
productos físicos, desplegado en Vercel).

Por qué importa en este proyecto: El catálogo (estilos, precios, fondos) casi no cambia pero se consulta en cada visita. Buen caching reduce latencia y carga sobre Supabase (y ya existe cachedFetchJSON en el cliente — falta la capa del servidor).

Zonas clave donde empezar (no te limites a ellas — explora lo relacionado):
- app/api/styles
- app/api/prices
- app/api/backgrounds
- app/api/body-types
- lib/cache/clientCache.ts

Revisa específicamente cada uno de estos puntos y márcalos como ✅ CUMPLE /
⚠️ PARCIAL / ❌ FALLA con evidencia (archivo:línea):
- Que los endpoints de catálogo tengan Cache-Control con s-maxage + stale-while-revalidate (CDN de Vercel).
- Que el quote y checkout NUNCA se cacheen (no-store).
- Revisar si las páginas de estilos pueden ser estáticas/ISR en vez de dinámicas.
- TTLs del clientCache coherentes con la frecuencia real de cambios de precios.
- Que /api/keepalive no esté cacheado (perdería su función).

ENTREGABLES (no apliques fixes de código en esta pasada — solo audita y documenta):

1. `audits/rendimiento/caching-api/REPORTE.md` — hallazgos ordenados por severidad
   (crítico / alto / medio / bajo). Cada hallazgo con: evidencia (archivo:línea),
   explicación del riesgo en una frase, fix propuesto concreto, y esfuerzo estimado
   (S/M/L). Incluye al final una tabla-resumen con columna "Estado" para ir marcando.

2. `audits/rendimiento/caching-api/BUENAS_PRACTICAS.md` — reglas accionables y
   permanentes de caching de api y datos para ESTE proyecto, escritas en imperativo
   (ej. "Nunca X", "Siempre Y al tocar Z"), derivadas tanto de lo que ya se hace
   bien como de los fallos encontrados. Este archivo es la referencia que cualquier
   sesión futura de Claude Code debe seguir al tocar código de esta área.

3. Agrega (si no existe) una línea en `CLAUDE.md` bajo una sección
   "## Buenas prácticas por área" que diga: antes de tocar código relacionado con
   rendimiento, leer `audits/rendimiento/caching-api/BUENAS_PRACTICAS.md`.

4. Commit de los .md siguiendo el flujo de git definido en CLAUDE.md (commit, push,
   PR con auto-merge), sin tocar código de la app en esta tanda.

Si durante la auditoría encuentras algo CRÍTICO explotable ahora mismo (fuga de
datos, bypass de pago), márcalo al inicio del reporte con 🚨 y dímelo de inmediato
en tu respuesta, no lo dejes enterrado en el archivo.
