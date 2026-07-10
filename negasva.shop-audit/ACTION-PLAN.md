# Action Plan — negasva.shop (2026-07-10)

Score actual: 83/100 (antes 62). Todos los ítems del plan anterior (canonicals, hreflang, schema duplicado, blog thin, llms.txt) están completados ✅.

## Phase 1: Critical Fixes (Week 1)

- [ ] **Fix `Product.image` malformada** en /styles/simpsons, /rick-and-morty, /gravity-falls, /fairly-oddparents: el template antepone `https://negasva.shop` a URLs que ya son absolutas (Supabase). Fix: `image.startsWith('http') ? image : SITE_URL + image`. Validar después en Rich Results Test.
- [ ] **Añadir `image`** a los 3 `Product` de `/products`.
- [ ] **Unificar precio de entrada** en todas las superficies: elegir un "from $X" único y aplicarlo en titles, metas, schema (`lowPrice`), llms.txt, barra sticky y tarjetas de pricing del home.

## Phase 2: High-Impact Improvements (Weeks 2-3)

- [ ] Traducir "✓ Compra verificada" → "Verified purchase" y revisar restos de ES en la UI.
- [ ] Reemplazar imágenes placeholder duplicadas en `/styles` (rm-3/4/6/10.webp reutilizadas entre estilos) con arte real de cada estilo.
- [ ] Añadir H1 a `/track-order`; mejorar title/meta de `/contact`.
- [ ] Acortar titles >70 chars (gift pages, /custom-pet-portrait, /order, /products, /cartoon-yourself) a ≤60.
- [ ] Implementar `aggregateRating`/`Review` schema **solo con reseñas reales verificables** (idealmente integrar un sistema de reviews con fuente comprobable).
- [ ] Consolidar los 2 bloques `FAQPage` de `/faq` en uno.

## Phase 3: Content & Authority (Month 2)

- [ ] E-E-A-T: página de autor con persona real (nombre, foto, bio, Behance) y usarla como `author` en `BlogPosting`.
- [ ] Añadir 2–4 enlaces externos autoritativos por post (citas, fuentes) y 4–8 enlaces internos contextuales hacia estilos/gift pages.
- [ ] Hacer verificables los testimonios (enlace a fuente, sistema de reviews) o sustituirlos por reseñas reales.
- [ ] Actualizar footer del home: `/privacidad`→`/privacy`, `/terminos`→`/terms`.
- [ ] Eliminar `meta keywords` de las plantillas.
- [ ] Añadir email de contacto a llms.txt; OG image a páginas legales; sobreescribir twitter:title/description en páginas internas.

## Phase 4: Monitoring & Iteration (Ongoing)

- [ ] Correr PageSpeed Insights (móvil) sobre home + 1 página de estilo para obtener CWV de campo cuando haya cuota/API key.
- [ ] Verificar en Search Console la indexación de las 53 URLs y el estado de rich results (Product, FAQ, HowTo) tras los fixes de Phase 1.
- [ ] `lastmod` del sitemap: emitir fechas reales de modificación por página.
- [ ] Evaluar locales ES/FR con hreflang (hay demanda visible en los testimonios).
- [ ] Re-audit en 4–6 semanas (baseline de drift: este informe).
