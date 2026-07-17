# BUENAS PRÁCTICAS — Backups y recuperación ante desastres (negasva.shop)

Un `DROP TABLE`, una migración mala o la suspensión del proyecto Supabase pueden
borrar el negocio. Lo que importa no es tener backup, sino poder RESTAURAR. Al
tocar migraciones, buckets, `vercel.json` o la configuración de infraestructura:

1. **Nunca confíes la supervivencia del negocio al plan free.** El free no tiene
   backups automáticos ni PITR. Mantén al menos un `pg_dump` programado a
   almacenamiento externo cifrado; idealmente, plan Pro con backups diarios.

2. **El Storage se respalda aparte de la BD.** Un backup de PostgreSQL NO incluye
   los buckets. Las fotos de clientes (`order-photos`) y los retratos/`backgrounds`
   necesitan su propia sincronización a almacenamiento externo. Si tocas un bucket,
   confirma que entra en el respaldo.

3. **Toda migración es idempotente y reconstruye desde cero.** Escribe `CREATE …
   IF NOT EXISTS`, `ON CONFLICT DO UPDATE`, `DROP POLICY IF EXISTS`. El conjunto
   `migrations/**` aplicado en orden sobre un Postgres limpio debe dejar el esquema
   completo, incluidos buckets y policies.

4. **Prueba el restore, no solo el backup.** Antes de dar por buena la estrategia,
   aplica las migraciones en un proyecto limpio y verifica que la app arranca
   contra él. Un backup nunca restaurado no es un backup.

5. **Los secretos viven respaldados en un gestor, nunca solo en Vercel ni en el
   repo.** `SERVICE_ROLE_KEY`, claves de Stripe/PayPal/Mercado Pago/Resend,
   `KEEPALIVE_SECRET`, `CRON_SECRET`: inventariados en 1Password/Bitwarden y con
   procedimiento de rotación documentado.

6. **Mantén el keepalive mientras el proyecto sea free.** Evita la pausa por
   inactividad, pero recuerda que NO es un backup ni un monitor de uptime.

7. **Documenta un runbook de recuperación.** Pasos exactos para reconstruir el
   servicio: crear proyecto → aplicar migraciones → restaurar buckets → cargar
   secretos → apuntar Vercel. Mantenlo al día cuando cambie la infraestructura.

8. **Rastrea qué migraciones están aplicadas en producción.** Evita la deriva entre
   el esquema del repo y el de prod; usa el historial de migraciones del Supabase
   CLI en lugar de pegar SQL a mano sin registro.
</content>
