# Content Quality / E-E-A-T Audit — negasva.shop

Cross-referenced from a partial direct-fetch pass plus corroborating data points surfaced independently by the technical, geo, and sxo audits on the same pages.

## Score: 55/100

## Findings

**Critical**
- **Blog posts are severely thin.** `/blog/rick-y-morty-vs-simpsons-que-estilo-elegir` renders only ~89 words of body text even with full JS rendering — for a "which style should I choose" comparison post, this is far below the 1,000+ words needed to actually answer the implied question or rank for comparison-intent queries. This is a real content gap, not a rendering artifact: by contrast, `/estilos/rick-y-morty` (a product page, not a blog post) independently measured at 538 words — proving the site's templating CAN render substantial content; the blog specifically is underbuilt. Treat all 6 blog posts as suspect until individually confirmed at a healthy word count.
- **Thin/templated content elevates duplicate-content risk across the 4 style pages** (`/estilos/rick-y-morty`, `/simpsons`, `/gravity-falls`, `/padrinos-magicos`). The ecommerce and schema audits both independently found identical pricing (`lowPrice`/`highPrice` 20/160) hardcoded across all four styles' schema, suggesting the underlying page template — and likely body copy — is also closer to a copy-paste-and-swap-the-name pattern than genuinely differentiated content. Style pages should differentiate on more than the character name (e.g., distinct example images, distinct FAQ answers, distinct "what makes this style unique" prose).

**High**
- **Trademark/IP exposure in core SEO strategy.** The site's primary keyword targets and even URL slugs are built on third-party copyrighted/trademarked character names ("Rick y Morty", "Los Simpsons", "Gravity Falls", implicitly "Fairly OddParents" via "Padrinos Mágicos"). This isn't strictly an SEO defect, but it's a content-strategy risk worth flagging: rights holders periodically issue takedowns or cease-and-desist against fan-art/merch sellers using character names as primary commercial keywords, which can mean sudden loss of the exact pages driving most organic traffic. Consider whether style names are framed clearly as "inspired by" / parody/fan-art use, and whether a non-trademarked descriptive fallback (e.g., "estilo animación retro sci-fi" alongside "Rick y Morty") would hedge this risk without sacrificing search volume.
- **E-E-A-T: no visible author bylines or publish/update dates found on blog posts** (not deeply verified this pass — flagged for follow-up). For a niche creative-services site, an "about the artist/team" narrative with a real name, photo, and process detail builds more trust than generic copy — worth checking whether `/sobre` does this or stays generic-brand-voice.
- **Testimonials are not independently verifiable**: María González, Emma Thompson, Lucas Müller testimonials are presented as plain HTML (per schema.md, no `Review` markup either) — there's no review-platform link-out (Trustpilot, Google Reviews) to substantiate the "1000+ clientes felices" claim. Mixing Spanish and English testimonials on a Spanish-only site is a minor consistency oddity worth a styling/translation pass, though it may be intentional to signal international reach.

**Medium**
- **AI-citation readiness is strong on facts, weak on narrative.** Per the GEO audit, pricing and 48h turnaround are stated clearly and repeatedly in both prose and schema — good. But `/estilos` and `/precios` are card/list-based rather than prose-based, so they under-perform for conversational "how much does X cost" or "what does a Rick and Morty portrait look like" queries that reward self-contained answer paragraphs.
- **Blog topic coverage is uneven**: per the cluster analysis, 2 of 4 product styles (Gravity Falls, Padrinos Mágicos) have zero supporting blog content, and there's no gift-occasion content (birthdays, anniversaries) despite the business being gift-driven.

## Recommendations (Priority Order)

1. Expand all 6 blog posts to genuinely useful length (800–1500 words) with real comparison substance — start with the Rick y Morty vs Simpsons post since it's confirmed thinnest and highest-intent (direct comparison searches).
2. Differentiate style-page copy beyond name-swapping: unique example callouts, unique FAQ content per style, accurate per-style pricing if it actually varies.
3. Add a real "about" narrative on `/sobre` with author/artist identity if one exists — this is cheap E-E-A-T leverage for a small creative-services brand.
4. Decide deliberately on trademark-name risk exposure; this is a business decision, not just an SEO one, but should be made with eyes open rather than by default.
5. Link testimonials to a verifiable review platform if "1000+ clientes felices" is real — this also unlocks the `Review`/`AggregateRating` schema flagged in schema.md.
