# Sitemap Audit — negasva.shop

URL: https://negasva.shop/sitemap.xml
Audited: 2026-06-23

## Validation Results

| Check | Result | Notes |
|---|---|---|
| XML structure | PASS | Well-formed, correct `urlset` namespace, no nesting errors |
| URL count | PASS | 23 URLs, far under 50,000 limit, no index needed |
| Trailing slash root | PASS | `https://negasva.shop/` consistent |
| priority tag | INFO | Present on all 23 URLs — ignored by Google since 2022, safe to remove (Sitemaps.org-valid, harmless, but signals legacy/templated generation) |
| changefreq tag | INFO | Present on all URLs — also ignored by Google, same as above |
| lastmod accuracy | **FAIL** | All 23 URLs share the exact identical timestamp `2026-06-22T23:52:09.932Z`, down to the millisecond, including blog posts that are presumably older evergreen content. This is a build/deploy-time stamp, not a true content-modification signal. |
| Non-200 / noindex / redirect URLs | NOT VERIFIED | Live HTTP status not checked in this pass (file was pre-fetched, not crawled) — recommend live crawl pass |
| robots.txt cross-reference | PASS w/ caveat | robots.txt disallows only `/admin` and `/api/`; none of the 23 sitemap URLs fall under these paths, so no robots conflict. However, `/order` is allowed by robots.txt but questionable to include in the sitemap regardless. |

## Key Finding 1: Uniform lastmod is a credibility red flag

Every single URL — homepage, pricing, 4 style pages, 6 blog posts, and legal pages — has the identical lastmod timestamp to the millisecond. This is almost certainly generated at build time (e.g., `new Date().toISOString()` baked into a static sitemap generator) rather than pulled from actual content/CMS modification dates.

Impact:
- Google's documentation explicitly states lastmod is only useful if it reflects genuine content changes; uniformly identical or implausibly fresh timestamps cause crawlers to **discount/distrust the signal entirely** for the whole sitemap, not just the offending URLs.
- Once Google flags a sitemap's lastmod as unreliable, it may deprioritize using lastmod for recrawl scheduling on this domain going forward — a self-inflicted wound since legitimate future content updates won't get faster recrawl treatment either.
- Static/evergreen pages (privacidad, terminos, cookies) showing "modified" at the same instant as a blog post is implausible on its face.

Fix: Derive lastmod per-URL from actual source: CMS `updatedAt` field for blog/style pages, file mtime or git last-commit date for static pages, and only bump it when content meaningfully changes — not on every deploy.

## Key Finding 2: /order (checkout flow) should not be in the sitemap

`/order` is indexed with priority 0.9 (second-highest in the sitemap, above all content pages). This is inappropriate for a transactional/checkout-flow page:

- Checkout/order pages typically carry session state, cart contents, or step-based flows (`/order?step=2`, personalization upload forms, etc.) — they are not meant to be entry points from organic search and provide no value as a search landing page.
- Indexing checkout pages risks: thin/duplicate-state pages being crawled mid-flow, leaking work-in-progress states to Google's index, and diluting crawl budget/link equity that should go to `/estilos/*`, `/precios`, and blog content.
- robots.txt currently only disallows `/admin` and `/api/` — `/order` is fully crawlable and indexable today. This is inconsistent with standard e-commerce SEO practice (checkout pages are normally `noindex` or disallowed, alongside `/cart`, `/account`, etc.).

Recommendation:
1. Add `Disallow: /order` to robots.txt (or apply `<meta name="robots" content="noindex">` to that route) unless `/order` is actually a marketing/landing page distinct from the transactional flow.
2. Remove `/order` from the sitemap regardless — sitemaps should only list canonical, indexable, search-worthy URLs.
3. If `/order` is in fact a pre-checkout informational page (e.g., "how ordering works" with no cart state), rename/clarify so its intent is unambiguous, and reconsider whether 0.9 priority is warranted even then (priority is ignored by Google but still misleads other crawlers/tools and signals confused IA).

## Completeness vs. Personalized-Portrait E-commerce Expectations

Site type: personalized/character-style portrait commissions (Rick y Morty, Simpsons, Gravity Falls, Padrinos Mágicos).

Present and appropriate:
- Homepage, /order, /estilos (+4 style detail pages), /precios, /galeria, /blog (+6 posts), /faq, /sobre, /contacto, /seguimiento, legal pages (privacidad, terminos, cookies)

Likely missing / worth checking against live site:
- Individual gallery/portfolio item pages (if `/galeria` is a single gallery without per-piece URLs, that's fine; if there are deep-linkable individual artwork pages, they should be in the sitemap)
- Testimonials/reviews page, if one exists separately from /galeria
- Additional style pages beyond the 4 listed, if more exist on the live site but weren't added to the sitemap generator
- A dedicated `/blog` pagination or category structure, if blog grows beyond the current 6 posts
- Image sitemap entries (`<image:image>`) for portrait/style pages — high-value for an image-heavy portrait business since Google Images can be a meaningful traffic channel for this niche

Only 4 style pages currently exist — well below the 30-location-page warning threshold, so the location-page quality gate does not apply here. No doorway-page risk at this URL count.

## Score: 70/100

Deductions:
- -15: Uniform lastmod across all URLs (undermines crawler trust in the entire sitemap's freshness signal)
- -10: Transactional `/order` page indexed at high priority with no robots/noindex protection
- -5: priority/changefreq present but inert (informational, not a real penalty, but indicates the generator hasn't been updated to current best practice)

Strengths: valid XML, well under URL limits, no robots.txt conflicts, core content (style/blog/pricing) well represented, no location-page doorway risk.
