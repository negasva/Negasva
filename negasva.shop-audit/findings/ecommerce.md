# E-commerce SEO Audit — negasva.shop
Data source: On-page analysis (static, mode=auto, all pages served raw HTML, is_spa=false)
Pages fetched: /, /precios, /estilos, /estilos/rick-y-morty, /order

## Scores
- Schema completeness: 70/100
- Pricing transparency: 80/100
- Category/detail page architecture: 65/100
- Canonicalization / duplicate-content risk: 45/100
- Overall e-commerce SEO: 64/100

## 1. Product Schema (service-as-product model)

Every page carries a sitewide `OnlineStore` node plus a generic `Product` node
("Retrato Animado Personalizado") with an `AggregateOffer`
(priceCurrency USD, lowPrice 20, highPrice 160, availability InStock). This is
present even on `/`, `/precios`, `/estilos`, `/order` — pages that are not
product pages. Style detail pages (`/estilos/rick-y-morty`) additionally emit
a second, more specific `Product` node ("Retrato Personalizado Rick & Morty")
with its own `AggregateOffer` (`url: /order?style=rick-morty`).

**Issues (High):**
- Duplicate/competing `Product` entities on the same page (generic + style-specific
  on `/estilos/rick-y-morty`) confuses which entity Google should treat as
  primary for rich results.
- The sitewide generic Product schema appearing on non-product pages
  (home, precios, estilos index, order) is schema bloat — Google may ignore
  it or, worse, associate the wrong page as the product's canonical URL.
- `AggregateOffer` is appropriate given this is a configurable service (style x
  size x add-ons), but no per-style fixed price is declared — `lowPrice`/`highPrice`
  are identical (20/160) across all four styles, despite copy implying
  uniform base pricing. This signals the schema was copy-pasted, not
  generated per style.
- Missing recommended fields: `aggregateRating`/`review` (testimonials exist
  on-page but aren't marked up as `Review`), `sku`/`mpn` equivalent (not
  required for services but helps disambiguate variants), `priceValidUntil`.
- No `Service` type considered — given this is explicitly a custom digital
  service fulfilled by a human/process (not a downloadable good), Google's
  guidance increasingly favors `Service` + `Offer` for bespoke work; `Product`
  is being used as a practical workaround for rich-result eligibility, which
  is reasonable but should be a deliberate choice, not default.

BreadcrumbList is correctly present on /precios, /estilos, and the style
detail page — good. It is absent on `/` (expected) and absent on `/order`
(acceptable, since order is a checkout flow, not content).

FAQPage schema is present on the Rick & Morty style page — good for that
page's snippet eligibility; not verified whether replicated identically
across other style pages (would risk duplicate FAQ markup if copy-pasted
verbatim).

## 2. Google Shopping Feasibility — Not Applicable (by design)

This is a bespoke digital service sold via Stripe checkout, not physical or
downloadable inventory with stable SKUs/GTINs. Standard Google Shopping
(Merchant Center product feed) requires GTIN/MPN or an exemption, fixed
pricing, and shippable/deliverable goods tracking — none of which fit cleanly
here. **Recommendation: do not pursue Shopping ads/free listings.** The
`Product` + `AggregateOffer` schema already in place is the correct ceiling
of structured-data ambition for this business model (Product rich snippet
in organic search), not a path to Shopping surfaces. No action needed beyond
fixing the schema issues above.

## 3. Pricing Transparency (/precios)

Strong: base prices are server-rendered in static HTML (no JS required to
see them) — `$25` (torso), `$29.99` (full body), `+$15` (custom background),
plus worked examples up to `$116.97` for a 4-person family scene. This is
good for both SEO snippets (price can appear in meta description, which it
does: "desde $20 USD") and for conversion (transparent, scannable).

**Gap (Medium):** All prices are rendered in USD only in the static HTML.
The `negasva-geo-currency=COP` cookie and `api.exchangerate-api.com` call
(visible in CSP `connect-src`) indicate currency conversion happens
**client-side after hydration**. A Colombian searcher's snippet/cached HTML
will show USD, while the rendered page later shows COP — a price-display
mismatch between what's indexed and what's seen, which can hurt trust/CTR
even though it isn't a Google Shopping price-accuracy violation (no Shopping
feed exists). Consider server-rendering the geo-detected currency for the
initial paint, with USD as a JSON-LD-declared fallback.

## 4. Style Pages as Category vs. Detail Pages

`/estilos` functions correctly as a **category/listing page**: four style
cards, each with a short description, 3 bullet "characteristics," and two
CTAs ("Ver estilo" / "Crear con este estilo"). This is good category-page
structure and a sensible internal-linking hub.

`/estilos/rick-y-morty` functions correctly as a **detail page**: longer
unique description, dedicated title/meta, breadcrumb, FAQ schema, and a
style-specific Product/Offer node. This is the right category-to-detail
pattern for SEO (broad/short content on the hub, deep/unique content on
each style).

**Gap (Low-Medium):** The detail page's Offer still points conversion to
`/order?style=rick-morty` rather than completing checkout in-page or via a
self-contained PDP add-to-cart equivalent — acceptable for a Stripe-based
flow, but the query-string-based variant (see Section 5) needs canonical
hygiene.

## 5. Order Flow / Currency-Geo Canonicalization Risk (Critical)

- `/order?style=rick-morty` (and presumably `?style=simpsons`,
  `?style=gravity-falls`, `?style=padrinos-magicos`) is **crawlable and
  indexable**: `<meta name="robots" content="index, follow">` is present,
  and these URLs are linked from style detail pages with no `rel=nofollow`.
- However, `/order`'s `<link rel="canonical">` points to
  `https://negasva.shop` (the **homepage**), not to `/order` itself, and the
  page reuses the homepage's `<title>` and meta description verbatim. The
  `?style=` query-string variants don't appear to set a self-referencing or
  parameter-stripped canonical either.
- Net effect: Google may index multiple `/order?style=*` URLs with
  homepage-duplicate titles/descriptions and a canonical signal pointing away
  from themselves — a classic duplicate-content/canonicalization conflict.
  This dilutes the configurator page's relevance and risks Google choosing
  an unintended canonical or flagging title/meta duplication across the
  homepage and all order variants.
- No currency-based URL variants were found server-side (no `?currency=COP`
  paths, no hreflang alternates) — currency is cookie + client-JS only, so
  currency itself does not create duplicate URLs. The real canonicalization
  risk is the **style query parameter on /order**, not currency.

**Recommended fix (Critical/High):**
1. Either `noindex` the `/order` configurator and all `?style=` variants
   (recommended — it's a checkout/lead-capture flow, not content meant to
   rank), or
2. If indexing is desired, give `/order` and each `?style=` variant a
   self-referencing canonical and unique title/meta (or canonicalize all
   `?style=*` variants to the bare `/order`), and stop reusing the homepage's
   title/description.

## Priority Summary

| Priority | Issue | Impact |
|---|---|---|
| Critical | `/order` canonical points to homepage; `?style=` variants indexable with duplicate title/meta | Duplicate content, diluted relevance, wrong page may rank |
| High | Duplicate/competing Product schema nodes (generic sitewide + style-specific) on same page | Confuses rich-result entity selection |
| High | Generic Product schema injected on non-product pages (home, precios, estilos, order) | Schema bloat, wrong canonical product URL signal |
| Medium | Prices render USD-only server-side; COP conversion is client-side post-hydration | Snippet/price mismatch for LatAm searchers, trust/CTR risk |
| Medium | Identical lowPrice/highPrice (20/160) across all four style Product nodes | Schema appears templated rather than style-accurate |
| Low | FAQPage schema verified only on one style page; confirm uniqueness across others | Potential duplicate FAQ markup if copy-pasted |
| N/A | Google Shopping | Not feasible for bespoke digital service — no action needed, current Product+Offer approach is correct ceiling |
