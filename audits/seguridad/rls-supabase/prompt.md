# Auditoría · Row Level Security (RLS) en Supabase

**Sección:** Seguridad · **Prioridad:** P0 · Crítico (hazlo esta semana)

Copia TODO lo que está debajo de la línea y pégalo en Claude Code, parado en la raíz del repo:

---

Haz una auditoría de **row level security (rls) en supabase** en este repo (negasva.shop: e-commerce
Next.js App Router + Supabase + pagos con PayPal y Mercado Pago + Printful para
productos físicos, desplegado en Vercel).

Por qué importa en este proyecto: La SUPABASE_SERVICE_ROLE_KEY se salta todas las políticas RLS. Si la anon key permite leer tablas sin políticas correctas, cualquiera con la URL pública puede descargar tu base de datos de pedidos.

Zonas clave donde empezar (no te limites a ellas — explora lo relacionado):
- supabase/migrations/*.sql
- todo uso de createClient con anon key vs service role
- app/api/**/route.ts

Revisa específicamente cada uno de estos puntos y márcalos como ✅ CUMPLE /
⚠️ PARCIAL / ❌ FALLA con evidencia (archivo:línea):
- Que RLS esté HABILITADO en todas las tablas (orders, order_photos, discount_codes, prices, styles, body_types, backgrounds, etc.).
- Que las políticas de lectura pública solo expongan catálogo (estilos, precios, fondos) y nunca pedidos ni datos de clientes.
- Que la service role key solo se use en código server-side (webhooks, admin) y jamás llegue al bundle del cliente.
- Que el bucket de fotos de clientes sea privado y las fotos solo se sirvan con URLs firmadas de corta duración.
- Que ningún endpoint público devuelva columnas sensibles (email, teléfono, dirección) por accidente.

ENTREGABLES (no apliques fixes de código en esta pasada — solo audita y documenta):

1. `audits/seguridad/rls-supabase/REPORTE.md` — hallazgos ordenados por severidad
   (crítico / alto / medio / bajo). Cada hallazgo con: evidencia (archivo:línea),
   explicación del riesgo en una frase, fix propuesto concreto, y esfuerzo estimado
   (S/M/L). Incluye al final una tabla-resumen con columna "Estado" para ir marcando.

2. `audits/seguridad/rls-supabase/BUENAS_PRACTICAS.md` — reglas accionables y
   permanentes de row level security (rls) en supabase para ESTE proyecto, escritas en imperativo
   (ej. "Nunca X", "Siempre Y al tocar Z"), derivadas tanto de lo que ya se hace
   bien como de los fallos encontrados. Este archivo es la referencia que cualquier
   sesión futura de Claude Code debe seguir al tocar código de esta área.

3. Agrega (si no existe) una línea en `CLAUDE.md` bajo una sección
   "## Buenas prácticas por área" que diga: antes de tocar código relacionado con
   seguridad, leer `audits/seguridad/rls-supabase/BUENAS_PRACTICAS.md`.

4. Commit de los .md siguiendo el flujo de git definido en CLAUDE.md (commit, push,
   PR con auto-merge), sin tocar código de la app en esta tanda.

Si durante la auditoría encuentras algo CRÍTICO explotable ahora mismo (fuga de
datos, bypass de pago), márcalo al inicio del reporte con 🚨 y dímelo de inmediato
en tu respuesta, no lo dejes enterrado en el archivo.
