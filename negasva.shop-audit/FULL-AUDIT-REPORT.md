# SEO Audit — negasva.shop

**Date:** 2026-06-23
**Business type:** E-commerce / personalized digital service — custom cartoon-style photo portraits (Rick y Morty, Simpsons, Gravity Falls, Padrinos Mágicos), Stripe checkout, Next.js on Vercel, Supabase backend.
**Overall SEO Health Score: 62/100**

## Executive Summary

negasva.shop has solid technical bones — fully SSR'd Next.js content, strong security headers, fast TTFB, and good schema infrastructure — but several **bugs are actively suppressing the site's own search visibility**: wrong canonical tags on most non-homepage pages, broken hreflang claims pointing to nonexistent locales, and duplicate/competing Product schema entities. None of these require new content or design work — they're metadata bugs with outsized impact, and they're the highest-leverage fixes available.

Content depth is the second-biggest gap: the blog is critically thin (one comparison post measured at ~89 words), and the four style pages appear templated rather than genuinely differentiated, evidenced by identical hardcoded pricing in their schema.

### Top 5 Critical Issues
1. Canonical tags on /precios, /order, /galeria, /sobre, /contacto, /faq all point to the homepage instead of self.
2. hreflang tags claim en/fr versions exist; they all resolve to the same Spanish homepage.
3. Competing Product schema entities on style pages, plus generic Product/Offer schema leaking onto non-product pages.
4. /order (checkout) is indexed with no canonical/noindex; /order?style=* variants are crawlable duplicate-content risk.
5. Blog posts are critically thin — the site's own templating proves 500+ word pages are achievable elsewhere.

### Top 5 Quick Wins
1. Fix canonical tags to self-reference (hours, high impact).
2. Remove broken en/fr hreflang claims (hours).
3. Redirect www.negasva.shop to apex (minutes).
4. Add llms.txt for AI crawler readiness (1-2 hours).
5. Render all FAQ answers in visible DOM text instead of a collapsed accordion (half day).

## Category Scores

| Category | Score | Weight |
|---|---|---|
| Technical SEO | 64/100 | 22% |
| Content Quality | 55/100 | 23% |
| On-Page / Search Experience | 63/100 | 20% |
| Schema / Structured Data | 58/100 | 10% |
| Performance (CWV) | 73/100 | 10% |
| AI Search Readiness (GEO) | 64/100 | 10% |
| Images | 65/100 | 5% |

Supplementary specialist scores (not part of the weighted total, but informative): SXO/page-intent fit 62/100, E-commerce signals 64/100, Blog content architecture 42/100, Visual/mobile 68/100. Backlinks: not scored — the domain has zero measured footprint in available free data sources (too new/small to appear in Common Crawl), which reflects "nothing measured" rather than "measured and bad."

## Technical SEO (64/100)

**Works well:** full SSR/SSG (no SPA shell), strong security headers (HSTS preload, full CSP, COOP/CORP), clean robots.txt, valid sitemap, correctly prioritized LCP image loading.

**Critical:** canonical tags on 6+ pages point to the homepage instead of self — likely suppressing those pages from search results entirely. hreflang tags advertise en/fr/x-default locales that don't exist, all resolving to the Spanish root.

**High:** www subdomain isn't redirected to apex; /seguimiento is noindex,nofollow, blocking link equity unnecessarily.

**Medium:** every sitemap URL shares an identical lastmod timestamp (a build-time stamp, not real content tracking), which over time erodes crawler trust in the signal.

## Content Quality (55/100)

**Works well:** pricing and 48h turnaround stated clearly and consistently; style detail pages run substantial (~538 words with FAQ).

**Critical:** the blog is severely thin — a comparison post measured at ~89 words, far below what's needed to rank for comparison-intent queries.

**High:** the four style pages show signs of templated, copy-paste-and-swap-name content (identical hardcoded pricing across all four in their schema); using third-party trademarked character names as the core keyword strategy carries a business risk worth a deliberate decision, not a default; testimonials aren't linked to a verifiable review platform.

**Medium:** 2 of 4 styles have zero supporting blog content; no gift-occasion content despite the gift-driven business model.

## On-Page / Search Experience (63/100)

/estilos/rick-y-morty is a well-built hybrid product page (price, FAQ, breadcrumbs) that competes well for gift-intent keywords like "regalo personalizado rick y morty." But for tool-intent keywords like "convertir foto en caricatura simpsons," the SERP is dominated by free instant AI generators (7/10 results) — a paid, 48h hand-drawn product page cannot satisfy that intent, and targeting that exact phrase will likely never rank without a free-preview entry point. Style pages also lack gift-occasion framing that direct competitors use prominently, and lack visible reviews/ratings on the page itself.

## Schema / Structured Data (58/100)

Product+AggregateOffer and FAQPage JSON-LD are in good shape with clean, citable facts — but two structural bugs undercut them: competing Product entities on the same page (generic + style-specific), and generic schema bleeding onto pages that aren't products. No Review/AggregateRating schema exists despite visible testimonials, and all four styles share identical hardcoded pricing in their schema, suggesting it wasn't generated per-style.

## Performance / Core Web Vitals (73/100)

LCP fails the "Good" CWV threshold on all 4 tested pages (2.33s-2.94s), driven by render-blocking CSS and an under-optimized hero image (~41KB of available savings). /estilos independently fails CLS (0.245, "poor") due to a dynamically-rendered grid card shifting layout after load — not an unsized image or font issue as initially suspected. Stripe's checkout JS (236KB) loads globally rather than only on the checkout page.

## AI Search Readiness / GEO (64/100)

Pricing and turnaround are stated as clean, repeatable facts in both prose and schema — strong groundwork for AI citation. But 9 of 10 FAQ answers are hidden inside a collapsed accordion and only exist in JSON-LD, invisible to any crawler reading plain DOM text. No llms.txt exists. The site has no English content despite English search demand for terms like "Rick and Morty portrait." Brand authority signals (Instagram/TikTok only) are weaker than the YouTube/Reddit presence that correlates more strongly with AI citation.

## Images (65/100)

next/image with responsive srcset is correctly implemented, but the hero image still has ~41KB of unrealized compression savings. Alt-text coverage and image-SERP visibility weren't deeply audited this pass — recommend a follow-up before treating this score as final.

## Backlinks

No Moz/Bing/DataForSEO API keys are configured. Common Crawl shows zero record of negasva.shop — consistent with a brand-new, small domain not yet captured by quarterly web-graph snapshots. Recommended low-cost tactics suited to this niche: Etsy listings, Rick & Morty/Simpsons fandom forum/subreddit presence, Pinterest as a visual-discovery channel, gift-guide blogger outreach, and a UGC incentive (discount for customers who post/tag their portraits).
