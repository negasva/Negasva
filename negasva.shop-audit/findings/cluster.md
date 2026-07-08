# Content Cluster Analysis — negasva.shop/blog

**Method note:** Live fetch of negasva.shop and SERP-overlap tooling were unavailable
in this session (site too new/small to be indexed by search, and direct page fetch
was blocked). This is a **reasoned manual topic-map analysis** based on the provided
URL slugs, site structure (pillar candidates `/estilos`, `/precios`; styles: Rick y
Morty, Simpsons, Gravity Falls, Padrinos Mágicos), and standard Spanish-language
e-commerce search intent for custom cartoon portraits. No SERP-overlap scoring matrix
was run — recommend re-running with live data once the site has indexable traffic.

## 1. Existing Posts — Intent Classification

| URL slug | Inferred topic | Intent |
|---|---|---|
| `/ideas-para-regalar-un-retrato-animado` | Gift ideas, general | Commercial |
| `/como-elegir-el-estilo-de-tu-retrato` | Style selection guide | Commercial/Informational |
| `/rick-y-morty-vs-simpsons-que-estilo-elegir` | Style comparison | Commercial |
| `/consejos-para-fotos-perfectas` | Photo prep tips | Informational |
| `/el-proceso-detras-de-cada-retrato` | Process/trust-building | Informational |
| `/retratos-familiares-personalizados` | Family portraits use-case | Commercial |

No navigational keywords present — all 6 posts are usable for clustering.

## 2. Hub-and-Spoke Coherence Assessment

**Current state: weak/partial cluster, not a true hub-and-spoke.**

- `/estilos` and `/precios` are plausible pillars but **none of the 6 posts
  explicitly link back to them by design intent** — slugs suggest the posts were
  written as standalone blog ideas, not spokes engineered around a pillar.
- Two posts (`como-elegir-el-estilo-de-tu-retrato`, `rick-y-morty-vs-simpsons-que-estilo-elegir`)
  cluster naturally under an **"Estilos" pillar** — strong topical overlap, both
  answer "which style should I choose," moderate cannibalization risk (see below).
- `ideas-para-regalar-un-retrato-animado` and `retratos-familiares-personalizados`
  cluster under a **"Ocasiones/Regalo" theme** — but this theme has no pillar page
  today (no `/ocasiones` or `/regalos` hub exists), only product-level `/precios`.
  These two posts are currently orphaned spokes.
- `consejos-para-fotos-perfectas` and `el-proceso-detras-de-cada-retrato` are
  **trust/conversion-support content** (how it works, how to submit photos) — these
  should spoke into `/precios` and the checkout/order flow, not into `/estilos`.

**Verdict:** the blog has the *raw material* for 2 small clusters (Estilos cluster,
Regalo/Ocasiones cluster) plus 2 conversion-support posts, but the architecture is
not yet built — internal links connecting posts to `/estilos` and `/precios` are
not evidenced and should be audited directly in the CMS/templates.

## 3. Cannibalization Check

| Pair | Risk | Rationale |
|---|---|---|
| `como-elegir-el-estilo-de-tu-retrato` vs `rick-y-morty-vs-simpsons-que-estilo-elegir` | **Moderate** | Both target "qué estilo elegir" intent. Differentiate clearly: the first should be the broad style-selection guide (spoke to `/estilos` pillar covering all 4 styles), the second a narrow head-to-head comparison (spoke to the first, not a competing pillar). Add a clear canonical primary-keyword split: general post owns "cómo elegir estilo retrato personalizado"; comparison post owns "rick y morty vs simpsons estilo". |
| `ideas-para-regalar-un-retrato-animado` vs `retratos-familiares-personalizados` | Low | Different angles (general gift ideas vs. family-specific use case) — no overlap risk, but both should link to each other and to a shared (currently missing) gift/occasion pillar. |
| All others | Low | Distinct topics (process, photo tips). |

## 4. Gaps Identified

Missing high-intent content for this niche (Spanish-language, gift-occasion driven
e-commerce):

1. **`regalo de cumpleaños personalizado caricatura`** — no post targets birthday-gift
   intent specifically; high commercial intent, likely strong seasonal search volume.
2. **`regalo de aniversario caricatura personalizada`** — no anniversary-gift content;
   distinct occasion from birthday/family, should be its own spoke.
3. **`regalo San Valentín retrato personalizado`** — seasonal opportunity, none exists.
4. **`Gravity Falls` and `Padrinos Mágicos` dedicated content** — current comparison
   post only covers Rick y Morty vs. Simpsons; the other two styles (2 of 4 product
   lines) have zero blog support. Risk: these style pages may rank/convert worse
   with no supporting content driving traffic/internal links to them.
5. **No dedicated FAQ/comparison spoke for "precio retrato personalizado"** (pricing
   objection-handling content) distinct from the transactional `/precios` page itself.
6. **No occasion-based pillar** (`/regalos` or `/ocasiones`) to organize the two
   existing gift-intent posts plus the 3 missing occasion posts above.

## 5. Recommended Architecture (lightweight, 6→10 posts)

- **Pillar A: `/estilos`** (existing page)
  - Spoke: `como-elegir-el-estilo-de-tu-retrato` (mandatory link to pillar)
  - Spoke: `rick-y-morty-vs-simpsons-que-estilo-elegir` (links to pillar + new Gravity Falls/Padrinos Mágicos spoke)
  - **Gap spoke to add:** `gravity-falls-vs-padrinos-magicos-cual-elegir` or similar, completing style coverage.

- **Pillar B (new, recommended): `/regalos` or `/ideas-de-regalo`**
  - Spoke: `ideas-para-regalar-un-retrato-animado`
  - Spoke: `retratos-familiares-personalizados`
  - **Gap spokes to add:** `regalo-cumpleanos-personalizado`, `regalo-aniversario-caricatura`
  - All spokes link to `/precios` (transactional) and to Pillar A where style is discussed.

- **Conversion-support content (link into `/precios` and checkout, not a thematic pillar):**
  - `consejos-para-fotos-perfectas`
  - `el-proceso-detras-de-cada-retrato`
  - These should be linked from `/precios` and from every spoke's CTA section ("antes de pedir, lee esto").

## 6. Internal Linking Opportunities (current gaps)

- No evidence of `/estilos` linking down to either style-selection blog post — add now.
- No evidence of `/precios` linking to the process/photo-tips posts — these reduce
  pre-purchase anxiety and should sit right above the price table or CTA.
- Style comparison post should deep-link to the specific style sub-sections/anchors
  on `/estilos` (e.g., `/estilos#rick-y-morty`) rather than just the index, if such
  anchors exist.
- Add a "Regalos" or "Ocasiones" entry to main blog/nav taxonomy once 3+ occasion
  posts exist, to avoid orphaning them.

## 7. Validation Checklist Results

- [x] No two posts currently share an identical primary keyword (moderate overlap risk on the two style-selection posts, flagged above, not a true duplicate)
- [ ] Cannot confirm 3+ incoming internal links per spoke — not verifiable without live page fetch; recommend manual CMS audit
- [ ] Cannot confirm spoke→pillar / pillar→spoke links exist — not verifiable without live page fetch; recommend manual CMS audit
- [x] No orphan pages among the 6 posts themselves (all thematically assignable)
- [x] Template/intent match is reasonable for existing posts
- [N/A] Word counts — not assessed (content not fetched)
- [x] Cluster count (2 clusters + 1 support group) within lightweight constraints for a 6-post blog
