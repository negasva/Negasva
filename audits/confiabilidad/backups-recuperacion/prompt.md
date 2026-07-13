# Auditoría · Backups y recuperación ante desastres

**Sección:** Confiabilidad y operación · **Prioridad:** P1 · Importante (hazlo este mes)

Copia TODO lo que está debajo de la línea y pégalo en Claude Code, parado en la raíz del repo:

---

Haz una auditoría de **backups y recuperación ante desastres** en este repo (negasva.shop: e-commerce
Next.js App Router + Supabase + pagos con PayPal y Mercado Pago + Printful para
productos físicos, desplegado en Vercel).

Por qué importa en este proyecto: Un DROP TABLE accidental, una migración mala o la suspensión del proyecto Supabase (plan free se pausa por inactividad — de ahí el keepalive) pueden borrar tu negocio. La pregunta no es si tienes backup, sino si puedes RESTAURAR.

Zonas clave donde empezar (no te limites a ellas — explora lo relacionado):
- proyecto Supabase (plan y backups)
- supabase/migrations/**
- bucket de storage
- vercel.json

Revisa específicamente cada uno de estos puntos y márcalos como ✅ CUMPLE /
⚠️ PARCIAL / ❌ FALLA con evidencia (archivo:línea):
- ¿Qué backups automáticos incluye tu plan actual de Supabase y cuánta retención tienen?
- El storage (fotos de clientes y retratos) — ¿está incluido en el backup o solo la BD?
- ¿Las migraciones del repo permiten reconstruir el esquema desde cero? (probar en un proyecto limpio).
- Simulacro: restaurar un backup en un proyecto de prueba y verificar que la app funciona contra él.
- Variables de entorno respaldadas en un gestor de secretos (si pierdes el proyecto Vercel, ¿tienes las claves?).

ENTREGABLES (no apliques fixes de código en esta pasada — solo audita y documenta):

1. `audits/confiabilidad/backups-recuperacion/REPORTE.md` — hallazgos ordenados por severidad
   (crítico / alto / medio / bajo). Cada hallazgo con: evidencia (archivo:línea),
   explicación del riesgo en una frase, fix propuesto concreto, y esfuerzo estimado
   (S/M/L). Incluye al final una tabla-resumen con columna "Estado" para ir marcando.

2. `audits/confiabilidad/backups-recuperacion/BUENAS_PRACTICAS.md` — reglas accionables y
   permanentes de backups y recuperación ante desastres para ESTE proyecto, escritas en imperativo
   (ej. "Nunca X", "Siempre Y al tocar Z"), derivadas tanto de lo que ya se hace
   bien como de los fallos encontrados. Este archivo es la referencia que cualquier
   sesión futura de Claude Code debe seguir al tocar código de esta área.

3. Agrega (si no existe) una línea en `CLAUDE.md` bajo una sección
   "## Buenas prácticas por área" que diga: antes de tocar código relacionado con
   confiabilidad y operación, leer `audits/confiabilidad/backups-recuperacion/BUENAS_PRACTICAS.md`.

4. Commit de los .md siguiendo el flujo de git definido en CLAUDE.md (commit, push,
   PR con auto-merge), sin tocar código de la app en esta tanda.

Si durante la auditoría encuentras algo CRÍTICO explotable ahora mismo (fuga de
datos, bypass de pago), márcalo al inicio del reporte con 🚨 y dímelo de inmediato
en tu respuesta, no lo dejes enterrado en el archivo.
