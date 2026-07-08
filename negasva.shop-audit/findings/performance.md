# Core Web Vitals — negasva.shop

Lighthouse 13.0 lab audits (single-run, mobile emulation), 4 pages: Home, /estilos, /galeria, /rickmorty.
No CrUX field data available in this pass (used lab data only — see note below).

## Summary Scorecard

| Page | Perf Score | LCP | CLS | TBT (proxy for INP) |
|------|-----------|-----|-----|----------------------|
| Home | 90 | 2.94s — **Needs Improvement** | 0.001 — Good | 231ms |
| /estilos | 83 | 2.33s — Needs Improvement | **0.245 — Poor (borderline)** | 184ms |
| /galeria | 95 | 2.74s — Needs Improvement | 0.042 — Good | 101ms |
| /rickmorty | 96 | 2.57s — Needs Improvement | 0.000 — Good | 92ms |

Note: Lighthouse reports Total Blocking Time (TBT), a lab proxy correlated with INP, not INP itself (INP requires field/real-user data, e.g. CrUX). TBT is in the "moderate" range across all pages (no value is in the "good" sub-100ms range except galeria/rickmorty); no page shows TBT high enough to predict a "poor" INP, but Home's 231ms TBT warrants monitoring with real CrUX field data.

## Findings (severity-tagged)

### [HIGH] LCP is "Needs Improvement" on all 4 pages (2.3s–2.9s)
All four pages fall in the 2.5s–4.0s band or just under it (estilos at 2.33s is closest to "Good"). Root causes corroborated in JSON + insights.txt:
- TTFB is good (75–80ms server response across all pages; insights.txt cites 304ms for one measurement — still well under the 200ms-is-ideal/800ms-is-poor TTFB guidance, not the bottleneck).
- `render-blocking-insight` scores 0 (failing) on all pages — render-blocking CSS chunk `dde8ec8d106edc50.css` (9081 bytes, ~178ms wasted) delays first paint and pushes LCP later.
- `image-delivery-insight` scores 0 — LCP hero image delivery could save ~41KB (likely oversized/uncompressed source vs. unoptimized format, despite correct `fetchPriority="high"` + eager-load + discoverable-in-HTML setup, which IS correctly implemented).

### [HIGH] CLS 0.245 on /estilos — confirmed root cause, NOT an image or font issue
Verified via `layout-shifts` audit in `lh-estilos.json` (score 0, "2 layout shifts found"). Breakdown:
- Shift #1 (score 0.203, ~83% of total CLS): `section.py-20 > div.mx-auto > div.grid > div.group` — a product/style card in the grid (labeled "Rick & Morty... Explore the universe with this iconic sci-fi style"). Bounding box top=802, height=548px — a full grid card shifting into place.
- Shift #2 (score 0.042): the parent `section.py-20` itself (the "Estilo NEGASVA" section, height 2836px) shifts as content above/within it loads.
- `unsized-images` audit **passes** (score 1) on /estilos — ruling out the "unsized image" hypothesis from insights.txt.
- `non-composited-animations` and `font-display-insight` show no issues — ruling out FOIT/FOUT font shift.
- **Conclusion: the shift is caused by dynamically-injected/late-rendering grid card content** (likely client-side data fetch populating product/style cards after initial paint, with no reserved space/skeleton for the grid item). This is a classic "late-loading element without space reservation" CLS pattern, not an image-dimension or font issue.

### [MEDIUM] Legacy JavaScript polyfill waste (~11KB) — `legacy-javascript-insight` fails on all pages
Chunk `2117-3e1d891b089fe28e.js` ships an `Array.prototype.at` polyfill unnecessarily. Indicates the JS build target (browserslist/tsconfig target) is set too conservatively for the actual supported browser baseline, shipping dead-weight polyfills to all users including modern browsers.

### [MEDIUM] Stripe JS loaded on pages without checkout intent — `third-parties-insight`
`js.stripe.com/v3` costs 73ms main-thread time and 236KB transfer, loaded on pages (e.g. Home, /galeria, /rickmorty) where checkout isn't immediately needed. This contributes to TBT/INP risk and wastes bandwidth on first load.

### [LOW] Render-blocking CSS — `dde8ec8d106edc50.css`
9081 bytes, ~178ms wasted render-blocking time. Contributes to the LCP delay above; listed separately because it's independently actionable (defer/inline-critical-CSS fix is a discrete, low-effort change).

## Recommendations (prioritized by expected impact)

1. **(HIGH, fixes CLS on /estilos)** Reserve layout space for product/style grid cards before content loads — use fixed aspect-ratio containers or skeleton placeholders sized to match final card dimensions (548px height observed) so the grid doesn't reflow when card content/data arrives. Expected impact: CLS 0.245 → likely <0.05, moving /estilos from "Poor" border to "Good."
2. **(HIGH, fixes LCP across all pages)** Optimize the LCP hero image: compress and serve via `next/image` with `quality` tuning and WebP/AVIF (target the cited ~41KB savings), and inline/defer the render-blocking CSS chunk (extract critical CSS for above-the-fold, defer the rest). Combined expected impact: LCP reduction of 300–500ms+ across pages, pushing Home/galeria/rickmorty toward the 2.5s "Good" threshold.
3. **(MEDIUM)** Lazy-load Stripe JS — only inject `js.stripe.com/v3` on checkout/cart pages or on user interaction (e.g., dynamic `import()` triggered by "Buy"/"Checkout" click), not globally. Saves 236KB transfer + 73ms main-thread time on non-checkout pages, improving TBT/INP risk margin.
4. **(MEDIUM)** Adjust JS transpilation target (browserslist `.browserslistrc` or `next.config` target) to drop unnecessary `Array.prototype.at` polyfill — saves ~11KB per page load across the whole site.
5. **(LOW)** Confirm render-blocking CSS fix is captured by recommendation #2; if treated separately, use `<link rel="preload">` + media-based loading or critical-CSS extraction for the 178ms blocking window.

## Data Caveats
- All metrics above are **lab data** (single Lighthouse 13.0 run per page), not CrUX field data (28-day real-user percentiles). No CrUX/PageSpeed Insights API data was available in this pass — recommend running `pagespeed_check.py` against negasva.shop to validate against real-user 75th-percentile data before treating lab LCP numbers as ship-blocking.
- TBT is reported as an INP proxy; true INP requires field data and was not directly measurable from these Lighthouse JSON exports.
