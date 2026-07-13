# Auditoría · Manejo de errores y estados de fallo

**Sección:** Confiabilidad y operación · **Prioridad:** P0 · Crítico (hazlo esta semana)

Copia TODO lo que está debajo de la línea y pégalo en Claude Code, parado en la raíz del repo:

---

Haz una auditoría de **manejo de errores y estados de fallo** en este repo (negasva.shop: e-commerce
Next.js App Router + Supabase + pagos con PayPal y Mercado Pago + Printful para
productos físicos, desplegado en Vercel).

Por qué importa en este proyecto: Ya viste el patrón peligroso en vivo: la ventana de PayPal en blanco sin ningún mensaje. Cada error silencioso es un cliente que se va (o peor: que pagó y no sabe si funcionó).

Zonas clave donde empezar (no te limites a ellas — explora lo relacionado):
- app/order/useCheckout.ts
- app/api/**/route.ts (errorResponse)
- app/checkout/success/page.tsx
- componentes del wizard

Revisa específicamente cada uno de estos puntos y márcalos como ✅ CUMPLE /
⚠️ PARCIAL / ❌ FALLA con evidencia (archivo:línea):
- Inventariar cada promesa/fetch del flujo de compra y verificar que TODOS los catch muestren algo al usuario (nada de catch vacío o solo console.error).
- Timeouts en toda operación de red del checkout (ya existen en uploadPhotos — replicar el patrón en createPayPalOrder, capture, quote).
- Que /checkout/success valide la referencia contra la BD y muestre estado real (no asuma éxito por llegar ahí).
- Errores de API consistentes: código, mensaje seguro (sin filtrar stack traces) y correlación con logs.
- Qué ve el usuario si Supabase/Printful/reCAPTCHA están caídos: ¿degradación elegante o pantalla rota?

ENTREGABLES (no apliques fixes de código en esta pasada — solo audita y documenta):

1. `audits/confiabilidad/manejo-errores/REPORTE.md` — hallazgos ordenados por severidad
   (crítico / alto / medio / bajo). Cada hallazgo con: evidencia (archivo:línea),
   explicación del riesgo en una frase, fix propuesto concreto, y esfuerzo estimado
   (S/M/L). Incluye al final una tabla-resumen con columna "Estado" para ir marcando.

2. `audits/confiabilidad/manejo-errores/BUENAS_PRACTICAS.md` — reglas accionables y
   permanentes de manejo de errores y estados de fallo para ESTE proyecto, escritas en imperativo
   (ej. "Nunca X", "Siempre Y al tocar Z"), derivadas tanto de lo que ya se hace
   bien como de los fallos encontrados. Este archivo es la referencia que cualquier
   sesión futura de Claude Code debe seguir al tocar código de esta área.

3. Agrega (si no existe) una línea en `CLAUDE.md` bajo una sección
   "## Buenas prácticas por área" que diga: antes de tocar código relacionado con
   confiabilidad y operación, leer `audits/confiabilidad/manejo-errores/BUENAS_PRACTICAS.md`.

4. Commit de los .md siguiendo el flujo de git definido en CLAUDE.md (commit, push,
   PR con auto-merge), sin tocar código de la app en esta tanda.

Si durante la auditoría encuentras algo CRÍTICO explotable ahora mismo (fuga de
datos, bypass de pago), márcalo al inicio del reporte con 🚨 y dímelo de inmediato
en tu respuesta, no lo dejes enterrado en el archivo.
