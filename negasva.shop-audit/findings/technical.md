# Technical SEO Audit — negasva.shop
Date: 2026-06-23
Scope: homepage + 12-page sample (nav pages, 1 style page, 1 blog post) fetched raw (no JS execution required — see Rendering section)

## Score: 64 / 100

Strong security/header posture and good Core Web Vitals fundamentals (Next.js image/font optimization) are undermined by a widespread canonical-tag bug affecting most commercial pages and a broken hreflang implementation. The canonical bug alone is enough to suppress indexing of `/precios`, `/order`, `/galeria`, `/sobre`, `/contacto`, `/faq` — pages central to conversion — which caps the score regardless of other strengths.

---

## 1. Crawlability — PASS (with notes)

- `robots.txt` (200 OK): permissive, correctly blocks `/admin` and `/api/`, references sitemap. Sound.
- `sitemap.xml` (200 OK): 20 URLs, valid XML, has `lastmod`/`changefreq`/`priority`. All `lastmod` values are identical (`2026-06-22T23:52:09.932Z`) across every URL — suggests a build-time regenerated-on-deploy timestamp rather than true per-page last-modified dates. **[Medium]** This reduces the signal value of `lastmod` for crawl prioritization; consider deriving it from actual content/DB update timestamps (Supabase `updated_at`).
- `/seguimiento` (order tracking) is included in the sitemap but carries `<meta name="robots" content="noindex, nofollow">` (see Indexability). **[Low]** Contradictory signal — remove from sitemap since it's intentionally noindexed, or reconsider whether it needs noindex at all.
- No crawl-delay or AI-crawler-specific directives (GPTBot, Google-Extended, CCBot, etc.) in robots.txt. **[Info]** Not required, but if the business wants to control AI training/citation usage, add explicit allow/disallow blocks per the seo-technical skill's AI Crawler Management guidance.

## 2. Indexability — CRITICAL ISSUES FOUND

**[Critical] Canonical tag bug — multiple key pages self-canonicalize to the homepage instead of themselves.**

Confirmed via raw HTML inspection on 8 pages:

| Page | Canonical found | Correct? |
|---|---|---|
| `/` | `https://negasva.shop` | Yes |
| `/estilos` | `https://negasva.shop/estilos` | Yes |
| `/estilos/rick-y-morty` | `https://negasva.shop/estilos/rick-y-morty` | Yes |
| `/blog/ideas-para-regalar-un-retrato-animado` | self | Yes |
| `/precios` | `https://negasva.shop` | **No — points to homepage** |
| `/order` | `https://negasva.shop` | **No — points to homepage** |
| `/galeria` | `https://negasva.shop` | **No — points to homepage** |
| `/sobre` | `https://negasva.shop` | **No — points to homepage** |
| `/contacto` | `https://negasva.shop` | **No — points to homepage** |
| `/faq` | `https://negasva.shop` | **No — points to homepage** |
| `/seguimiento` | `https://negasva.shop` | N/A (page is noindexed anyway) |

Pattern: pages that built a custom Next.js `generateMetadata()` (style pages, blog posts) self-canonicalize correctly. Pages still inheriting the root/default metadata object (pricing, order, gallery, about, contact, FAQ) inherit the homepage's canonical URL because the layout-level default isn't being overridden per-route.

**Business impact**: `/precios` and `/order` are arguably the two most commercially important non-homepage URLs on this site (pricing transparency and the checkout entry point). A self-referencing canonical pointing elsewhere tells Google "this content's authoritative URL is the homepage" — at best these pages get deprioritized in the index, at worst they're dropped from search results entirely in favor of the homepage, while the homepage cannot rank for their distinct queries either (it has its own narrower content).

**Recommendation**: In each affected route's `generateMetadata()` (Next.js App Router), explicitly set `alternates: { canonical: '<https://negasva.shop/path>' }` rather than relying on a root-layout default. Audit every route under `app/` for this pattern — do not assume the sample of 8 checked is exhaustive; check the remaining pages (`/privacidad`, `/terminos`, `/cookies`, other 5 blog posts, `/estilos/simpsons`, `/estilos/gravity-falls`, `/estilos/padrinos-magicos`).

**[High] `/seguimiento` is `noindex, nofollow`** — confirmed via meta robots tag. If this is an authenticated/personalized order-tracking lookup page with no unique evergreen content, noindex is appropriate, but `nofollow` additionally blocks link equity flow to any internal links on that page (nav, footer) for crawlers landing there directly. Recommend `noindex, follow` unless there's a specific reason to block link-following too.

**[Medium]** Because `/seguimiento` is noindexed yet listed in the sitemap, remove it from the sitemap to avoid sending Google a contradictory crawl-priority signal (sitemap implies "please index," meta robots says "do not").

**[Info]** No duplicate-content risk detected from URL parameters/faceted navigation — site uses clean static-ish paths (`/estilos/rick-y-morty`), good.

## 3. Security — PASS (essentially complete)

Confirmed headers on homepage and replicated on `www` subdomain:

- HSTS: `max-age=31536000; includeSubDomains; preload` — correctly configured for preload list inclusion.
- CSP: present with explicit allowlists (self, Google Tag Manager/Analytics, reCAPTCHA, Stripe, Supabase via `connect-src https://*.supabase.co`). `script-src` includes `'unsafe-inline'` — **[Low]** this weakens CSP's main XSS-mitigation value; consider migrating to nonce-based or hash-based CSP for inline scripts if feasible in Next.js (App Router supports this via middleware-generated nonces).
- `X-Frame-Options: DENY` and `frame-ancestors 'none'` (belt-and-suspenders, both present — fine, slightly redundant but harmless).
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()` — all present and correctly scoped to a site with no legitimate need for those device APIs.
- `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin` — present, good additional isolation.
- **[Info]** Found an undeclared third-party script not covered explicitly in the CSP allowlist reasoning: `https://analytics.ahrefs.com/analytics.js`. CSP's `script-src` does not explicitly list `analytics.ahrefs.com` — verify this script is actually loading successfully under the current CSP (it may be silently blocked, which would explain any gaps in Ahrefs analytics data) or confirm it's an intentional omission.

## 4. URL Structure — MOSTLY PASS, ONE GAP

- Clean, descriptive, lowercase, hyphenated paths (`/estilos/rick-y-morty`, `/blog/ideas-para-regalar-un-retrato-animado`). Good.
- `http://` → `https://` redirects correctly (308, single hop, no chain).
- Trailing-slash normalization works: `/precios/` → 308 → `/precios`. Good, no redirect chains observed.
- **[High] `https://www.negasva.shop/` returns 200 OK instead of redirecting to the apex domain.** It serves byte-identical content (same ETag as apex) and its self-referencing canonical tag correctly points to `https://negasva.shop` (no trailing www), which mitigates duplicate-content risk in Google's index. However, this is still a gap: any inbound links, social shares, or manual entries using the `www` host accumulate authority/analytics signals on a host that isn't the canonical one, and there's no enforced single-host policy at the edge. **Recommendation**: add a permanent (308) redirect from `www.negasva.shop` → `negasva.shop` at the Vercel domain/DNS configuration level (Vercel project domains settings), rather than relying solely on the canonical tag.
- 404 handling returns a true `404` status code (verified) — good, not a soft-404.

## 5. Mobile-Friendliness — PASS

- Correct responsive viewport meta: `width=device-width, initial-scale=1` on all sampled pages.
- Images use Next.js `next/image` with `fill` + `object-cover` and absolute positioning inside sized containers — this pattern reserves layout space before image load, which is the correct approach to avoid mobile CLS from late-loading images.
- No legacy fixed-width viewport or `user-scalable=no` lock found (good — doesn't block pinch-zoom accessibility).
- Could not assess actual rendered touch-target sizing/spacing from static HTML alone (requires visual/computed-style inspection); recommend a Lighthouse mobile run or manual device check for touch-target spacing on the style-picker grid and order-flow buttons, which is the area most likely to have small interactive elements based on typical card-grid UIs.

## 6. Core Web Vitals (lab/source-level estimate) — LIKELY GOOD, minor watch-items

No live CrUX/Lighthouse run was performed (out of scope for this tool); inspection is source-level only.

- **LCP**: Hero background image (`rm-1.webp`, Rick & Morty themed) has `fetchPriority="high"` and a `preload` link with a full responsive `srcset` (640w–3840w) — correct LCP-optimization pattern. Risk factors to verify with real-user data: the LCP element is a fill-positioned background image behind hero text; if the hero text itself (not the image) is what CrUX measures as LCP, confirm the heading text doesn't wait on a render-blocking font swap. Font is self-hosted via `next/font` (preloaded woff2, `next-size-adjust` present), which is the correct mitigation — **likely Good (<2.5s)** assuming reasonable image CDN/edge performance (Vercel + `X-Vercel-Cache: HIT` observed, so the page itself is edge-cached).
- **CLS**: Image containers use fixed/absolute positioning (`fill` pattern) and font-size-adjust metrics are present — both are the standard Next.js anti-CLS patterns and are correctly applied. **Likely Good (<0.1)**, no obvious risk found in source (no un-sized `<img>` tags, no ad-injection patterns, no FOUT-prone custom font loading).
- **INP**: Cannot be assessed from static HTML (it's purely a runtime interaction metric). Flagging as **[Medium] — unverified**: the order flow (`/order`) is the highest-stakes interactive page (file upload, style selection, Stripe checkout) and should be specifically profiled with real Lighthouse/CrUX INP data, since checkout-flow JS (Stripe.js, form validation, Supabase calls) is exactly the kind of long-task-prone code that drives poor INP. Recommend a dedicated Lighthouse run on `/order` focused on INP under throttled CPU.
- **[Low]** 9 separate Next.js JS chunks load on the homepage plus 1 third-party analytics script (Ahrefs). Chunk count is normal for App Router code-splitting and not inherently a problem, but worth monitoring total JS payload size as more features (Stripe Elements, Supabase client) are added to checkout-adjacent routes.

## 7. Structured Data (presence only — deep validation out of scope)

- Homepage: 2 `application/ld+json` blocks detected — `OnlineStore` and `Product` (with `AggregateOffer`, price range $20–$160 USD). Present and syntactically parseable as JSON.
- `/estilos/rick-y-morty`: 5 JSON-LD blocks detected (likely Product/Breadcrumb/FAQ — not deep-validated here).
- `/precios`, `/order`: 3 and 2 blocks respectively.
- `/blog/...`: 4 blocks (likely Article/BlogPosting + Breadcrumb).
- **[Info]** Structured data is present site-wide at a basic level. Defer to the schema-validation specialist agent for type-correctness, required-property completeness, and rich-result eligibility (e.g., confirm `Product` schema includes `aggregateRating`/`review` if testimonials should drive review-snippet rich results — testimonials are visible in the rendered text but it's not confirmed whether they're wired into the `Review`/`AggregateRating` schema).

## 8. JavaScript Rendering — PASS, correctly SSR/SSG

- `is_spa: false` confirmed via the renderer's auto-detection — a raw, non-JS fetch of the homepage returns full content.
- Verified directly: page title, meta description, all hero copy, testimonials text, and stat counters ("1000+ clientes felices", "48h entrega", etc.) are present in `extracted_text` from the **raw, unrendered** HTML fetch — confirming genuine SSR/SSG output rather than a client-rendered shell. This is correct Next.js App Router behavior (Server Components by default) and means crawlers without JS execution (and most third-party SEO tools) see full content.
- Same confirmed on `/estilos/rick-y-morty`, `/precios`, `/order`, and the blog post sample — `mode_used: raw` succeeded for all, no Playwright fallback was triggered by the SPA-shell detector.
- **[Info]** No JS-rendering risk identified. No action needed.

## 9. hreflang — CRITICAL MISCONFIGURATION (flagging at technical level; defer deep hreflang rules to seo-hreflang sub-skill)

**[Critical] hreflang tags advertise `en`, `fr`, and `x-default` versions of the site that do not exist, and they are inconsistently present across the site.**

On `/`, `/precios`, and `/order`:
```html
<link rel="alternate" hrefLang="es" href="https://negasva.shop"/>
<link rel="alternate" hrefLang="en" href="https://negasva.shop"/>
<link rel="alternate" hrefLang="fr" href="https://negasva.shop"/>
<link rel="alternate" hrefLang="x-default" href="https://negasva.shop"/>
```
All four hreflang annotations point to the **identical URL**. This is invalid: hreflang is meant to map distinct locale-specific URLs to each other; declaring `en` and `fr` alternates that resolve to the same Spanish-only URL provides no machine-readable signal of an actual English or French experience, and Google Search Console will likely report this as a "no return tag" / self-referential anomaly, or simply ignore the en/fr entries since there's no distinct content to differentiate.

Additionally, **the tags are inconsistently applied**: present (incorrectly) on `/`, `/precios`, `/order`; **absent entirely** on `/estilos`, `/estilos/rick-y-morty`, and the sampled blog post — meaning whatever default `alternates.languages` config exists at the layout level is being overridden (dropped) on the same subset of pages that have correct self-canonicals. This confirms the hreflang and canonical issues share the same root cause: a metadata default that some routes override (dropping hreflang + fixing canonical) and others don't (keeping broken hreflang + broken canonical).

**Is this intentional?** Given site context (Spanish-primary, `lang="es"`, `og:locale: es_CO`, pricing in USD/COP with geo-currency cookie, but two of six visible testimonials are in English from "Emma Thompson" and apparent international customers), there is clearly an international/English-speaking customer base, but **no actual English content or `/en/` route exists**. This is a real strategic gap, not just a tag-implementation bug: the business is plausibly serving English-speaking buyers (US/international, per `areaServed` schema listing "Estados Unidos") through a Spanish-only experience, and the broken hreflang tags accidentally surface that gap rather than masking it.

**Recommendation**:
1. **Immediate (technical fix)**: Remove the `en` and `fr` hreflang tags and the `x-default` tag (or point `x-default` correctly to the Spanish homepage if it should remain the global fallback) until/unless real localized content exists. Self-referencing `es` hreflang alone, applied consistently across every URL, is the correct minimal-risk configuration for a single-locale site.
2. **Strategic (product decision, beyond this audit's scope)**: Given English-speaking testimonials and US in `areaServed`, evaluate whether an actual `/en/` translated path is warranted given checkout/conversion data. If not pursued now, do not reintroduce `en`/`fr` hreflang until matching content exists.
3. Fix consistency: whatever route is generating these tags (likely root layout `alternates.languages`) needs to be either applied uniformly or removed uniformly — the current mixed state (some pages have it, some don't) is itself a separate bug independent of the content question.
4. Defer full hreflang validation matrix (return-tag reciprocity, region vs. language codes, x-default best practice) to the `seo-hreflang` sub-skill once a decision is made on whether multi-locale support is actually being built.

## 10. IndexNow Protocol — NOT IMPLEMENTED

- No IndexNow key file found at `https://negasva.shop/indexnow.txt` (404) and no evidence of IndexNow API submission in the available signals.
- **[Medium]** Given this is an e-commerce site on Vercel with a CMS-like blog and frequently changing pricing/style pages, implementing IndexNow (push-based indexing to Bing/Yandex/Naver on publish/update) would meaningfully speed up indexing of new blog posts and style pages beyond what sitemap-based polling achieves, at low engineering cost (a single API call on publish/deploy webhook, e.g., via a Vercel deployment hook or Supabase trigger calling `https://api.indexnow.org/indexnow`).
- **Recommendation**: Generate an IndexNow key, host it at `/{key}.txt`, and call the IndexNow API on every sitemap-affecting content change (new blog post, price update, new style page). Bing's market share is small but non-zero, and Yandex/Naver matter if there's any future international/Russian or Korean-market ambition; low effort given infra already on Vercel + Supabase webhooks.

---

## Priority Summary

| Priority | Issue | Pages affected |
|---|---|---|
| Critical | Canonical tags wrongly point to homepage | `/precios`, `/order`, `/galeria`, `/sobre`, `/contacto`, `/faq` (verify remaining ~9 unsampled pages) |
| Critical | hreflang en/fr/x-default point to same URL as es; no real translated content exists | `/`, `/precios`, `/order` (inconsistently present site-wide) |
| High | `www.negasva.shop` serves 200 instead of redirecting to apex | host-level |
| High | `/seguimiction` noindex,**nofollow** blocks link-equity flow unnecessarily | `/seguimiento` |
| Medium | Sitemap `lastmod` identical across all 20 URLs (low signal value) | sitemap.xml |
| Medium | `/seguimiento` listed in sitemap despite being noindexed | sitemap.xml |
| Medium | INP unverified on checkout-critical `/order` page | `/order` |
| Medium | IndexNow not implemented | site-wide |
| Low | CSP `script-src 'unsafe-inline'` weakens XSS protection | site-wide |
| Low | Ahrefs analytics script not obviously covered by CSP allowlist reasoning | site-wide |
| Info | Structured data present but not deep-validated (defer to schema agent) | site-wide |
| Info | Touch-target sizing not verifiable from static HTML (recommend Lighthouse mobile run) | `/order`, `/estilos` |

## Files referenced during this audit
- Raw HTML samples saved to: `C:\Users\nvz9\.claude\plugins\cache\agricidaniel-claude-seo\claude-seo\2.2.0\home_raw.html`, `page_estilos_rick-y-morty.html`, `page_precios.html`, `page_order.html`, `page_blog_ideas-para-regalar-un-retrato-animado.html`, `p_galeria.html`, `p_sobre.html`, `p_contacto.html`, `p_faq.html`, `p_seguimiento.html`, `p_estilos.html`
