# Action Plan — negasva.shop

## Phase 1: Critical Fixes (Week 1)
- [ ] Fix canonical tags on /precios, /order, /galeria, /sobre, /contacto, /faq to self-reference
- [ ] Remove broken en/fr hreflang claims (or commit to building real locales)
- [ ] Remove competing/duplicate Product schema nodes on style pages
- [ ] Scope generic Product/Offer schema off non-product pages (home, /order, /precios index)
- [ ] Add canonical/noindex handling for /order?style=* variants

## Phase 2: High-Impact Improvements (Weeks 2-3)
- [ ] Redirect www.negasva.shop to apex domain
- [ ] Remove noindex,nofollow from /seguimiento if unintentional
- [ ] Render all FAQ answers in visible DOM text instead of hidden accordion content
- [ ] Fix LCP (render-blocking CSS, hero image compression) and /estilos CLS root cause
- [ ] Add Review/AggregateRating schema using real, verifiable review data
- [ ] Fix hardcoded identical pricing across the 4 style pages' schema

## Phase 3: Content & Authority (Month 2)
- [ ] Expand all 6 blog posts to substantive length (800-1500 words), starting with the confirmed-thinnest comparison post
- [ ] Differentiate the 4 style pages beyond name-swapping (unique imagery, FAQ, pricing accuracy)
- [ ] Add llms.txt and consider an English locale for /precios, /faq, /estilos
- [ ] Decide deliberately on trademark/IP framing strategy for character-name keywords
- [ ] Link visible testimonials to a verifiable review platform

## Phase 4: Monitoring & Iteration (Ongoing)
- [ ] Track Core Web Vitals monthly: LCP, CLS, INP/TBT proxy, especially home and /estilos
- [ ] Re-check Search Console coverage after metadata changes: canonicals, indexing, and duplicate URLs
- [ ] Review FAQ visibility and DOM text extraction after any content/admin updates
- [ ] Add 1 YouTube video or 2 Reddit/community mentions per month for authority signals
- [ ] Re-run backlink checks quarterly once Common Crawl/Moz data exists
- [ ] Watch blog performance: impressions, clicks, and which post gets the most queries
- [ ] Decide on a free-preview page only if tool-intent queries start showing demand
