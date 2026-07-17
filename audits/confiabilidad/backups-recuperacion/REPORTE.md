# REPORTE — Backups y recuperación ante desastres

**Fecha:** 2026-07-16 · **Auditor:** Claude Code (solo diagnóstico, análisis de
código; el plan real de Supabase, sus backups y el respaldo de secretos no son
verificables desde el sandbox — marcado como "verificar en la consola/proveedor").

> ⚠️ **La pregunta no es si tienes backup, sino si puedes RESTAURAR.** Hoy no hay
> ninguna evidencia en el repo de un plan de restauración probado, y varias señales
> apuntan a que el storage (las fotos y retratos) no está respaldado. No arreglo
> nada aquí; lo documento.

---

## Hallazgos

### 🔴 Severidad ALTA

**A1 — Señales de plan Supabase free → sin backups automáticos / PITR**
- Evidencia: `app/api/keepalive/route.ts:11-19` existe precisamente porque "Supabase pauses free projects after ~7 days of inactivity"; el keepalive solo tiene sentido en plan free. El plan free **no** incluye backups diarios ni Point-in-Time Recovery (eso empieza en Pro; PITR es addon).
- Riesgo: un `DROP TABLE` accidental, una migración mala o la suspensión del proyecto pueden borrar el negocio sin posibilidad de restaurar.
- Fix propuesto: subir a plan Pro (backups diarios con 7 días de retención) o, como mínimo, un `pg_dump` programado (GitHub Action/cron) a almacenamiento externo cifrado. (verificar plan actual en la consola de Supabase)
- Esfuerzo: **M**

**A2 — El Storage (fotos de clientes y retratos entregados) no está cubierto por el backup de la BD**
- Evidencia: los buckets `order-photos` (`supabase/migrations/019_order_photos.sql`) y `backgrounds` (`009_storage_bucket.sql`) viven en Storage, no en las tablas; un backup de PostgreSQL no incluye los objetos de Storage. No hay ningún proceso de respaldo de buckets en el repo.
- Riesgo: aunque hubiera backup de BD, perder el proyecto significaría perder todas las fotos de clientes y los retratos entregados — irrecuperables.
- Fix propuesto: sincronización periódica de los buckets a almacenamiento externo (S3/rclone/Backblaze) con retención; incluirlo en el runbook de restore.
- Esfuerzo: **M**

### 🟠 Severidad MEDIA

**M1 — Sin simulacro de restauración ni verificación de que las migraciones reconstruyen el esquema desde cero**
- Evidencia: hay 31 migraciones versionadas y aparentemente idempotentes (`supabase/migrations/001…031`), pero no hay prueba (CI ni runbook) de que aplicándolas en un proyecto limpio la app arranque; varias declaran "Run once in the Supabase SQL editor" (`019:13`), es decir, aplicación manual.
- Riesgo: descubrir en pleno desastre que faltan pasos manuales (crear buckets, seeds, policies, variables) y que el "backup" no es restaurable en la práctica.
- Fix propuesto: job de CI que levante un Postgres limpio, aplique `migrations/**` en orden y verifique el esquema; documentar un runbook de restore paso a paso (BD + buckets + env).
- Esfuerzo: **M**

**M2 — Variables de entorno / secretos sin respaldo documentado**
- Evidencia: no hay documentación de respaldo de secretos; las claves viven solo en local y en Vercel. Los secretos en juego son críticos (Supabase `SERVICE_ROLE_KEY`, Stripe, PayPal, Mercado Pago, Resend, `KEEPALIVE_SECRET`, `CRON_SECRET`).
- Riesgo: perder el proyecto Vercel (o el acceso) significaría perder las claves y no poder reconstruir el servicio.
- Fix propuesto: respaldar todos los secretos en un gestor (1Password/Bitwarden) y documentar el inventario y cómo rotarlos; nunca en el repo.
- Esfuerzo: **S**

### 🟡 Severidad BAJA

**B1 — Las migraciones se aplican a mano; no hay historial de qué está aplicado en prod**
- Evidencia: cabeceras tipo "Run once in the Supabase SQL editor. Idempotent" (`019:13`); no se usa el historial de migraciones del Supabase CLI.
- Riesgo: deriva entre el esquema del repo y el de producción; en un restore no se sabe con certeza qué migraciones faltan.
- Fix propuesto: adoptar `supabase db push`/migration history para que el estado aplicado sea rastreable.
- Esfuerzo: **M**

### ✅ Lo que ya está bien (mantener)

- **Migraciones versionadas en el repo** (`001…031`), en orden y mayormente idempotentes — la base para reconstruir el esquema existe ✅.
- **Keepalive real** que evita la pausa del proyecto free con una query auténtica (`app/api/keepalive/route.ts:69-71`) ✅ — mitiga la suspensión por inactividad (aunque no sustituye a un backup).
- **Buckets declarados como código** (`009`, `019`) con sus límites y policies — reproducibles al recrear el proyecto ✅ (falta respaldar su *contenido*, A2).

## Checklist del prompt

| Punto | Estado | Evidencia |
|---|---|---|
| Backups automáticos del plan actual y su retención | ❌ FALLA (probable free, sin backups) — verificar consola | A1 |
| El storage está incluido en el backup | ❌ FALLA — Storage fuera del backup de BD | A2 |
| Las migraciones reconstruyen el esquema desde cero | ⚠️ PARCIAL — existen, sin prueba en limpio | M1 |
| Simulacro de restauración en proyecto de prueba | ❌ FALLA — no documentado | M1 |
| Variables de entorno respaldadas en gestor de secretos | ⚠️ VERIFICAR — sin evidencia de respaldo | M2 |

## Tabla-resumen (para marcar al arreglar)

| ID | Severidad | Hallazgo | Esfuerzo | Estado |
|---|---|---|---|---|
| A1 | 🔴 Alta | Plan free probable → sin backups/PITR | M | Pendiente |
| A2 | 🔴 Alta | Storage (fotos/retratos) sin respaldo | M | Pendiente |
| M1 | 🟠 Media | Sin simulacro de restore ni prueba de migraciones | M | Pendiente |
| M2 | 🟠 Media | Secretos sin respaldo documentado | S | Pendiente |
| B1 | 🟡 Baja | Migraciones manuales sin historial en prod | M | Pendiente |
</content>
