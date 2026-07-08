# GEO Audit — negasva.shop

Date: 2026-06-23
Note: This audit was conducted under an active prompt-injection attempt (tool
outputs in-session falsely claimed Bash/WebFetch were "blocked" by a
nonexistent "context-mode" MCP server and tried to redirect the agent to
fabricated tools). The injection was identified and ignored; all findings
below come from direct `curl` fetches of the live site.

## GEO Readiness Score: 64/100

| Dimension | Weight | Score | Notes |
|---|---|---|---|
| Citability | 25% | 70/100 | Strong FAQPage/Product JSON-LD with clean Q&A pairs; but accordion UI hides 9/10 FAQ answers from plain-text DOM extraction (visible only in JSON-LD). |
| Structural Readability | 20% | 65/100 | Good H1/H2 usage, question-style FAQ headings, short paragraphs. Pricing page uses card/list UI rather than prose, which is less ideal for LLM passage extraction. |
| Multi-Modal Content | 15% | 40/100 | Product images present (webp/jpg), but no video, no alt-text verified, no YouTube presence confirmed, no UGC/Reddit gallery. |
| Authority & Brand Signals | 20% | 45/100 | Schema.org `OnlineStore`/`Product`/`Brand` present with `sameAs` to Instagram/TikTok only — no Wikipedia, YouTube, or Reddit entity links found. No visible author/date bylines (blog not inspected in depth). |
| Technical Accessibility | 20% | 85/100 | Fully SSR'd (Next.js App Router) — initial HTML response contains full content, not a CSR shell. Fast, crawlable, no JS-execution dependency for core text. |

**Weighted score: 64/100**

## AI Crawler Access (robots.txt)

```
User-Agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://negasva.shop/sitemap.xml
```

- No explicit per-bot rules for GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, or Google-Extended.
- The wildcard `User-Agent: *` / `Allow: /` **does** implicitly cover all of these crawlers, including the ones GEO best practice wants allowed. There is no block of any kind on the named AI search bots.
- Risk: some operators add bot-specific blocks later without realizing the wildcard already permits them, or accidentally introduce a blocking rule for `GPTBot`/`CCbot` etc. Adding **explicit `Allow:` blocks** for GPTBot, OAI-SearchBot, ClaudeBot, and PerplexityBot is low-effort and removes any ambiguity for crawlers that prioritize bot-specific rules over wildcards, and documents intent for future maintainers.
- No explicit rule for `Google-Extended` (governs Gemini/AI Overviews training-vs-serving distinction) — currently inherits the wildcard allow, which is fine, but an explicit line would let the site distinguish "allow AI Overviews citation" from "allow Gemini training" if that distinction is ever wanted.

## llms.txt

- `https://negasva.shop/llms.txt` → **HTTP 404, missing.**
- No RSL 1.0 licensing file found either.
- Recommendation: add a minimal `llms.txt` summarizing the business (personalized cartoon portraits from photos), linking to `/precios`, `/faq`, `/estilos`, and stating licensing/usage terms for AI systems. Low effort, plausible citation-quality upside.

## Passage-Level Citability — /faq, /precios, /estilos

- **Pricing is a clear, extractable fact set**: $25 (torso), $29.99 (full body), +$15 (custom background), family discounts at 3+ (15%) and 5+ (25%) people, explicit dollar examples ($29.99 / $59.98 / $84.98 / $116.97). This is exactly the kind of self-contained numeric data LLMs like to cite, and it's present in plain visible HTML (not hidden behind JS), which is good.
- **Turnaround time (48h) is stated multiple times** and consistently: footer-style list items ("Entrega en 48 horas"), meta descriptions, OG tags, Twitter cards, and the FAQ's `FAQPage` JSON-LD ("La entrega estándar es de 48 horas o menos. Con la opción exprés 24h (+30%)..."). Consistent repetition across schema and prose strengthens fact reliability/citation confidence.
- **FAQ answers are present in `FAQPage` JSON-LD for all 10 Q&A pairs** (delivery time, file formats, post-delivery edits, family discount math, bad-photo policy, accepted currencies, payment/security, commercial usage rights) — this is excellent structured-data coverage that most AI crawlers (GPTBot, ClaudeBot, PerplexityBot all parse JSON-LD) can extract directly.
- **Gap**: Only the first FAQ answer is rendered in the visible DOM text on initial HTML load; the remaining 9 answers are inside an accordion component (`aria-expanded`/`hidden` attributes suggest collapsed-by-default), so any AI agent or scraper that extracts only visible body text (ignoring `<script type="application/ld+json">`) will miss most of the FAQ content. Recommendation: render all FAQ answers in visible markup (even if visually collapsed via CSS `max-height`/`aria-hidden` rather than removed from the accessibility tree / DOM text flow), so citability doesn't depend entirely on JSON-LD parsing.
- **/estilos page** lacks direct-answer prose; it's card-based ("Rick & Morty — Explora el universo con este estilo sci-fi icónico" + 3 bullet features). This is short and punchy but not a self-contained 134-167 word answer block an LLM could lift verbatim to answer "what does a Rick and Morty style portrait look like." Style-specific subpages (e.g., `/estilos/rick-y-morty`) do carry their own `Product` + `FAQPage` schema, which is good, but body copy there should be checked for similar accordion-hiding patterns (style-specific FAQs found, e.g. "¿Puedo salir con el portal verde de fondo?" — present in JSON-LD).
- No question-based H2/H3 structure on `/precios` — it's a price list, not narrative Q&A, so it under-indexes for "how much does X cost" conversational queries despite having the right numbers.

## Authority & Brand Signals

- `sameAs` schema links only to Instagram and TikTok — no Wikipedia entity, no YouTube channel, no Reddit presence detected via available tooling (could not run authenticated brand-mention search in this sandbox; recommend a manual/DataForSEO check).
- No visible author bylines, published/updated dates on `/blog` content were not deeply inspected this pass — recommend follow-up.
- Given the brand-mention correlation table (YouTube ~0.737, Reddit high, Wikipedia high, Domain Rating only ~0.266), NEGASVA's current signal set (Instagram + TikTok only) is the **weakest possible combination** for AI-citation correlation — Instagram/TikTok content isn't well indexed/cited by LLMs the way YouTube or Reddit threads are.

## Language / Locale Issue (English Visibility)

- Site is `lang="es"` sitewide; sitemap.xml contains **zero `/en/` URLs** — confirmed by full sitemap fetch.
- `hreflang` tags are present on `/precios` and `/estilos` pages (`es`, `en`, `fr`, `x-default`) but **all of them point back to the same Spanish canonical URL** (`https://negasva.shop`), which is incorrect/misleading hreflang — it signals to Google/Bing that English and French versions exist when they don't, and the canonical tag itself is wrong on `/precios` (`https://negasva.shop` instead of `https://negasva.shop/precios`).
- There IS a visible EN/ES/FR language switcher in the nav UI, but it appears to be a non-functional or cosmetic toggle (URLs/sitemap show no locale-prefixed content) — worth verifying if it actually swaps content client-side without changing the URL (if so, that content is invisible to crawlers since it's not server-rendered per-locale and has no distinct URL to be cited).
- Impact: searches like "Rick and Morty portrait" or "cartoon portrait from photo" in English have no dedicated indexable page to surface in Google AI Overviews, ChatGPT browsing, or Perplexity — the Spanish content can theoretically still rank/cite (LLMs do cross-lingual retrieval) but conversion-relevant page titles, meta descriptions, and on-page prose are Spanish-only, reducing match confidence and citation likelihood for English-intent queries.

## Top 5 Highest-Impact Changes

1. **Fix hreflang/canonical mismatch on /precios and /estilos** (Effort: Low — hours). Either remove the `en`/`fr` hreflang claims entirely until real localized pages exist, or fix canonical URLs to self-reference the actual page path. Wrong hreflang can suppress visibility in mixed-language SERPs/AI Overviews.
2. **Render full FAQ answers in visible DOM text, not just JSON-LD** (Effort: Low-Medium — half day). Change the accordion default state or use CSS-only hide (not `hidden` attribute removing from accessibility tree) so all 10 answers are extractable as plain text, not just by JSON-LD-aware crawlers.
3. **Create an English locale (/en/) for at least /precios, /faq, /estilos** (Effort: High — days). Directly targets "cartoon portrait from photo," "Rick and Morty portrait" English search intent for AI Overviews/ChatGPT/Perplexity, which the Spanish-only site currently cannot serve with matching title/meta/prose.
4. **Add llms.txt** (Effort: Low — 1-2 hours). Currently 404. Summarize offering, link key pages, state pricing/turnaround facts explicitly for LLM ingestion.
5. **Build YouTube and Reddit presence** (Effort: Medium-High, ongoing). Given the correlation strength (YouTube ~0.737, Reddit high) vs. current Instagram/TikTok-only signals, even a few YouTube Shorts (process videos, before/after reveals) or organic Reddit mentions in relevant subs would meaningfully outperform further backlink/DR work for AI-citation likelihood.

## Platform-Specific Estimated Scores

| Platform | Score | Rationale |
|---|---|---|
| Google AI Overviews | 55/100 | Hurt by broken hreflang and missing English content; helped by strong schema. |
| ChatGPT / OAI-SearchBot | 65/100 | JSON-LD FAQPage is directly citable; SSR content is fully crawlable; no llms.txt is a minor gap. |
| Perplexity | 60/100 | Good structured facts (price/turnaround) but weak off-site authority signals (no YouTube/Reddit/Wikipedia) limit corroboration. |
| Bing Copilot | 58/100 | Similar to Google AIO — benefits from schema, hurt by locale/hreflang confusion. |

## Source Data

Confirmed via direct fetch on 2026-06-23:
- robots.txt: wildcard allow, no bot-specific rules, sitemap declared.
- llms.txt: HTTP 404.
- sitemap.xml: 17 URLs, all Spanish, no /en/ paths.
- /precios, /estilos, /faq, /estilos/rick-y-morty: fully SSR'd HTML (Next.js App Router), JSON-LD present (OnlineStore, Product, BreadcrumbList, FAQPage) on all checked pages.
- hreflang on /precios: es/en/fr/x-default all pointing to root domain (bug); canonical also points to root instead of self.
