# SEO AUDIT — negasva.shop (2026-07-05)

Modo: solo auditoría. Nada tocado salvo este archivo.

## Score /100

| Área | Score | Veredicto |
|---|---|---|
| Técnico | 55 | Base buena (sitemap.ts, robots.ts, JSON-LD, generateMetadata) pero idioma y schema con riesgos graves |
| On-page | 30 | TODO el HTML indexable está en español; keywords semilla EN ausentes |
| Contenido | 25 | Blog de 6 posts en español; cero cobertura de keywords EN objetivo |
| Arquitectura | 35 | Landing-por-estilo existe (4 páginas) pero faltan ~20 páginas de intención vs competidores |
| **GLOBAL** | **36** | El problema #1 no es técnico: el sitio compite en un mercado EN con un sitio ES |

## Hallazgo raíz (lo que domina todo)

El sitio entero es indexable **en español**: `<html lang="es">`, `og:locale es_CO`, títulos/descriptions ES, slugs ES (`/estilos/`, `/galeria/`, `/sobre`, `/precios`, `/seguimiento`, `/rick-y-morty`, `/padrinos-magicos`). El i18n (en/es/fr) es 100% client-side (`LanguageContext` + `useAutoTranslate`) → **Google nunca ve el inglés**. Ninguna keyword semilla ("custom cartoon portrait", "turn photo into cartoon"…) aparece en HTML servido. Todo lo demás es secundario hasta arreglar esto.

## Tabla de hallazgos

| Archivo/Ruta | Problema | Impacto | Fix propuesto | Keyword afectada |
|---|---|---|---|---|
| `app/layout.tsx:112` | `<html lang="es">`, todo metadata ES, `og:locale es_CO` | ALTO | Migrar HTML servido a EN (`lang="en"`, locale `en_US`), metadata EN | todas las semilla |
| `app/**` (rutas) | Slugs en español: `/estilos/`, `/galeria/`, `/sobre`, `/precios`, `/faq`, `/seguimiento`, `/contacto` | ALTO | Rutas EN (`/styles/`, `/gallery/`, `/about`, `/pricing`) con 301 desde las ES | custom cartoon portrait |
| `lib/i18n/*` | Traducción client-side; sin hreflang, sin `alternates.languages` en ningún layout | ALTO | Rutas por locale (`/en`, `/es`) o EN-only + hreflang cuando haya ES real server-rendered | todas |
| `app/estilos/[slug]/page.tsx:53-71` | AggregateRating 4.8/1200 + Review de "Cliente Verificado" hardcodeados e inventados, `datePublished` = hoy en cada build | ALTO | Quitar rating/review fake o conectar reviews reales; riesgo de acción manual por schema engañoso | simpsons style portrait (rich results) |
| `lib/content/styles.ts` | Solo 4 estilos: rick-y-morty, simpsons, gravity-falls, padrinos-magicos. Falta Family Guy y más | ALTO | Añadir landings: family-guy-style, south-park-style, anime, disney/pixar, bojack, adventure-time | family guy style portrait |
| `lib/content/styles.ts` (slugs) | Slugs no matchean keyword EN: `rick-y-morty` vs búsqueda "rick and morty custom portrait" | ALTO | Slugs EN: `/styles/rick-and-morty-style-portrait`, `/styles/simpsons-style-portrait` | rick and morty custom portrait |
| `lib/content/blogPosts.ts` | 6 posts, todos ES ("ideas-para-regalar-un-retrato-animado"), cero keywords EN | ALTO | Blog EN nuevo apuntando a keywords semilla y long-tail (ver backlog) | turn photo into cartoon |
| `app/page.tsx:1` | Home entera `'use client'` + framer-motion + config vía fetch a `/api/landing-config`; H1/hero traducidos en cliente | ALTO | Server component con contenido EN estático; islas cliente solo para lo interactivo | custom cartoon portrait |
| `app/page.tsx:258,309…` | Alt text ES: "Foto original (antes)", "Ejemplo de retrato" | MEDIO | Alts EN descriptivos: "custom Simpsons style couple portrait hand drawn from photo" | image SEO todas |
| `app/layout.tsx:35,102` / `estilos/[slug]:76` | Precio "$20" en title/schema; negocio dice entrada $15 (líder $25-56) | MEDIO | Unificar a $15 y explotarlo en titles ("from $15") — es la ventaja competitiva | custom cartoon portrait cheap |
| `app/layout.tsx:64` | OG image `/backgrounds/rm-1.jpg` (arte de marca ajena) | MEDIO | OG propio: before/after de retrato real 1200×630 | — |
| `app/estilos/[slug]/page.tsx` | Sin schema HowTo pese a tener sección "proceso"; sin `twitter` card en generateMetadata | BAJO | Añadir HowTo + twitter card | how to turn photo into cartoon |
| `app/blog/[slug]/page.tsx` | generateMetadata existe ✓ pero contenido/keywords ES | ALTO | Reescribir/crear posts EN | ver backlog |
| `app/sitemap.ts` | `lastModified: new Date()` en todo (falso "todo cambió hoy") | BAJO | Fechas reales por contenido | — |
| `app/layout.tsx:132` | Script ahrefs con API key hardcodeada en el repo | BAJO | Mover a env var; async ya está bien | — |
| Global | Diferenciadores no explotados en ningún title/H1: 48h total (vs preview 2-3 días), 100% hand-drawn no-AI, artista visible | ALTO | Mensajes en titles/H1: "Hand-Drawn (No AI) • Delivered in 48h • From $15" | hand drawn portrait from photo |
| `app/sobre/` | Página artista existe (bien E-E-A-T) pero en ES y sin schema Person | MEDIO | Versión EN + schema Person/`author`, foto y credenciales | (E-E-A-T) |
| Global | Nombres de marcas (Simpsons, Rick and Morty) usados directo en slugs/schema Product | MEDIO | Patrón competidor: "simpsons **style**" / "yellow cartoon style" en todo texto comercial; nunca "official" | — |
| `app/estilos/page.tsx` + home | Internal linking home↔estilos↔blog↔order existe ✓ (relatedStyleSlugs, "otros estilos") | — | Mantener; extender a nuevas páginas de intención | — |

## Competitivo — quién captura cada gap

| Gap nuestro | Competidor que ya lo hace | Keyword que captura |
|---|---|---|
| Landing Family Guy | cartoonely (landing por estilo) | family guy style portrait |
| Landing "turn yourself into a cartoon" genérica | turnedyellow (home + blog) | cartoon yourself, turn photo into cartoon |
| Página proceso/how-it-works EN | turnedyellow | how it works custom portrait |
| Páginas por sujeto (couple/family/pet) | itoonify, petportraits.com (EMD pet) | custom couple portrait, custom pet portrait |
| Páginas por ocasión (christmas/anniversary/valentines) | turnedyellow blog + Etsy sellers | cartoon portrait christmas gift |
| Comparadores "best X sites" | portraitflip (rankea "best custom pet portrait companies") | best custom cartoon portrait sites |
| "turned yellow alternatives" | nadie fuerte → oportunidad | turned yellow alternatives |
| Blog EN masivo | turnedyellow (blog enorme) | long-tail toda |
| Reviews reales visibles | customartcapital, turnedyellow (Trustpilot) | (conversión + rich results) |

## Backlog priorizado

### P0 — sin esto no hay SEO
1. Sitio servido en inglés: `lang="en"`, metadata EN en `app/layout.tsx` y todos los layouts, home server-rendered EN.
2. Rutas EN con 301 desde ES: `/styles/[slug]`, `/gallery`, `/about`, `/pricing`, `/how-it-works`.
3. Slugs de estilo = keyword: `simpsons-style-portrait`, `rick-and-morty-style-portrait`, etc. Contenido de `lib/content/styles.ts` reescrito EN keyword-first.
4. Eliminar AggregateRating/Review inventados del Product schema (riesgo de penalización).
5. Titles/H1 con los 3 diferenciadores: "From $15 • Hand-Drawn, No AI • 48h Delivery".

### P1 — capturar demanda
6. Nuevas landings de estilo: family-guy-style-portrait, south-park, anime, disney-pixar (modelo cartoonely: 1 landing = 1 keyword).
7. Landings por sujeto: /custom-couple-portrait, /custom-family-portrait, /custom-pet-portrait, /memorial-portrait.
8. Landings por ocasión: /cartoon-portrait-gifts/christmas, /anniversary, /valentines-day, /birthday.
9. Blog EN inicial (5 posts): "How to Turn a Photo into a Cartoon (2026)", "Best Custom Cartoon Portrait Sites Compared", "Turned Yellow Alternatives", "Simpsons vs Rick and Morty Style: Which to Pick", "Gift Ideas: Custom Portraits".
10. Página /about-the-artist EN con schema Person + reviews reales (Trustpilot/Etsy embed) → E-E-A-T.
11. Alt text EN descriptivo en todos los retratos (galería incluida) — image SEO.

### P2 — pulir
12. OG image propia before/after; twitter cards en generateMetadata de estilos.
13. HowTo schema en /how-it-works y páginas de estilo.
14. lastModified reales en sitemap; ahrefs key a env var.
15. hreflang en cuanto exista ES server-rendered (mercado LATAM secundario).
16. Reducir JS de home (quitar framer-motion del above-the-fold, hero estático con `priority`).

## Páginas nuevas — keyword → URL

| Keyword objetivo | URL propuesta |
|---|---|
| custom cartoon portrait | / (home EN) |
| simpsons style portrait / turn yellow | /styles/simpsons-style-portrait |
| rick and morty custom portrait | /styles/rick-and-morty-style-portrait |
| family guy style portrait | /styles/family-guy-style-portrait |
| south park style portrait | /styles/south-park-style-portrait |
| anime portrait from photo | /styles/anime-style-portrait |
| custom couple portrait | /custom-couple-portrait |
| custom family portrait | /custom-family-portrait |
| custom pet portrait cartoon | /custom-pet-portrait |
| memorial portrait from photo | /memorial-portrait |
| cartoon portrait christmas gift | /gifts/christmas |
| anniversary portrait gift | /gifts/anniversary |
| valentines day custom portrait | /gifts/valentines-day |
| turn photo into cartoon | /blog/turn-photo-into-cartoon |
| best custom cartoon portrait sites | /blog/best-custom-cartoon-portrait-sites |
| turned yellow alternatives | /blog/turned-yellow-alternatives |
| cartoon yourself | /blog/cartoon-yourself-guide |
| hand drawn portrait from photo (no AI) | /hand-drawn-no-ai |
| how it works / how to order | /how-it-works |
