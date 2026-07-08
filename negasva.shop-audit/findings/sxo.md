# SXO Analysis — negasva.shop

## Pages Audited
- Homepage `https://negasva.shop/` (Landing Page type — hero, social proof badges, 5-step process, pricing H2, testimonials, OnlineStore+Product schema)
- `https://negasva.shop/estilos/rick-y-morty` (Hybrid Product/Landing — H1 "Retrato personalizado estilo Rick & Morty", Product+AggregateOffer+FAQPage+BreadcrumbList schema, price range $20-$160, CTAs "Pedir mi retrato", FAQ, related-styles cross-links, word count 538)

## Target Keywords & SERP Consensus

### 1. "retrato personalizado caricatura"
**SERP dominant type:** Hybrid Service/Product (artisan studios: Retratoon, Albertoarias, Artemania) + Etsy listings + AI tool pages (Cyberlink). Confidence ~55% Service/Product, 25% Etsy marketplace, 20% AI tool.
**User stories:**
- As a gift-buyer, I want to see real example portraits and pricing immediately, because I'm deciding fast before an event, but I'm blocked by not knowing the price upfront. *(Signal: Amazon/Etsy listings show price+image in snippet)*
- As a skeptical first-timer, I want proof other people received good results, because custom art from photos feels risky, but I'm blocked by lack of reviews on-page. *(Signal: Etsy "compra verificada" review counts ranking)*
**negasva.shop fit:** Homepage matches reasonably (testimonials, pricing H2, 1000+ customers). No single style page targets this generic keyword — it's a homepage-level query, not a /estilos page.

### 2. "regalo personalizado rick y morty"
**SERP dominant type:** Etsy marketplace listings (70%) + Pinterest/TikTok inspiration content (20%) + direct competitor product pages like donutamarillo.com, yellowme.fun, mortyme.fun (10%, but most directly comparable).
**User stories:**
- As a gift-shopper for a Rick & Morty fan, I want to pick a format (poster, mug, digital) and see delivery time, because the gift has a deadline, but I'm blocked by unclear shipping/digital options framing. *(Signal: Etsy/Amazon listings emphasize "envío", multiple product formats)*
- As a price-comparer, I want to see exactly what's included for $20-160, because I'm comparing 3-4 similar sellers, but I'm blocked by vague "what's included" language. *(Signal: competitor sites donutamarillo/yellowme/mortyme all lead with price + format tiers)*
**negasva.shop fit:** `/estilos/rick-y-morty` is the closest competitive analog to donutamarillo/mortyme — it already has price range, FAQ, "what's included" H2. Gap: digital-only delivery isn't framed as a gift-occasion solution (no "perfect for birthdays/anniversaries" framing that competitors use).

### 3. "convertir foto en caricatura simpsons"
**SERP dominant type:** Tool/Interactive — AI generators (EaseMate, OpenArt, Pollo AI, Komiko, ToonMe) dominate 7 of 10 results. Confidence ~70% Tool type.
**User stories:**
- As an instant-gratification user, I want to upload a photo and see a result in seconds for free, because I just want to try it for fun, but I'm blocked by any page requiring payment/order forms before seeing output. *(Signal: 7/10 results are free instant AI tools, "gratis" repeated in titles)*
- As a quality-conscious buyer, I want hand-drawn quality vs. generic AI filter, because I want a real gift not a filter selfie, but I'm blocked by not knowing negasva is hand-drawn until deep in the page. *(Signal: hand-drawn differentiation absent from AI-tool competitors)*
**negasva.shop fit:** CRITICAL MISMATCH. `/estilos/simpsons` (same template as rick-y-morty) is a paid, 48h-turnaround hand-drawn product page competing against instant, free, zero-friction AI tools. The intent behind this exact keyword phrase ("convertir foto en") is overwhelmingly tool-seeking, not commerce-seeking.

## Page-Type Mismatch — PRIMARY FINDING
**Severity: HIGH for "convertir foto en X" keywords; ALIGNED for "regalo personalizado [estilo]" keywords.**

negasva.shop's `/estilos/*` pages are well-built Hybrid Product pages (price + FAQ + schema + cross-links) — strong fit for gift/commerce-intent keywords. But the site has no Tool-type page or top-funnel content to capture "convertir foto en caricatura" verb-based searches, which Google routes almost entirely to free AI generators. Targeting these verb-phrase keywords with a commerce page will not rank; they require either (a) a free-preview tool/generator gate, or (b) abandoning these keywords for purely commercial gift-phrase variants where /estilos pages already compete well.

## Gap Analysis (estilos/rick-y-morty), 100 pts
| Dimension | Score | Evidence |
|---|---|---|
| Page Type | 9/15 | Strong Hybrid Product page for gift-intent; mismatched for tool-intent keywords |
| Content Depth | 10/15 | 538 words, FAQ, process H2s; lacks size comparisons, format options (poster/mug), occasion framing |
| UX Signals | 10/15 | Clear CTA, breadcrumb; no urgency/scarcity, no "as seen on" |
| Schema | 14/15 | Product+AggregateOffer+FAQPage+BreadcrumbList present — excellent |
| Media | 6/15 | Only 4 example images, no before/after, no video, no customer-submitted gallery |
| Authority | 5/15 | No reviews/ratings on the style page itself (testimonials only on homepage) |
| Freshness | 8/10 | publication_date detected 2026-01-01, schema present |
**Total: 62/100 SXO Gap Score**

## Limitations
- Could not render donutamarillo.com/mortyme.fun (DNS resolution failed in sandbox) — competitor structure inferred from WebSearch snippets only.
- No live SERP screenshot/PAA/AI Overview data captured (WebSearch tool, not raw SERP API) — PAA and featured-snippet presence inferred from result titles/snippets, not verified directly.
- Only 2 of negasva.shop's 4 style pages were fetched directly (rick-y-morty + homepage); simpsons/gravity-falls/padrinos assumed to share template via shared schema/links observed.

## Recommendations Priority
1. Add a free low-res "preview" generator gate or before/after slider to `/estilos/simpsons` to compete with AI-tool SERP for "convertir foto en caricatura simpsons" — or deprioritize that exact phrase and target "regalo personalizado simpsons" instead.
2. Add reviews/ratings block + format options (digital/poster) on each /estilos page to close Authority and Media gaps.
3. Recommend `/seo content` for E-E-A-T depth pass and `/seo schema` to add Review/AggregateRating schema.
