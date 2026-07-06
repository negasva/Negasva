# Auditoría: desconexión entre el panel de administración y la landing page

Fecha: 2026-07-06 · Solo análisis, sin cambios de código.

## Resumen ejecutivo

**La landing actual (`app/page.tsx`) es un server component con casi todo el
copy hardcodeado.** El commit `3277846` (*feat(landing): rediseño animado
hecho-a-mano*, 2026-07-04) reemplazó la landing anterior — que leía `hero`,
`how_it_works`, `gallery_images` y `stats` de `/api/landing-config` (tabla
`landing_config` de Supabase) — por una versión estática en inglés pensada
para SEO. El panel `/adminlanding/landing` sigue editando esas claves en
Supabase, pero **la landing ya no las lee**, salvo dos excepciones: el footer
(`PageFooter`) y las FAQs (`/api/faqs`). Además, las imágenes del hero y de la
sección de pasos leen claves de `site_images` (`landing_hero_img1/2`,
`landing_paso_img1/2`) que **no existen en el registro de slots del admin**
(`lib/siteImages.ts`), así que no se pueden subir desde ningún panel y la
landing muestra el placeholder "Photo here".

---

## 1. Contenido que renderiza la landing actual y su origen

### `app/page.tsx` (server component, todo en inglés)

| Sección | Contenido | Origen |
|---|---|---|
| Hero — badge | "Portraits from $15" | **Hardcodeado** `app/page.tsx:80` |
| Hero — h1 | "Custom Cartoon Portrait, Hand-Drawn from your photo — no AI." | **Hardcodeado** `app/page.tsx:84-99` |
| Hero — subtítulo | "Turn your photo into an iconic cartoon character… from $15." | **Hardcodeado** `app/page.tsx:101-104` |
| Hero — CTA primario | "Order my portrait →" → `/order` | **Hardcodeado** `app/page.tsx:107-112` (`orderHref` en `:63`) |
| Hero — CTA secundario | "See how it works" → `#pasos` | **Hardcodeado** `app/page.tsx:113-118` |
| Hero — stats | 1.8M TikTok / 50K Instagram / +1000 happy clients | **Hardcodeado** `app/page.tsx:122-126` |
| Hero — badge semanal | "N portraits ordered this week" | **API** `/api/public-stats` (`app/home-islands.tsx:131-145`) |
| Hero — fotos antes/después | 2 imágenes | **API** `/api/landing-config` → `site_images.landing_hero_img1/img2` (`app/home-islands.tsx:43-75`); claves **inexistentes** en `SITE_IMAGE_SLOTS` → placeholder |
| Trust strip | "Delivered in 48 hours / Unlimited revisions / 100% hand-drawn — no AI" | **Hardcodeado** `app/page.tsx:140-150` |
| 3 simple steps — h2 | "Create your personalized gift portrait in 3 simple steps" | **Hardcodeado** `app/page.tsx:163-171` |
| 3 simple steps — pasos | Array `STEPS` (títulos + descripciones) | **Hardcodeado** `app/page.tsx:32-36` |
| 3 simple steps — fotos | 2 imágenes | **API** `site_images.landing_paso_img1/img2` (`app/home-islands.tsx:78-128`); claves inexistentes en slots → placeholder |
| 3 simple steps — CTA | "Start now →" → `/order` | **Hardcodeado** `app/page.tsx:189-194` |
| Pick Your Cartoon Style | h2, subtítulo "13 hand-drawn styles…", grid de 13 estilos (nombre, imagen, link `/styles/{slug}`) | **Estático** `lib/content/styles.ts` (`STYLES_CONTENT`, `app/page.tsx:211-230`). No usa `/api/styles` ni la tabla `portrait_styles` |
| "The perfect gift for…" | 12 chips de landings de ocasión | **Hardcodeado** `GIFT_LINKS` `app/page.tsx:17-30` |
| Your drawing on anything (POD) | h2, texto, bullets, CTA "See products" → `/products`, grid de productos con "from $X" | **Estático** `lib/pricing/products.ts` (`POD_PRODUCTS`, `app/page.tsx:296-308`); copy hardcodeado `:261-291` |
| Pricing | "One Person — Torso **$15**" y "One Person — Full Body **$25**" + "Custom Background: +$15" + CTAs → `/order` | **Hardcodeado** `app/page.tsx:316-352`. No lee la tabla `prices` ni `body_types` (nota: los fallbacks reales de `lib/pricing/fallbacks.ts` son 25 / 29.99 / fondo 15-25 → **los precios de la landing no coinciden con los del wizard de pedido**) |
| Testimonios | 20 reseñas con nombre + comentario | **Hardcodeado** `components/TestimonialsScroll.tsx:12-33` |
| FAQ | Primeras 5 FAQs activas, acordeón, link "See all questions" → `/faq` | **API/Supabase** `/api/faqs` → tabla `faqs` (`app/home-islands.tsx:150-211`) ✅ |
| CTA final | "Ready to turn your photo into cartoon art?" + botones → `/order` y `/contact` | **Hardcodeado** `app/page.tsx:366-390` |
| Footer | Tagline, redes, 3 columnas de links | **API/Supabase** `/api/landing-config` → clave `footer` (`components/PageFooter.tsx:134`), con fallback hardcodeado `DEFAULT_FOOTER` |
| Sticky CTA móvil | "Order my portrait · from $15" → `/order` | **Hardcodeado** `app/home-islands.tsx:215-237` |
| Navbar | Links de navegación | **Estático** `components/Navbar.tsx` (sin fetch) |

## 2. Qué edita cada sección del panel

### `/adminlanding/(protected)/` (panel de landing)

| Sección | Campos | API | Destino Supabase |
|---|---|---|---|
| **landing** | Hero (badge/headline/highlight/subheadline/CTA×2 en ES+EN), Pasos (título+desc ES/EN ×N), Galería (url+caption), Stats (valor+etiqueta ES/EN), Footer (tagline, redes, columnas de links) | `PATCH /api/landing-config` (claves `hero`, `how_it_works`, `gallery_images`, `stats`, `footer`) | tabla `landing_config` (key/value) |
| **contenido** | Overrides de texto por página/idioma (es/en/fr) para las páginas de `PAGE_REGISTRY`: **faq, blog, seguimiento, cookies, privacidad, términos** — la home NO está en el registro (`lib/i18n/pages/index.ts:19-26`) | `PATCH /api/page-content` | tabla `page_content` |
| **faqs** | question, answer, sort_order, is_active (CRUD) | `/api/admin/faqs` | tabla `faqs` |
| **galeria** | title, style, image_url, before_url, sort_order, is_active (CRUD + upload) | `/api/admin/gallery` | tabla `gallery` (+ Storage) |
| **packages** | name, description, final_price, active (CRUD) | `/api/admin/packages` | tabla `packages` |
| **discount-codes** | code, type, value, expires_at, max_uses, active | `/api/admin/discount-codes` | tabla `discount_codes` |

### `/admin/(protected)/` (panel de tienda, relevante para la landing)

| Sección | Qué toca | Destino |
|---|---|---|
| **imagenes** | Slots de `SITE_IMAGE_SLOTS` (`lib/siteImages.ts:19-30`): `landing_hero_bg`, `landing_before_sample`, `landing_after_sample`, `landing_how_step_1..5`, `order_body_*` + galería `gallery_images` | `landing_config.site_images` |
| **estilos** | CRUD de estilos | tabla `portrait_styles` (vía `/api/styles`) — la landing usa `STYLES_CONTENT` estático, no esta tabla |
| **prices** / **body-types** | precios y tipos de cuerpo | tablas `prices`, `body_types` — los usa `/order`, no la landing |

## 3. Cruce: qué funciona, qué está desconectado, qué sobra

### (a) El admin SÍ controla y funciona

| Contenido de la landing | Panel |
|---|---|
| FAQs de la home (5 primeras) y de `/faq` | `/adminlanding/faqs` → tabla `faqs` → `/api/faqs` ✅ |
| Footer (tagline, redes, columnas) | `/adminlanding/landing` → clave `footer` → `PageFooter` ✅ (sin campos FR en el editor, aunque el footer los soporta) |
| Badge "N portraits ordered this week" | Derivado de pedidos (`/api/public-stats`), indirectamente controlado por `/admin/orders` |

### (b) La landing lo muestra pero el admin NO puede editarlo (desconectado/hardcodeado)

| Contenido | Dónde está clavado | Observación |
|---|---|---|
| Hero completo (badge, h1, subtítulo, CTAs) | `app/page.tsx:75-118` | El editor Hero de `/adminlanding/landing` escribe en `landing_config.hero` y nadie lo lee |
| Stats 1.8M / 50K / +1000 | `app/page.tsx:122-126` | El editor Stats escribe `landing_config.stats`, sin lector |
| Pasos "3 simple steps" | `app/page.tsx:32-36` | El editor "Paso a paso" escribe `landing_config.how_it_works`, sin lector |
| **Fotos hero y pasos** | `app/home-islands.tsx:45-46,80-81` | Leen `site_images.landing_hero_img1/2` y `landing_paso_img1/2`, pero esas claves **no están en `SITE_IMAGE_SLOTS`**, así que `/admin/imagenes` no ofrece dónde subirlas → placeholder permanente "Photo here". Es la única parte de la landing que *intenta* leer del admin y no puede |
| Precios ($15 torso, $25 full body, +$15 fondo) | `app/page.tsx:325,341,351` | `/admin/prices` y `body_types` no afectan a la landing; además difieren de `lib/pricing/fallbacks.ts:23-29` (25 / 29.99) → riesgo de precio anunciado ≠ precio cobrado en `/order` |
| Grid de estilos (nombres, imágenes) | `lib/content/styles.ts` | `/admin/estilos` (tabla `portrait_styles`) no afecta a la home ni a `/styles/*` |
| Testimonios (20 reseñas) | `components/TestimonialsScroll.tsx:12-33` | Ningún panel los gestiona |
| Chips "The perfect gift for…" | `app/page.tsx:17-30` | Estático por diseño (SEO) |
| Productos POD y sus precios | `lib/pricing/products.ts` | Sin panel |
| CTA final, trust strip, sticky CTA | `app/page.tsx`, `app/home-islands.tsx:215-237` | Hardcodeado |
| Textos de la home vía "Contenido" | — | La home no existe en `PAGE_REGISTRY`, no se puede editar desde `/adminlanding/contenido` |

### (c) Campos/secciones del admin que ya NO existen en la landing (obsoletos)

| Campo del panel | Estado |
|---|---|
| `/adminlanding/landing` → **Hero** (12 campos ES/EN) | Sin lector desde el rediseño. Obsoleto tal cual (o reconectar) |
| `/adminlanding/landing` → **Paso a paso** (`how_it_works`) | Sin lector. La landing tiene 3 pasos fijos; el admin/slots asumían 5 |
| `/adminlanding/landing` → **Galería** (`gallery_images`) | La home ya no tiene sección de galería (la versión previa hacía fetch de `/api/gallery`). Solo la usa `/gallery` si existe; para la home, obsoleto |
| `/adminlanding/landing` → **Estadísticas** (`stats`) | Sin lector. Obsoleto |
| `/admin/imagenes` → slots `landing_hero_bg`, `landing_before_sample`, `landing_after_sample`, `landing_how_step_1..5` | Referencian secciones de la landing antigua ("Header/Hero" con fondo, slider antes/después, 5 pasos "Así de fácil"). Ninguna clave la lee la landing actual. Obsoletos — y faltan los 4 slots nuevos (`landing_hero_img1/2`, `landing_paso_img1/2`) |
| `/adminlanding/packages` | Ningún componente público consume `/api/packages` ni `getActivePackages` (grep sin resultados fuera del admin). Panel sin efecto visible |
| `docs/admin-integration.md` | Describe rutas que ya no existen (`app/precios/page.tsx`, `app/studio/page.tsx`, panel en `/admin` para todo). Desactualizado |

Nota: `/adminlanding/discount-codes`, `/admin/prices`, `/admin/body-types`, `/admin/backgrounds`, `/admin/estilos` sí tienen consumidores en el flujo de pedido/checkout — no son obsoletos, simplemente no tocan la landing.

## 4. Causa raíz de la desconexión

1. **Commit `3277846` — *feat(landing): rediseño animado hecho-a-mano* (2026-07-04).**
   La landing anterior era un client component que hacía
   `cachedFetchJSON('/api/landing-config')` y fusionaba `hero`,
   `how_it_works`, `gallery_images` y `stats` con defaults (visible en
   `git show 3277846~1:app/page.tsx`, líneas 34-120 y 144). El rediseño la
   reescribió como server component estático en inglés (reforzado por
   `52221b1` *"sirve HTML en inglés"* y `8e17599`, orientados a SEO), dejando
   todo el copy inline en `app/page.tsx` sin reconectar el panel.

2. **Claves de imagen renombradas sin actualizar el registro.** Las nuevas
   islas (`app/home-islands.tsx:45-46,80-81`) leen
   `landing_hero_img1/img2` y `landing_paso_img1/img2` de
   `landing_config.site_images`, pero `SITE_IMAGE_SLOTS`
   (`lib/siteImages.ts:19-30`) sigue con las claves del diseño viejo
   (`landing_hero_bg`, `landing_before_sample`, `landing_how_step_1..5`).
   Resultado: el admin muestra slots que nadie lee y la landing pide slots
   que el admin no ofrece.

3. **La home nunca se añadió a `PAGE_REGISTRY`** (`lib/i18n/pages/index.ts:19-26`),
   por lo que el editor genérico de textos (`/adminlanding/contenido` →
   `page_content`) tampoco puede cubrirla.

Lo único que sobrevivió a la reescritura fue lo que vive en componentes
compartidos (`PageFooter` → `footer`) o en islas nuevas (`HomeFaq` →
`/api/faqs`), de ahí que "algo" del panel siga funcionando.

## Recomendaciones (para una siguiente tarea, no aplicadas)

1. Añadir `landing_hero_img1/2` y `landing_paso_img1/2` a `SITE_IMAGE_SLOTS`
   y eliminar los slots viejos — arreglo mínimo que ya habilita las 4 fotos.
2. Decidir por sección: reconectar (leer `landing_config` en el server
   component con fallback al copy actual) o eliminar el editor correspondiente
   (Hero, Pasos, Stats, Galería) para que el panel no mienta.
3. Unificar precios: la landing anuncia $15/$25 mientras `/order` usa
   `prices`/`body_types` (fallback 25/29.99) — leer la tabla `prices` en la
   landing o corregir el copy.
4. Revisar `/adminlanding/packages` (sin consumidor público) y actualizar
   `docs/admin-integration.md`.
