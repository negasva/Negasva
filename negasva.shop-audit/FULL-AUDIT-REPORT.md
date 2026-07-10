# SEO Audit — negasva.shop

**Fecha:** 2026-07-10 · **Skill:** seo-audit v2.2.0 · **Páginas analizadas:** 53/53 (sitio completo) + tests de redirects y 404
**Audit anterior:** 2026-06-23 (score 62/100) — este informe incluye comparación de drift.

> Nota metodológica: el sandbox de scripts no estaba disponible (virtualización deshabilitada); el audit se ejecutó con crawl vía navegador real (extracción DOM/JSON-LD/headers en vivo). La API de PageSpeed agotó su cuota anónima, por lo que Performance se midió con la Performance API del navegador (sin datos de campo CrUX).

---

## Executive Summary

### 🎯 SEO Health Score: **83 / 100** (antes: 62 — **+21 puntos**)

**Tipo de negocio detectado:** E-commerce (servicio de producto personalizado — retratos cartoon dibujados a mano, digital + print-on-demand; sitio EN, mercado US/global; Next.js/Vercel, Supabase, Stripe/PayPal)

| Categoría | Peso | Score |
|---|---|---|
| Technical SEO | 22% | 92 |
| Content Quality | 23% | 78 |
| On-Page SEO | 20% | 85 |
| Schema / Structured Data | 10% | 70 |
| Performance (CWV) | 10% | 85 |
| AI Search Readiness | 10% | 85 |
| Images | 5% | 80 |

### Drift vs audit 2026-06-23 — problemas RESUELTOS ✅

Los 5 críticos del audit anterior están corregidos y verificados en vivo: canonicals ahora autorreferentes en las 53 páginas; hreflang roto eliminado (0 tags); URLs migradas de ES a EN con 301 correctos; `llms.txt` implementado; FAQs renderizadas en el DOM; blog reescrito con posts de 1.700–2.500 palabras (antes ~89); sitio traducido íntegramente a inglés con estrategia coherente. Trabajo excelente.

### Top 5 issues actuales (críticos/altos)

1. **[High] `Product.image` malformada en 4 páginas de estilo** (simpsons, rick-and-morty, gravity-falls, fairly-oddparents): `"image":"https://negasva.shophttps://rohzujxjomqxrhvpoxvg.supabase.co/..."` — el dominio se concatena delante de URLs que ya son absolutas (Supabase). Las 9 páginas de estilo con imágenes relativas quedan bien. Invalida rich results de Product en 4 páginas clave.
2. **[High] Sin `aggregateRating`/`Review` schema** pese a mostrar 16+ testimonios 5★ y "+1000 clientes" — se pierden estrellas en SERP (usar solo reseñas reales y verificables).
3. **[Medium] E-E-A-T débil en blog:** autor genérico `Person "Negasva"` sin nombre real ni credenciales; 0 enlaces externos/citas en los posts.
4. **[Medium] Precio de entrada inconsistente:** "from $15" (titles/meta/schema/llms.txt) vs "from $20" (barra sticky del home) vs "$25" (tarjeta de pricing del home). Confunde a usuarios y a los LLMs que citan el sitio.
5. **[Medium] Imágenes placeholder duplicadas entre estilos en `/styles`** (rm-4.webp para Disney-Pixar y Futurama; rm-6 para Family Guy y Bob's Burgers; rm-3 y rm-10 también repetidas) — el catálogo principal muestra el mismo arte para estilos distintos.

### Top 5 quick wins

1. Corregir la concatenación de dominio en `Product.image` (comprobar si la URL ya es absoluta antes de prefijar) — ~1 línea, arregla 4 páginas.
2. Traducir "✓ Compra verificada" → "Verified purchase" (aparece en español en el sitio EN) y unificar el precio de entrada.
3. Añadir H1 a `/track-order` (única página sin H1) y mejorar title de `/contact` (17 chars).
4. Añadir `image` a los 3 Product de `/products` (mug, t-shirt, etc.).
5. Actualizar los enlaces del footer del home que aún apuntan a `/privacidad`/`/terminos` (evitar saltos 301).

---

## Technical SEO — 92/100

**Lo que funciona:**
- `robots.txt` correcto (bloquea `/admin`, `/api/`; referencia sitemap; sin bloqueos a crawlers de IA).
- Sitemap XML válido: 53 URLs, todas 200, todas indexables, sin huérfanas relevantes.
- Canonicals autorreferentes en el 100% de páginas; `meta robots: index, follow` en todo.
- 301 limpios desde URLs legacy en español (`/privacidad`→`/privacy`, `/terminos`→`/terms`).
- 404 real (status 404 + página propia con title y H1).
- Security headers fuertes: CSP completa, HSTS, `nosniff`, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy.
- SSR completo — todo el contenido visible sin JavaScript.

**Hallazgos:**
- [Low] Footer del home aún enlaza a `/privacidad`/`/terminos` (pasan por 301).
- [Low] `lastmod` casi uniforme (2026-07-05 en 40 URLs) — generado en build; no refleja cambios reales.
- [Info] Sin hreflang — correcto siendo EN-only, pero los testimonios ES/FR sugieren demanda multi-idioma (oportunidad futura de locales ES/FR con hreflang).

## Content Quality — 78/100

**Lo que funciona:**
- Profundidad sólida: páginas de estilo 2.700–3.000 palabras; gift pages ~1.700–1.800; blog 1.700–2.500. Sin thin content salvo transaccionales (esperado).
- Arquitectura madura: 13 landings de estilo + 12 landings de ocasión + 13 posts con clúster claro (gift ideas, comparativas, guías) y hub `/blog`.
- Posts comparativos que citan competidores por nombre (Turned Yellow, Etsy, Fiverr) — muy citables por LLMs.
- Diferenciador "hand-drawn, no AI" consistente, con landing dedicada.

**Hallazgos:**
- [Medium] E-E-A-T: autor del blog sin persona real (Person "Negasva", jobTitle "Illustrator & Founder", sin nombre); 0 enlaces salientes en los posts. Crear página de autor con persona, foto y bio; citar fuentes externas.
- [Medium] Testimonios con señales de plantilla ("✓ Compra verificada" en español, nombres genéricos multi-país, sin enlace a fuente verificable). Si son reales, hacerlos verificables; si no, riesgo de confianza y de compliance.
- [Medium] Precio de entrada inconsistente entre superficies ($15/$20/$25).
- [Low] Enlazado interno contextual escaso dentro del cuerpo de los posts (4 enlaces en el post analizado, mayoría CTA).

## On-Page SEO — 85/100

**Lo que funciona:**
- 1 H1 único por página (52/53), jerarquía H2 limpia, breadcrumbs visibles + `BreadcrumbList`.
- Titles y meta descriptions únicos en las 53 páginas, con USPs (48h, no AI, precio).
- Alt text descriptivo en el 100% de imágenes del home (0/33 sin alt).

**Hallazgos:**
- [Medium] `/track-order` sin H1.
- [Low] Titles >70 chars (se truncan): /order (73), /cartoon-yourself (74), /products (73), gift pages (69–85), /custom-pet-portrait (85).
- [Low] `/contact`: title de 17 chars y meta de 112 — desaprovechados.
- [Low] `meta keywords` presente en varias plantillas — obsoleto; eliminar.

## Schema / Structured Data — 70/100

**Lo que funciona (cobertura muy amplia):**
`OnlineStore` global · `Product + AggregateOffer` en 13 estilos, 12 gift pages y /cartoon-yourself · `FAQPage` en estilos, gift pages y /faq · `HowTo` en estilos y /how-it-works · `BreadcrumbList` generalizado · `BlogPosting` completo (author, datePublished, dateModified, image) · `ImageGallery` en /gallery · `ProfilePage` en /about. Los nodos duplicados/competing del audit anterior están resueltos.

**Hallazgos:**
- **[High] `Product.image` malformada en 4 páginas de estilo** (bug de concatenación con URLs absolutas de Supabase). Verificado: afecta a simpsons, rick-and-morty, gravity-falls, fairly-oddparents; las 9 restantes OK.
- [Medium] Sin `aggregateRating`/`Review` en ningún Product.
- [Medium] Los 3 `Product` de `/products` sin `image`.
- [Low] `FAQPage` duplicado (2 bloques) en `/faq` — consolidar.

## Performance — 85/100 (lab, sin datos de campo)

- TTFB **77 ms** · DOMContentLoaded **371 ms** · Load **660 ms** (navegador real).
- Peso decodificado ~700 KB (JS 422 KB, CSS 176 KB) — razonable para Next.js.
- 27/33 imágenes lazy, servidas vía `next/image` (WebP/resize). CLS observado: 0.00.
- [Info] PSI/CrUX no disponible por cuota — correr PageSpeed Insights manualmente para confirmar LCP móvil de campo (las hero vienen de Supabase; revisar `sizes`, se piden a `w=3840`).

## AI Search Readiness (GEO) — 85/100

**Lo que funciona:**
- `llms.txt` presente y bien estructurado (qué es, páginas clave, estilos, facts, contacto).
- Acceso total para GPTBot/ClaudeBot/PerplexityBot (robots.txt no restringe).
- FAQs en DOM, contenido comparativo con entidades competidoras, hechos y precios concretos.

**Hallazgos:**
- [Medium] 0 citas externas en el contenido — debilita señales de autoridad para motores generativos.
- [Low] llms.txt dice "from $15" mientras la UI muestra $20/$25 — los LLMs citarán datos contradictorios.
- [Low] llms.txt solo lista Instagram como contacto (añadir email).

## Images — 80/100

- Alt text: 100% cobertura, descriptivo y keyword-rich.
- [Medium] Placeholders duplicados entre estilos distintos en `/styles` (detallado arriba) — reemplazar con arte real por estilo.
- [Low] OG image ausente en páginas legales; `twitter:title/description` heredan los del home en varias páginas internas (metadata parcialmente sin sobreescribir).

---

## Verificación

Hallazgos críticos verificados en vivo el 2026-07-10: bug de `Product.image` confirmado en las 4 páginas afectadas y descartado en las otras 9; redirects legacy confirmados; 404 con status real; headers leídos de la respuesta HTTP; 53/53 URLs del sitemap con status 200; el fix de canonicals/hreflang del audit anterior re-verificado en las 53 páginas.
