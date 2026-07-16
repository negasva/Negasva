# Recuperación de carritos por email (Resend) — guía paso a paso

Esta guía explica cómo configurar los emails que se envían para **retomar un
carrito abandonado**, tanto el envío **automático** (cron) como el **manual**
(botón "Enviar email" en el panel → Carritos).

Ambos usan el mismo motor: generan un **cupón de descuento único** para ese
carrito y mandan una de las **4 plantillas** de recuperación por
[Resend](https://resend.com). El código vive en:

- `lib/notify/email.ts` — envío genérico vía la API de Resend.
- `lib/notify/cartRecovery.ts` — las 4 plantillas (A/B testing).
- `lib/carts/recovery.ts` — generación del cupón único.
- `app/api/cron/recover-carts/route.ts` — envío automático (cron).
- `app/api/admin/carts/send-recovery/route.ts` — envío manual desde el panel.

---

## Paso 1 · Crear la cuenta de Resend y verificar el dominio

1. Crea una cuenta en https://resend.com.
2. En **Domains → Add Domain**, añade `negasva.shop`.
3. Resend te da unos registros **DNS** (SPF, DKIM y, opcionalmente, DMARC).
   Añádelos en tu proveedor de dominio (donde gestionas `negasva.shop`).
4. Espera a que Resend marque el dominio como **Verified** (unos minutos).
   Sin dominio verificado, Resend solo deja enviar a tu propio correo.
5. En **API Keys → Create API Key**, crea una clave con permiso de envío y
   cópiala (empieza por `re_...`). Solo se muestra una vez.

## Paso 2 · Configurar las variables de entorno

En Vercel (**Project → Settings → Environment Variables**) —y en tu `.env.local`
para desarrollo— define:

| Variable | Obligatoria | Ejemplo | Qué hace |
|---|---|---|---|
| `RESEND_API_KEY` | ✅ | `re_xxxxxxxx` | Clave de la API de Resend. |
| `RESEND_FROM` | ✅ | `NEGASVA <hola@negasva.shop>` | Remitente. **Debe** usar el dominio verificado. |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://negasva.shop` | Base para el enlace de "retomar pedido". |
| `ADMIN_NOTIFY_EMAIL` | ⬜ | `pedidos@negasva.shop` | `reply-to`: adónde llegan las respuestas del cliente. |
| `CRON_SECRET` | ✅ (solo cron) | `una-cadena-larga-al-azar` | Autentica el cron de Vercel. |

> Sin `RESEND_API_KEY` **o** `RESEND_FROM`, el envío es un no-op: el botón del
> panel devuelve "Email (Resend) no configurado" y el cron no manda nada. Nada
> se rompe, simplemente no se envía.

## Paso 3 · Ajustar el descuento del cupón (opcional)

Los cupones se generan solos; puedes afinar su valor y caducidad con estas
variables (tienen valores por defecto sensatos):

| Variable | Def. | Qué hace |
|---|---|---|
| `CART_RECOVERY_DISCOUNT_TYPE` | `percentage` | `percentage` (%) o `fixed` ($). |
| `CART_RECOVERY_DISCOUNT_VALUE` | `10` | Valor del descuento (10 = 10% o $10). |
| `CART_RECOVERY_EXPIRES_HOURS` | `72` | Horas de validez del cupón. |

Estas tres aplican tanto al cron como al botón manual. Las siguientes son **solo
del cron automático** (a quién y cuándo escribe):

| Variable | Def. | Qué hace |
|---|---|---|
| `CART_RECOVERY_MIN_AGE_MIN` | `60` | Minutos de inactividad mínimos antes de escribir. |
| `CART_RECOVERY_MAX_AGE_HOURS` | `168` | No escribir a carritos más viejos que esto (7 días). |
| `CART_RECOVERY_BATCH` | `50` | Máximo de emails por ejecución. |

## Paso 4 · Activar el envío automático (cron de Vercel)

El cron llama a `GET /api/cron/recover-carts` con `Authorization: Bearer
<CRON_SECRET>`. Añade el schedule en `vercel.json` (por ejemplo, cada hora):

```json
{
  "crons": [
    { "path": "/api/cron/recover-carts", "schedule": "0 * * * *" }
  ]
}
```

En cada ejecución busca carritos **activos, con email, inactivos hace un rato,
no demasiado viejos y sin recuperación previa**, les genera un cupón y les manda
una plantilla al azar. Marca `recovery_sent_at` para no reenviar y guarda qué
versión se usó (`recovery_variant`) para medir cuál convierte mejor.

## Paso 5 · Enviar manualmente desde el panel

En **Admin → Carritos**, cada carrito abandonado **con email** muestra el botón
**Enviar email**. Al pulsarlo:

1. Se genera un cupón único para ese carrito.
2. Se envía una de las 4 plantillas por Resend.
3. El botón pasa a **Reenviar email** y se marca "✓ Enviado" con la fecha.

Si el carrito no tiene email, aparece "Sin email — no se puede enviar
recuperación" (no hay a dónde escribir).

## Paso 6 · Probar que funciona

1. Con las env vars puestas, abre un carrito de prueba en la web usando **tu
   propio email** y abandónalo en el paso de pago.
2. En **Admin → Carritos**, pulsa **Enviar email** sobre ese carrito.
3. Revisa tu bandeja: debe llegar el correo con el cupón y el enlace
   "retomar". En **Resend → Emails** verás el log del envío (entregado/rebote).
4. Al abrir el enlace, el checkout debe aplicar el cupón automáticamente.

---

### Las 4 plantillas (A/B testing)

Se elige una al azar en cada envío; el número queda en `carts.recovery_variant`:

1. **Recordatorio cálido** — "tu retrato te está esperando".
2. **Urgencia** — "tu descuento caduca pronto".
3. **Prueba social** — "únete a +530.000 retratos".
4. **Personal / atención** — "¿te ayudamos a terminar tu retrato?".

Para cambiar textos o añadir versiones EN/FR, edita `lib/notify/cartRecovery.ts`.

### Resolución de problemas

- **"Email (Resend) no configurado"** → faltan `RESEND_API_KEY` o `RESEND_FROM`.
- **El correo no llega** → dominio no verificado, o `RESEND_FROM` usa un dominio
  distinto al verificado. Revisa **Resend → Emails** para ver el rebote.
- **El cron no envía** → falta `CRON_SECRET` o el schedule en `vercel.json`, o
  todos los carritos ya tienen `recovery_sent_at`.
