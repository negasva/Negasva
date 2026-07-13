# Auditoría · Autenticación y autorización del panel admin

**Sección:** Seguridad · **Prioridad:** P0 · Crítico (hazlo esta semana)

Copia TODO lo que está debajo de la línea y pégalo en Claude Code, parado en la raíz del repo:

---

Haz una auditoría de **autenticación y autorización del panel admin** en este repo (negasva.shop: e-commerce
Next.js App Router + Supabase + pagos con PayPal y Mercado Pago + Printful para
productos físicos, desplegado en Vercel).

Por qué importa en este proyecto: El panel admin usa una contraseña compartida con cookie firmada (ADMIN_PASSWORD / ADMIN_SESSION_SECRET). Si una sola ruta /api/admin/* queda sin proteger, cualquiera puede ver pedidos, fotos de clientes y datos personales.

Zonas clave donde empezar (no te limites a ellas — explora lo relacionado):
- app/api/admin/**/route.ts
- app/admin/(protected)/**
- middleware.ts
- lib de sesión/cookies del admin

Revisa específicamente cada uno de estos puntos y márcalos como ✅ CUMPLE /
⚠️ PARCIAL / ❌ FALLA con evidencia (archivo:línea):
- Que TODAS las rutas bajo /api/admin/* verifiquen la sesión admin en el servidor (no solo el layout del frontend).
- Que la cookie de sesión sea HttpOnly, Secure, SameSite=Lax/Strict y tenga expiración razonable.
- Que la firma HMAC de la cookie no sea forjable y que rotar ADMIN_PASSWORD invalide sesiones activas.
- Que el login admin tenga rate limiting contra fuerza bruta y no revele si la contraseña era 'casi' correcta.
- Que no exista IDOR: que ningún endpoint permita leer/editar pedidos ajenos cambiando un id en la URL o el body.
- Que las respuestas de admin no se cacheen (Cache-Control: no-store).

ENTREGABLES (no apliques fixes de código en esta pasada — solo audita y documenta):

1. `audits/seguridad/autenticacion-admin/REPORTE.md` — hallazgos ordenados por severidad
   (crítico / alto / medio / bajo). Cada hallazgo con: evidencia (archivo:línea),
   explicación del riesgo en una frase, fix propuesto concreto, y esfuerzo estimado
   (S/M/L). Incluye al final una tabla-resumen con columna "Estado" para ir marcando.

2. `audits/seguridad/autenticacion-admin/BUENAS_PRACTICAS.md` — reglas accionables y
   permanentes de autenticación y autorización del panel admin para ESTE proyecto, escritas en imperativo
   (ej. "Nunca X", "Siempre Y al tocar Z"), derivadas tanto de lo que ya se hace
   bien como de los fallos encontrados. Este archivo es la referencia que cualquier
   sesión futura de Claude Code debe seguir al tocar código de esta área.

3. Agrega (si no existe) una línea en `CLAUDE.md` bajo una sección
   "## Buenas prácticas por área" que diga: antes de tocar código relacionado con
   seguridad, leer `audits/seguridad/autenticacion-admin/BUENAS_PRACTICAS.md`.

4. Commit de los .md siguiendo el flujo de git definido en CLAUDE.md (commit, push,
   PR con auto-merge), sin tocar código de la app en esta tanda.

Si durante la auditoría encuentras algo CRÍTICO explotable ahora mismo (fuga de
datos, bypass de pago), márcalo al inicio del reporte con 🚨 y dímelo de inmediato
en tu respuesta, no lo dejes enterrado en el archivo.
