# Auditoría · Cumplimiento legal (GDPR / Habeas Data / cookies)

**Sección:** Datos y privacidad · **Prioridad:** P1 · Importante (hazlo este mes)

Copia TODO lo que está debajo de la línea y pégalo en Claude Code, parado en la raíz del repo:

---

Haz una auditoría de **cumplimiento legal (gdpr / habeas data / cookies)** en este repo (negasva.shop: e-commerce
Next.js App Router + Supabase + pagos con PayPal y Mercado Pago + Printful para
productos físicos, desplegado en Vercel).

Por qué importa en este proyecto: Vendes a EU (EUR/GBP), Norteamérica y Colombia: aplican GDPR, leyes de Habeas Data colombiana y reglas de cookies. Además PayPal/MP pueden pedir políticas publicadas para resolver disputas a tu favor.

Zonas clave donde empezar (no te limites a ellas — explora lo relacionado):
- páginas legales del sitio
- banner de cookies (¿existe?)
- GA/Ahrefs analytics
- formulario newsletter

Revisa específicamente cada uno de estos puntos y márcalos como ✅ CUMPLE /
⚠️ PARCIAL / ❌ FALLA con evidencia (archivo:línea):
- Que existan y estén enlazadas: política de privacidad, términos de servicio, política de reembolsos/envíos.
- Cookies/tracking (GA, Ahrefs): ¿se cargan antes del consentimiento para visitantes EU? ¿Hace falta banner de consentimiento?
- Base legal del newsletter (opt-in real, no casillas premarcadas) y baja funcional (unsubscribe).
- Derechos ARCO/GDPR: cómo un cliente solicita acceso o borrado de sus datos.
- Menores: las fotos pueden incluir niños — la política debe mencionarlo y el consentimiento es del adulto que compra.

ENTREGABLES (no apliques fixes de código en esta pasada — solo audita y documenta):

1. `audits/datos-y-privacidad/cumplimiento-legal/REPORTE.md` — hallazgos ordenados por severidad
   (crítico / alto / medio / bajo). Cada hallazgo con: evidencia (archivo:línea),
   explicación del riesgo en una frase, fix propuesto concreto, y esfuerzo estimado
   (S/M/L). Incluye al final una tabla-resumen con columna "Estado" para ir marcando.

2. `audits/datos-y-privacidad/cumplimiento-legal/BUENAS_PRACTICAS.md` — reglas accionables y
   permanentes de cumplimiento legal (gdpr / habeas data / cookies) para ESTE proyecto, escritas en imperativo
   (ej. "Nunca X", "Siempre Y al tocar Z"), derivadas tanto de lo que ya se hace
   bien como de los fallos encontrados. Este archivo es la referencia que cualquier
   sesión futura de Claude Code debe seguir al tocar código de esta área.

3. Agrega (si no existe) una línea en `CLAUDE.md` bajo una sección
   "## Buenas prácticas por área" que diga: antes de tocar código relacionado con
   datos y privacidad, leer `audits/datos-y-privacidad/cumplimiento-legal/BUENAS_PRACTICAS.md`.

4. Commit de los .md siguiendo el flujo de git definido en CLAUDE.md (commit, push,
   PR con auto-merge), sin tocar código de la app en esta tanda.

Si durante la auditoría encuentras algo CRÍTICO explotable ahora mismo (fuga de
datos, bypass de pago), márcalo al inicio del reporte con 🚨 y dímelo de inmediato
en tu respuesta, no lo dejes enterrado en el archivo.
