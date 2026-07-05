# SEO AUDIT — negasva.shop (2026-07-05, v2)

Modo: solo auditoría. Único archivo tocado: este. Sin commits.

Nota: reemplaza al audit anterior (mismo día, pre-merge de #161). Los P0 de aquella versión ya están ejecutados: sitio EN server-rendered, slugs `/styles/*` keyword-exact con 301, 8 estilos, 9 landings de intención, blog EN (5 posts), página artista con schema Person, reviews fake eliminadas, OG image propia, sitemap con fechas reales.

## Score /100

| Área | Score | Veredicto |
|---|---|---|
| Técnico | 78 | Base sólida (sitemap, robots, metadata, JSON-LD, 301s). Restos ES en rutas/metadata y conflicto noindex+sitemap |
| On-page | 72 | Keywords semilla en HTML servido ✓, alts EN ✓. Fallan navbar vacío y 3 páginas hub client-side |
| Contenido | 60 | 5 posts EN buenos (comparadores incl.) + 6 posts ES diluyendo. Volumen bajo vs turnedyellow |
| Arquitectura | 68 | Landing-por-estilo (8) y por intención (9) ✓. Landings casi huérfanas de internal linking; faltan ocasiones y estilos |
| **GLOBAL** | **70** | Fundación hecha. Lo que queda: enlazar lo construido, terminar la migración EN y escalar contenido |

## Tabla de hallazgos

| Archivo/Ruta | Problema | Impacto | Fix propuesto | Keyword afectada |
|---|---|---|---|---|
| `components/Navbar.tsx` | Navbar solo enlaza `/` y `/order`. Ni Styles, ni Pricing, ni Gallery, ni Blog | ALTO | Añadir Styles, Pricing, Gallery, Blog, FAQ al nav (crawl depth + PageRank interno) | todas |
| `app/page.tsx` + `home-islands.tsx` | Home no enlaza a `/styles`, a ninguna landing de estilo ni de intención (solo `/order`, `/faq`, `/contacto`) | ALTO | Sección "Styles" en home con cards a las 8 landings + bloque "Gifts" a las landings de ocasión | custom cartoon portrait, simpsons style portrait |
| `app/custom-*-portrait`, `/gifts/*`, `/memorial-portrait`, `/hand-drawn-no-ai` | Landings SEO solo enlazadas entre sí y desde sitemap — casi huérfanas (0 links desde home/nav/footer/blog) | ALTO | Enlazarlas desde footer (columna "Gifts"), home y posts del blog relacionados | custom couple portrait, custom pet portrait, cartoon portrait christmas gift |
| `app/order/layout.tsx:6` vs `app/sitemap.ts:15` | `/order` es `noindex` pero está en sitemap con priority 0.9 | ALTO | Decidir: o se indexa (quitar noindex, añadir metadata real con description) o se saca del sitemap. Recomendado: indexar — competidores rankean su página de pedido | turn photo into cartoon |
| `app/precios/`, `app/galeria/`, `app/contacto/`, `app/seguimiento/` | Slugs ES en sitio EN; metadata title/description en español (`Precios`, `Galeria de Retratos`, `Contacto`) | ALTO | Migrar a `/pricing`, `/gallery`, `/contact`, `/track-order` con metadata EN + 301 desde ES (mismo patrón que `/sobre→/about`) | pricing custom cartoon portrait, cartoon portrait examples |
| `lib/content/blogPosts.ts` (posts 6-11) | 6 posts ES conviven con 5 EN: idioma mixto en un sitio `lang="en"`, sin hreflang, diluyen el blog | MEDIO | Reescribirlos en EN apuntando a keywords (photo tips, process, family portraits ya tienen equivalente de keyword EN) o noindex/eliminar con 301 al equivalente EN | how to take photos for portrait, custom portrait process |
| `app/faq/page.tsx`, `app/galeria/page.tsx`, `app/precios/page.tsx`, `app/styles/page.tsx` | Páginas hub 100% `'use client'` con contenido vía fetch a `/api/*`: HTML inicial casi vacío (FAQs, galería y catálogo de estilos no llegan en el HTML) | ALTO | Server components con fetch en servidor (los datos ya están en Supabase); islas cliente solo para interactividad. `/faq` además sin schema FAQPage | faq rich results, cartoon portrait examples |
| `app/faq/` | Sin JSON-LD FAQPage (las landings de estilo sí lo tienen) | MEDIO | FAQPage schema server-rendered con las FAQs reales | (rich results) |
| `app/styles/layout.tsx:5` | Description menciona solo 4 estilos; ya hay 8 (falta Family Guy, South Park, Anime, Disney-Pixar — los de más volumen) | MEDIO | Reescribir title/description con los 8 estilos | family guy style portrait, anime portrait from photo |
| `app/llms.txt/route.ts` | Dice "Spanish-first site" y enlaza `/precios`, `/galeria` | BAJO | Actualizar a EN, rutas nuevas, añadir landings | (LLM search) |
| `app/galeria/page.tsx:77` | `alt={item.title}` — alts dependen de títulos del admin, sin patrón keyword | MEDIO | Alt pattern: "{style} style custom portrait hand drawn from photo — {title}" | image SEO |
| `lib/content/*` | Ningún schema HowTo pese a que cada página de estilo tiene sección "How is it made?" | BAJO | HowTo schema en `/styles/[slug]` y futura `/how-it-works` | how to turn photo into cartoon |
| Global | Cero reviews/rating reales visibles ni en schema (las fake se quitaron — correcto). Testimonials en home son texto sin schema | MEDIO | Recolectar reviews reales (Trustpilot/Judge.me o propias) y añadir AggregateRating legítimo a Product schema | (rich results, CTR) |
| `app/blog/[slug]/page.tsx:31` | OG del blog usa `post.image` = `/backgrounds/rm-*.webp` (arte de marca ajena) en todos los posts | MEDIO | Imágenes propias por post (portadas before/after) | (CTR social, legal) |
| `lib/content/*` + `app/galeria` | Solo ~5 imágenes reales en todo el sitio, y son backgrounds de Rick & Morty, no retratos before/after propios | ALTO | Poblar con retratos reales antes/después con alts keyword — es el activo image-SEO del nicho | simpsons style portrait (Google Images) |
| `app/track/` + `app/seguimiento/` | Ruta duplicada (track noindex + canonical a /seguimiento — bien resuelto, pero sobra una) | BAJO | Consolidar en `/track-order` EN cuando se migre `/seguimiento` | — |
| `app/blog/[slug]/page.tsx` | generateMetadata sin `twitter` card (styles y landings sí la tienen) | BAJO | Añadir twitter card | — |
| Global | Sin hreflang en ningún sitio pese a contenido ES residual indexable | BAJO | No añadir hreflang; terminar migración EN-only. Si algún día hay ES real: rutas por locale + hreflang | — |

## Lo que ya está bien (no tocar)

- `app/layout.tsx`: metadata EN completa, metadataBase, canonical, OG/twitter, OnlineStore schema, `lang="en"`.
- `app/sitemap.ts` + `app/robots.ts`: existen, dinámicos, fechas reales.
- `/styles/[slug]`: server component, generateMetadata, Product+AggregateOffer+BreadcrumbList+FAQPage, slugs keyword-exact, priority en hero image, internal links a otros estilos y a /order.
- `next.config.js`: 301s ES→EN, AVIF/WebP, headers de seguridad.
- Blog EN: comparadores "best custom cartoon portrait sites" y "turned yellow alternatives" ya existen (jugada portraitflip ✓).
- `/about`: E-E-A-T con ProfilePage/Person, autor enlazado desde cada BlogPosting.
- Home: server component, H1 con keyword exacta + diferenciadores (hand-drawn, no AI, 48h, $15), alts EN keyword.
- OG image propia generada en build.

## Competitivo — quién captura cada gap restante

| Gap nuestro | Competidor que ya lo hace | Keyword que captura |
|---|---|---|
| Página `/how-it-works` dedicada | turnedyellow | how does turned yellow work, custom portrait process |
| Landings Mother's Day / Father's Day / Wedding | turnedyellow (blog+landings), Etsy sellers | mother's day cartoon portrait, wedding gift portrait |
| Más estilos (Futurama, Bob's Burgers, American Dad, King of the Hill, Studio Ghibli) | cartoonely (una landing por estilo) | futurama style portrait, bobs burgers style portrait |
| Página de producto físico (canvas, mug, t-shirt) | itoonify (Amazon), turnedyellow | custom cartoon portrait canvas / mug |
| Reviews reales visibles + rating schema | turnedyellow, customartcapital (Trustpilot) | turned yellow reviews (CTR estrellitas) |
| Volumen blog (50+ posts long-tail) | turnedyellow | gift ideas long-tail infinita |
| Galería indexable con retratos reales | petportraits.com, Etsy listings | cartoon portrait examples (Google Images) |
| Landing "cartoon yourself" transaccional | turnedyellow (home) | cartoon yourself (solo tenemos post de blog) |

## Backlog priorizado

### P0 — máximo impacto, mínimo esfuerzo (una sesión)
1. **Navbar**: añadir links Styles / Pricing / Gallery / Blog / FAQ.
2. **Home**: sección con cards a las 8 landings de estilo + bloque enlaces a landings de sujeto/ocasión.
3. **Footer**: columna "Gifts & Occasions" con las 9 landings de intención.
4. **Resolver `/order`**: quitar noindex + title/description EN reales ("Order Your Custom Cartoon Portrait — From $15, 48h"), o sacarlo del sitemap. Recomendado: indexar.
5. **Migrar rutas ES restantes**: `/precios→/pricing`, `/galeria→/gallery`, `/contacto→/contact`, `/seguimiento→/track-order`, con 301 + metadata EN (patrón ya probado con `/sobre→/about`).

### P1 — misma semana
6. Server-render de `/faq` (con FAQPage schema), `/gallery`, `/pricing`, `/styles` (index): contenido en HTML, no tras fetch cliente.
7. Actualizar `app/styles/layout.tsx` metadata a 8 estilos.
8. Reescribir los 6 posts ES en EN (targets: how to take the perfect photo for a portrait / our hand-drawn process / family portrait gift guide) con 301 desde slugs ES.
9. Crear `/how-it-works` (HowTo schema + fotos del proceso; refuerza no-AI).
10. Subir retratos reales before/after a galería y landings con alt pattern keyword; reemplazar OG de posts.
11. Actualizar `llms.txt`.

### P2 — siguientes sprints
12. Landings de ocasión: Mother's Day, Father's Day, Wedding.
13. Landings de estilo nuevas: Futurama, Bob's Burgers, American Dad, King of the Hill, Studio Ghibli style.
14. Sistema de reviews reales → AggregateRating legítimo en Product schema.
15. Landing transaccional `/cartoon-yourself`.
16. Página de productos físicos EN (`/products`: canvas, mug, t-shirt) reemplazando `/productos` ("próximamente").
17. Cadencia blog: 2-4 posts EN/mes long-tail (gift ideas por audiencia: boyfriend, dad, coworkers…).

## Páginas nuevas a crear

| URL propuesta | Keyword objetivo | Prioridad |
|---|---|---|
| `/how-it-works` | custom cartoon portrait process, how it works | P1 |
| `/pricing` (301 desde /precios) | custom cartoon portrait price | P0 |
| `/gallery` (301 desde /galeria) | cartoon portrait examples | P0 |
| `/gifts/mothers-day` | mother's day cartoon portrait gift | P2 |
| `/gifts/fathers-day` | father's day cartoon portrait gift | P2 |
| `/gifts/wedding` | wedding cartoon portrait, couple wedding gift | P2 |
| `/styles/futurama-style-portrait` | futurama style portrait | P2 |
| `/styles/bobs-burgers-style-portrait` | bobs burgers style portrait | P2 |
| `/styles/american-dad-style-portrait` | american dad style portrait | P2 |
| `/styles/king-of-the-hill-style-portrait` | king of the hill style portrait | P2 |
| `/styles/studio-ghibli-style-portrait` | ghibli style portrait from photo | P2 |
| `/cartoon-yourself` | cartoon yourself | P2 |
| `/products` (canvas/mug/tee) | custom cartoon portrait canvas | P2 |
| Blog: "how to take the perfect photo for a custom portrait" | photo requirements portrait | P1 |
| Blog: "50 personalized gift ideas for him/her" (serie) | personalized gift portrait long-tail | P2 |
