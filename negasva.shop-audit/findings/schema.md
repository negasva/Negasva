# Schema Markup Audit — negasva.shop

Cross-referenced from technical.md, geo.md, ecommerce.md, sxo.md (all independently fetched JSON-LD from the same pages) plus targeted verification.

## Score: 58/100

## What Works

- `OnlineStore` + `Product` + `AggregateOffer` (USD, InStock) present sitewide.
- Style detail pages (`/estilos/rick-y-morty`, etc.) carry a second, style-specific `Product` node with its own `AggregateOffer` and `url` pointing to `/order?style=*`.
- `FAQPage` JSON-LD on `/faq` covers all 10 Q&A pairs (delivery time, file formats, edits, family discount math, bad-photo policy, currencies, payment, commercial rights) — strong fact coverage.
- `BreadcrumbList` present on `/precios`, `/estilos`, and style detail pages.
- Style detail pages also carry their own `FAQPage` schema (style-specific questions, e.g. "¿Puedo salir con el portal verde de fondo?").

## Findings

**Critical**
- **Competing `Product` entities on the same page.** `/estilos/rick-y-morty` emits both the generic sitewide "Retrato Animado Personalizado" Product node AND a style-specific "Retrato Personalizado Rick & Morty" Product node. Google has no signal for which is canonical for rich results — likely to suppress both or pick the wrong one. **Fix:** remove the generic Product node from style detail pages; keep only the style-specific one.
- **Generic Product/Offer schema bleeds onto non-product pages** (`/`, `/precios`, `/estilos` index, `/order`). This is schema scope creep — a checkout page and a homepage are not products. **Fix:** scope the Product schema injection to actual product/style pages only.

**High**
- **No `Review`/`AggregateRating` schema** despite visible on-page testimonials (María González, Emma Thompson, Lucas Müller with "✓ Compra verificada" badges). This is exactly the kind of content `Review` schema is for — currently invisible to rich-result eligibility. Add:
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Retrato Personalizado Rick & Morty",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "1000"
  },
  "review": [
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "María González" },
      "reviewRating": { "@type": "Rating", "ratingValue": "5" },
      "reviewBody": "¡Mi retrato quedó increíble! La calidad es asombrosa."
    }
  ]
}
```
Only add this if the review count/rating is real and verifiable — fabricated `aggregateRating` values are a manual-action risk under Google's structured data guidelines.

- **No `WebSite` + `SearchAction` schema** on the homepage. Low effort, enables sitelinks search box eligibility:
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": "https://negasva.shop/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://negasva.shop/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```
(Only viable if an actual on-site search endpoint exists — otherwise skip rather than declare a fake one.)

- **Identical `lowPrice`/`highPrice` (20/160) hardcoded across all four style Product nodes**, despite each style page implying its own pricing variation. Reads as copy-pasted schema rather than per-style data. Fix by deriving these values from the same pricing source `/precios` uses.

**Medium**
- No `Service` type considered. This is a bespoke human-fulfilled service (48h turnaround, custom per-photo work), not a stocked or downloadable good. `Product` is being used as a pragmatic workaround for rich-result eligibility — defensible, but should be a deliberate choice, not the default Next.js/CMS template output. If `Service`+`Offer` is adopted instead, `Product` rich-result eligibility is lost, so weigh before changing.
- `BreadcrumbList` and `FAQPage` are absent from `/sobre`, `/contacto`, `/galeria` — low priority since these aren't primary entry pages, but cheap to add for consistency.
- No `Organization` schema with `sameAs` consolidating Instagram/TikTok — `sameAs` was found scattered in `Brand`/`OnlineStore` nodes per geo.md; consolidate into one `Organization` entity for clarity.

**Low**
- No `BlogPosting`/`Article` schema confirmed on the 6 blog posts — given the content-thinness issue flagged separately in content.md, fixing the underlying content gap matters more than adding schema to thin posts.

## Recommended Priority

1. Remove duplicate/competing Product nodes on style pages (Critical, low effort).
2. Scope Product/Offer schema off non-product pages (Critical, low-medium effort).
3. Add real `Review`/`AggregateRating` schema sourced from actual review data, not estimates (High, medium effort — needs real review count source).
4. Fix per-style pricing in schema to match actual variation (High, low effort).
5. Add `WebSite`+`SearchAction` only if a real search endpoint exists (Medium, low effort).
