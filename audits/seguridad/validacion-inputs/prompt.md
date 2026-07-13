# Auditoría · Validación de inputs y subida de archivos

**Sección:** Seguridad · **Prioridad:** P0 · Crítico (hazlo esta semana)

Copia TODO lo que está debajo de la línea y pégalo en Claude Code, parado en la raíz del repo:

---

Haz una auditoría de **validación de inputs y subida de archivos** en este repo (negasva.shop: e-commerce
Next.js App Router + Supabase + pagos con PayPal y Mercado Pago + Printful para
productos físicos, desplegado en Vercel).

Por qué importa en este proyecto: El checkout recibe fotos de clientes, textos libres (specialRequests) y parámetros de precio. Un archivo malicioso o un input sin sanitizar puede convertirse en XSS almacenado, path traversal o abuso de almacenamiento.

Zonas clave donde empezar (no te limites a ellas — explora lo relacionado):
- app/api/order/upload/route.ts
- lib/validation/order.ts
- app/api/checkout/route.ts
- emails/order-confirmation.html
- panel admin donde se muestran los datos del pedido

Revisa específicamente cada uno de estos puntos y márcalos como ✅ CUMPLE /
⚠️ PARCIAL / ❌ FALLA con evidencia (archivo:línea):
- Que la subida valide tipo real del archivo (magic bytes, no solo extensión/mime del cliente), tamaño máximo y cantidad máxima.
- Que los nombres de archivo se regeneren en el servidor (nunca usar el nombre original en el path de storage).
- Que specialRequests y demás textos libres tengan longitud máxima y se escapen al mostrarse en el panel admin y en emails (XSS almacenado).
- Que todos los campos del checkout se validen con un esquema (zod o similar) en el servidor: tipos, rangos (peopleCount 1–N), enums (bodyType, background).
- Que los ids/slug recibidos (style, background, rateId de envío) se validen contra el catálogo real, no se confíe en el cliente.

ENTREGABLES (no apliques fixes de código en esta pasada — solo audita y documenta):

1. `audits/seguridad/validacion-inputs/REPORTE.md` — hallazgos ordenados por severidad
   (crítico / alto / medio / bajo). Cada hallazgo con: evidencia (archivo:línea),
   explicación del riesgo en una frase, fix propuesto concreto, y esfuerzo estimado
   (S/M/L). Incluye al final una tabla-resumen con columna "Estado" para ir marcando.

2. `audits/seguridad/validacion-inputs/BUENAS_PRACTICAS.md` — reglas accionables y
   permanentes de validación de inputs y subida de archivos para ESTE proyecto, escritas en imperativo
   (ej. "Nunca X", "Siempre Y al tocar Z"), derivadas tanto de lo que ya se hace
   bien como de los fallos encontrados. Este archivo es la referencia que cualquier
   sesión futura de Claude Code debe seguir al tocar código de esta área.

3. Agrega (si no existe) una línea en `CLAUDE.md` bajo una sección
   "## Buenas prácticas por área" que diga: antes de tocar código relacionado con
   seguridad, leer `audits/seguridad/validacion-inputs/BUENAS_PRACTICAS.md`.

4. Commit de los .md siguiendo el flujo de git definido en CLAUDE.md (commit, push,
   PR con auto-merge), sin tocar código de la app en esta tanda.

Si durante la auditoría encuentras algo CRÍTICO explotable ahora mismo (fuga de
datos, bypass de pago), márcalo al inicio del reporte con 🚨 y dímelo de inmediato
en tu respuesta, no lo dejes enterrado en el archivo.
