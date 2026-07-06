# Admin Panel — Guía de integración con el frontend

> **⚠️ Documento histórico (parcialmente desactualizado).** Las rutas
> `app/precios/page.tsx` y `app/studio/page.tsx` ya no existen; los precios los
> lee `/pricing` y `/order` desde las tablas `prices`/`body_types`, y los
> paquetes se muestran en `/pricing`. Para el estado real de qué controla cada
> panel, ver `AUDIT-ADMIN-LANDING.md`, `scripts/sync-landing-content.sql` y
> `CLEANUP.sql`.

Este documento describe qué partes del sitio público deben actualizarse para leer
los datos dinámicamente desde Supabase en lugar de tener los valores hardcodeados.

---

## 1. Precios

### Situación actual
Los precios están definidos de forma estática en los componentes de cada página
(por ejemplo en `app/precios/page.tsx` o `app/studio/page.tsx`).

### Qué cambiar
1. Añadir una función de fetch en el servidor que lea la tabla `prices`:

```ts
// lib/data/prices.ts
import { createServerClient } from '@/lib/supabase/server';

export async function getPrices(): Promise<Record<string, number>> {
  const supabase = createServerClient();
  const { data } = await supabase.from('prices').select('key, amount');
  return Object.fromEntries((data ?? []).map((p) => [p.key, p.amount]));
}
```

2. En cada Server Component que muestre precios, reemplazar el valor literal por la llamada:

```ts
// Antes
const PRICE_SINGLE = 25;

// Después
import { getPrices } from '@/lib/data/prices';
const prices = await getPrices();
const PRICE_SINGLE = prices['portrait_single'] ?? 25; // fallback por si la tabla está vacía
```

3. Poblar la tabla `prices` desde el panel admin con las claves que uses en el código.
   Convención de nombres sugerida:
   - `portrait_single` — Retrato individual
   - `portrait_couple` — Retrato pareja
   - `portrait_family` — Retrato familiar
   - `portrait_pet` — Retrato mascota
   - `rush_fee` — Cargo por urgencia

---

## 2. Paquetes

### Situación actual
Los paquetes (combos de productos) están definidos como arrays o constantes en
`app/precios/page.tsx` o similar.

### Qué cambiar
1. Añadir un fetch de la tabla `packages`:

```ts
// lib/data/packages.ts
import { createServerClient } from '@/lib/supabase/server';
import type { Package } from '@/types/admin';

export async function getActivePackages(): Promise<Package[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('packages')
    .select('*')
    .eq('active', true)
    .order('final_price');
  return data ?? [];
}
```

2. En el Server Component que renderiza los paquetes:

```ts
import { getActivePackages } from '@/lib/data/packages';
const packages = await getActivePackages();
```

3. Mapear `packages` al JSX que actualmente usa el array hardcodeado.

---

## 3. Fondos

### Situación actual
Los fondos disponibles para los retratos están guardados como archivos estáticos
en `public/backgrounds/` o como un array de URLs hardcodeadas.

### Qué cambiar
1. Añadir un fetch de la tabla `backgrounds`:

```ts
// lib/data/backgrounds.ts
import { createServerClient } from '@/lib/supabase/server';
import type { Background } from '@/types/admin';

export async function getActiveBackgrounds(): Promise<Background[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('backgrounds')
    .select('*')
    .eq('active', true)
    .order('created_at');
  return data ?? [];
}
```

2. En el componente de selección de fondo (probablemente en `app/studio/page.tsx`
   o un selector del formulario de pedido), reemplazar el array estático:

```ts
// Antes
const BACKGROUNDS = ['/backgrounds/playa.jpg', '/backgrounds/ciudad.jpg'];

// Después
import { getActiveBackgrounds } from '@/lib/data/backgrounds';
const backgrounds = await getActiveBackgrounds(); // [{ id, name, image_url, ... }]
```

3. Si el componente es Client Component, hacer el fetch desde la API pública:

```ts
// En un Client Component
const [backgrounds, setBackgrounds] = useState([]);
useEffect(() => {
  fetch('/api/backgrounds') // crea esta ruta pública que sólo devuelve active=true
    .then(r => r.json())
    .then(setBackgrounds);
}, []);
```

---

## 4. Códigos de descuento

### Situación actual
El checkout (Stripe) puede no validar cupones o tenerlos hardcodeados.

### Qué cambiar
1. Crear una API route pública `/api/validate-discount`:

```ts
// app/api/validate-discount/route.ts
import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase/client'; // o server client si es SSR

export async function POST(request: Request) {
  const { code } = await request.json();
  const { data } = await getSupabase()
    .from('discount_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('active', true)
    .maybeSingle();

  if (!data) return NextResponse.json({ valid: false });

  const expired = data.expires_at && new Date(data.expires_at) < new Date();
  const exhausted = data.max_uses !== null && data.current_uses >= data.max_uses;
  if (expired || exhausted) return NextResponse.json({ valid: false });

  return NextResponse.json({ valid: true, type: data.type, value: data.value });
}
```

2. En el formulario de checkout, llamar a `/api/validate-discount` cuando el usuario
   aplique un código, y ajustar el total antes de crear la sesión de Stripe.

3. Al confirmar el pago, incrementar `current_uses` del código usado:

```ts
await supabase
  .from('discount_codes')
  .update({ current_uses: supabase.rpc('increment', { x: 1 }) })
  .eq('code', code);
```

---

## 5. Pasos para activar el panel

1. Ejecutar la migración SQL en Supabase:
   `supabase/migrations/006_admin_tables.sql`

2. Crear el bucket de Storage en Supabase Dashboard:
   - Nombre: `backgrounds`
   - Acceso: privado (o público según preferencia)
   - Configurar CORS si es necesario

3. Crear el usuario admin en Supabase Auth:
   - Dashboard → Authentication → Users → Invite user
   - Tras crear el usuario, editar su `user_metadata` y añadir `{ "role": "admin" }`

4. Poblar la tabla `prices` con las claves iniciales:

```sql
INSERT INTO public.prices (key, label, amount, currency) VALUES
  ('portrait_single', 'Retrato individual', 25.00, 'USD'),
  ('portrait_couple', 'Retrato pareja',     35.00, 'USD'),
  ('portrait_family', 'Retrato familiar',   45.00, 'USD'),
  ('portrait_pet',    'Retrato mascota',    20.00, 'USD'),
  ('rush_fee',        'Cargo por urgencia', 10.00, 'USD');
```

5. Acceder al panel en `negasva.shop/admin`
