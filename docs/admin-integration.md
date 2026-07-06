# Admin ↔ Web — mapa de integración

Estado tras la reconexión de la landing (ver historial en
`AUDIT-ADMIN-LANDING.md`, `scripts/sync-landing-content.sql` y `CLEANUP.sql`).

## Principio general

- Los **defaults del código** (`lib/content/homeContent.ts`, fallbacks de
  `lib/pricing/fallbacks.ts`, `DEFAULT_FOOTER` de `components/PageFooter.tsx`,
  `lib/i18n/pages/*`) son SOLO fallback si la BD no responde. La fuente de
  verdad es siempre lo que edita el admin en Supabase.
- **Reflejo inmediato**: la home y `/pricing` son estáticas (ISR,
  `revalidate = 300`), pero los endpoints del admin llaman a
  `revalidatePath('/')` / `revalidatePath('/pricing')` al guardar, así que el
  cambio se ve en la siguiente petición sin redeploy. Lo que se carga en
  cliente (`/api/landing-config`, `/api/faqs`) responde con
  `Cache-Control: no-store`.

## Mapa: sección de la landing → admin → API → Supabase

| Sección de la landing (/) | Pantalla del admin | API | Tabla/clave |
|---|---|---|---|
| Hero: badge, titular, subtítulo, CTAs (texto y destino), nota manuscrita | `/adminlanding/landing` → Hero | `PATCH /api/landing-config` | `landing_config` · `home_content.texts` |
| Hero: estadísticas (1.8M TikTok…) | `/adminlanding/landing` → Hero — estadísticas | ídem | `home_content.stats` |
| Hero: franja de confianza (48h, revisiones, no-AI) | `/adminlanding/landing` → Hero — franja | ídem | `home_content.trust` |
| Hero: fotos Before/After | `/admin/imagenes` → Landing → Hero | `PATCH /api/landing-config` | `landing_config` · `site_images.landing_hero_img1/2` |
| Badge "N portraits ordered this week" | automático desde pedidos (`/admin/orders`) | `GET /api/public-stats` | `admin_orders` |
| "3 simple steps": título, tarjetas, CTA | `/adminlanding/landing` → Pasos | `PATCH /api/landing-config` | `home_content.texts` + `home_content.steps` |
| "3 simple steps": fotos | `/admin/imagenes` → Landing → 3 simple steps | ídem | `site_images.landing_paso_img1/2` |
| Estilos: título, subtítulo, link "ver todos" | `/adminlanding/landing` → Estilos | ídem | `home_content.texts` |
| Estilos: tarjetas del grid (nombre, imagen, URL) | — (código) | — | `lib/content/styles.ts` — copy SEO por estilo, acoplado a las rutas `/styles/*` (ver "hardcodeado a propósito") |
| Chips "The perfect gift for…" (título) | `/adminlanding/landing` → Estilos | ídem | `home_content.texts.gifts_heading` |
| Chips de regalo (los enlaces) | — (código) | — | `GIFT_LINKS` en `app/page.tsx` — enlazado interno SEO |
| POD: textos, bullets, CTA | `/adminlanding/landing` → Productos | ídem | `home_content.texts` + `home_content.pod_bullets` |
| POD: precio "from $X" de cada producto | `/admin/prices` (claves `pod_<key>`) | `PUT /api/admin/prices` | `prices` |
| POD: nombre/icono de cada producto | — (código) | — | `lib/pricing/products.ts` (catálogo) |
| Pricing: títulos y textos de las tarjetas | `/adminlanding/landing` → Precios | `PATCH /api/landing-config` | `home_content.texts` |
| Pricing: importes $15 / $25 / +$15 | `/admin/body-types` y `/admin/prices` | `PUT/POST /api/admin/body-types`, `PUT /api/admin/prices` | `body_types.price_usd`, `prices.background_custom` |
| Testimonios (nombre, comentario, foto) | `/adminlanding/landing` → Testimonios (subida vía `lib/admin/uploadImage.ts`) | `PATCH /api/landing-config` | `home_content.testimonials` |
| FAQ (título y link "ver todas") | `/adminlanding/landing` → Testimonios y FAQ | ídem | `home_content.texts` |
| FAQ (preguntas/respuestas, orden, visibilidad) | `/adminlanding/faqs` | `/api/admin/faqs` (lee `/api/faqs`, no-store) | `faqs` |
| CTA final y CTA fija móvil | `/adminlanding/landing` → CTA final | `PATCH /api/landing-config` | `home_content.texts` |
| Footer (tagline, redes, columnas) | `/adminlanding/landing` → Footer | ídem | `landing_config` · `footer` |

## Otras pantallas del sitio

| Página | Admin | Tabla |
|---|---|---|
| `/pricing` (precios + paquetes) | `/admin/prices`, `/admin/body-types`, `/adminlanding/packages` | `prices`, `body_types`, `packages` |
| `/gallery` | `/adminlanding/galeria` | `gallery` |
| `/order` (estilos, fondos, tipos de cuerpo, precios) | `/admin/estilos`, `/admin/backgrounds`, `/admin/body-types`, `/admin/prices` | `portrait_styles`, `backgrounds`, `body_types`, `prices` |
| `/faq`, `/blog`, legales, seguimiento (textos es/en/fr) | `/adminlanding/contenido` | `page_content` |
| Checkout (cupones) | `/adminlanding/discount-codes` | `discount_codes` |

## Hardcodeado a propósito (y por qué)

- **`GIFT_LINKS`** (`app/page.tsx`): enlaces internos a las landings de
  ocasión. Son SEO estructural acoplado a rutas del código — cambiar un href
  sin que exista la ruta rompería enlaces; se tocan junto con las landings.
- **Grid de estilos** (`lib/content/styles.ts`): cada tarjeta enlaza a su
  landing SEO `/styles/<slug>` con su copy largo; es contenido de código
  versionado, no copy de marketing. El título/subtítulo de la sección sí son
  editables.
- **Nombres e iconos de productos POD** (`lib/pricing/products.ts`): catálogo
  de producto (afecta al checkout); sus *precios* sí se editan en
  `/admin/prices` (claves `pod_*`).
- **Navbar** (`components/Navbar.tsx`): navegación estructural del sitio.
- Los **"$15" incrustados en frases** (badge del hero, subtítulo, CTA fija)
  forman parte de textos libres editables; si cambias los precios en
  `/admin/prices`, recuerda actualizar también esas frases en
  `/adminlanding/landing`.

## Activación

1. Variables de entorno: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `ADMIN_PASSWORD` (ver `.env.example`).
2. Ejecutar `scripts/sync-landing-content.sql` (footer + precios + poda de
   `site_images`) y después `CLEANUP.sql`.
3. Panel de contenido en `/adminlanding`; panel de operación en `/admin`.
