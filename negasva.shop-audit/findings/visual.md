# Visual Analysis — negasva.shop

**Method:** Real browser screenshots captured via Playwright (Chromium), custom script at exact requested viewports — Desktop 1440x900, Mobile 390x844 (iPhone UA, device pixel ratio 2, touch enabled). NOT static analysis. 10 screenshots saved to `C:\Users\nvz9\Negasva\negasva.shop-audit\screenshots\`:
`home_desktop.png`, `home_mobile.png`, `estilos_desktop.png`, `estilos_mobile.png`, `precios_desktop.png`, `precios_mobile.png`, `order_desktop.png`, `order_mobile.png`, `galeria_desktop.png`, `galeria_mobile.png`.

## Score: 68/100

## Above-the-Fold (Home, mobile 390x844)
- H1 ("Your Personalized Animated Portrait"), value-prop subtext, and primary CTA ("Order my portrait") are all visible without scrolling — this is a genuine strength.
- Secondary CTA ("See how it works") and trust signals (1.8M TikTok, 50K Instagram, +1000 clients) also fit above the fold.
- Eyebrow badge "Portraits from COP$70.000" is a strong, visible price anchor.

## Critical Issue: Mixed-Language Content (EN/ES inconsistency)
This is the single biggest visual/content finding and likely affects SEO relevance signals and user trust:
- Default-rendered UI/headings are in **English** ("Our Styles", "Our Pricing", "Work Gallery", "Order portrait", "One Person — Torso", price in **$** not COP) despite a language switcher showing EN·ES·FR with EN highlighted as active.
- Yet sibling content on the same pages renders in **Spanish** ("Estilo NEGASVA", "El estilo propio y exclusivo de NEGASVA", "Arrastra para ver la transformación", "Antes/Después" labels on the gallery slider, "Ver estilo" button next to an English "Create with this style" button on the same card).
- This same EN/ES mix appears on /estilos, /precios, /galeria, and /order (style names: "Choose Your Style" headline in English, but options "Estilo NEGASVA", "Los Simpsons", "Los Padrinos Mágicos" in Spanish).
- For a site whose audit brief describes it as Spanish-language e-commerce, shipping English as the default locale with incomplete Spanish strings bleeding through is a serious content/i18n bug — confusing for ES-speaking Colombian customers (pricing shown in plain $ rather than localized COP formatting compounds this) and a likely hreflang/duplicate-content risk for SEO if EN is being served to es-CO traffic.

## Mobile Usability
- Hamburger menu present and reachable (top-right, adjacent to "Order portrait" button) on /estilos, /precios, /galeria, /order.
- Home mobile nav only shows the "Order portrait" CTA + hamburger icon — touch targets look adequately sized (≥44px) in both states.
- Style-selection cards on /order (mobile) are large, full-width, well-spaced, and clearly tappable — good touch-target sizing for the conversion-critical flow.
- Base font sizes appear legible (≈16-18px body text) without need to zoom.
- No horizontal scroll observed on any captured mobile screenshot.

## Checkout/Order Flow (/order) — Mobile-Friendliness
- 5-step progress indicator (Style → Body → Background → Details & Photos → Payment) is clear and compact on mobile, taking minimal vertical space.
- Step 1 ("Choose Your Style") content fits within the first ~1.5 screens; style cards stack single-column cleanly on mobile vs. 5-across on desktop — solid responsive behavior.
- "Secure payment with Stripe" trust microcopy is present (seen on desktop step 1) reinforcing checkout trust — confirm it's not cut off on mobile lower viewport.
- Desktop /order (1440x900) leaves large unused whitespace below the step-1 content — not a usability blocker but a missed opportunity to show more progress/trust content above the fold on larger screens.

## Layout Shift (CLS) Risk
- Home page screenshots are substantially heavier (789KB desktop / 542KB mobile PNG) than interior pages (50-130KB), consistent with a large hero illustration/background image. If this image lacks explicit width/height or a Next.js `<Image>` priority/placeholder, it is a likely CLS and LCP risk on the most important landing page.
- Custom display font (rounded sans-serif, e.g. "Your Personalized Animated Portrait") loading via web font without apparent fallback sizing match could cause minor text reflow (FOIT/FOUT) — recommend verifying `font-display: optional/swap` and preloading.
- Interior pages (estilos/precios/galeria/order) are lightweight and showed no visible layout jank in the captured static frame.

## Other Observations
- Consistent branding (NEGASVA wordmark, pink/black palette) across all pages.
- Persistent floating Instagram badge (@negasva) bottom-right on every page — on mobile for /order this sits very close to the last visible card; verify it doesn't overlap tap targets when scrolling step 1 options.
- Pricing page lacks an in-content CTA near the fold beyond the nav-bar "Order portrait" button — relies entirely on persistent header CTA, which is functional but weaker than a dedicated above-the-fold action on a conversion-intent page.
