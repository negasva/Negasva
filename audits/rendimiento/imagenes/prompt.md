# Auditoría · Optimización de imágenes

**Sección:** Rendimiento · **Prioridad:** P1 · Importante (hazlo este mes)

Copia TODO lo que está debajo de la línea y pégalo en Claude Code, parado en la raíz del repo:

---

Haz una auditoría de **optimización de imágenes** en este repo (negasva.shop: e-commerce
Next.js App Router + Supabase + pagos con PayPal y Mercado Pago + Printful para
productos físicos, desplegado en Vercel).

Por qué importa en este proyecto: Los retratos y fondos son el corazón visual del sitio y su mayor peso. Ya hay avif/webp y remotePatterns de Supabase configurados — falta verificar que TODAS las imágenes pasen por ahí. Además hubo errores 400 en _next/image en la consola: hay algo roto hoy.

Zonas clave donde empezar (no te limites a ellas — explora lo relacionado):
- next.config.js (images)
- componentes con <img> vs next/image
- app/api/backgrounds
- bucket de Supabase Storage

Revisa específicamente cada uno de estos puntos y márcalos como ✅ CUMPLE /
⚠️ PARCIAL / ❌ FALLA con evidencia (archivo:línea):
- Investigar los errores 400 de /_next/image vistos en consola (¿dominio no permitido en remotePatterns? ¿URL firmada vencida?).
- Que todas las imágenes de catálogo usen next/image con sizes correctos (no <img> crudo).
- Que las fotos subidas por clientes se compriman también en el servidor (no confiar solo en browser-image-compression, que tiene fallback al original).
- Lazy loading en imágenes bajo el fold; priority solo en el hero.
- Peso total de la landing < 1.5 MB en la primera carga móvil.

ENTREGABLES (no apliques fixes de código en esta pasada — solo audita y documenta):

1. `audits/rendimiento/imagenes/REPORTE.md` — hallazgos ordenados por severidad
   (crítico / alto / medio / bajo). Cada hallazgo con: evidencia (archivo:línea),
   explicación del riesgo en una frase, fix propuesto concreto, y esfuerzo estimado
   (S/M/L). Incluye al final una tabla-resumen con columna "Estado" para ir marcando.

2. `audits/rendimiento/imagenes/BUENAS_PRACTICAS.md` — reglas accionables y
   permanentes de optimización de imágenes para ESTE proyecto, escritas en imperativo
   (ej. "Nunca X", "Siempre Y al tocar Z"), derivadas tanto de lo que ya se hace
   bien como de los fallos encontrados. Este archivo es la referencia que cualquier
   sesión futura de Claude Code debe seguir al tocar código de esta área.

3. Agrega (si no existe) una línea en `CLAUDE.md` bajo una sección
   "## Buenas prácticas por área" que diga: antes de tocar código relacionado con
   rendimiento, leer `audits/rendimiento/imagenes/BUENAS_PRACTICAS.md`.

4. Commit de los .md siguiendo el flujo de git definido en CLAUDE.md (commit, push,
   PR con auto-merge), sin tocar código de la app en esta tanda.

Si durante la auditoría encuentras algo CRÍTICO explotable ahora mismo (fuga de
datos, bypass de pago), márcalo al inicio del reporte con 🚨 y dímelo de inmediato
en tu respuesta, no lo dejes enterrado en el archivo.
