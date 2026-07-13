# BUENAS PRÁCTICAS — Core Web Vitals (negasva.shop)

Reglas permanentes para cualquier sesión que toque rendimiento de páginas.

1. **Nunca renderices la imagen LCP (hero, primera imagen de una landing) con `<img>` crudo.**
   Usa `next/image` con `priority` y `sizes` correctos; los `remotePatterns` de
   Supabase ya están configurados en `next.config.js`. Si por alguna razón debe ser
   `<img>`, añade `fetchPriority="high"` Y un `<link rel="preload" as="image">`.

2. **Siempre reserva el espacio de todo contenido que llega por fetch cliente.**
   Contenedor con `aspect-ratio`, `min-h` o skeleton del mismo tamaño. Nada que
   aparezca tras un fetch puede empujar contenido ya pintado (ver WeeklyOrdersBadge).

3. **El contenido visible en el primer viewport debe venir en el HTML del servidor.**
   La home es ISR (`revalidate = 300`): si una isla cliente necesita datos, pásalos
   como `initial*` desde el server component (patrón ya usado en `HeroPortraits`),
   no los cargues solo con `useEffect`.

4. **Scripts de terceros: siempre `next/script`.** Analítica no crítica (Ahrefs,
   píxeles) → `strategy="lazyOnload"`; GA → `afterInteractive`; reCAPTCHA solo en
   las páginas que lo usan (patrón `RecaptchaScript` — mantenerlo así).

5. **Fuentes solo vía `next/font` con `display: "swap"`.** Nunca `<link>` a Google
   Fonts. Antes de añadir un peso o familia nueva, justifica por qué.

6. **Nunca agregues librerías al camino crítico de `/order`** (la página que paga
   las facturas). SDKs de pago se cargan en el paso que los usa, no antes.

7. **Al tocar cualquier página del funnel, verifica CWV después del cambio:**
   corre PageSpeed Insights (móvil) sobre la página tocada y compárala con la
   medición anterior. Sin números, el cambio no está verificado.

8. **Mantén RUM activo** (cuando se instale: Vercel Speed Insights o
   `useReportWebVitals` → GA4). Si un cambio lo rompe o lo elimina, es un bug P1.

9. **Un solo fetch por endpoint por página.** Antes de añadir otro
   `cachedFetchJSON('/api/landing-config')`, reutiliza el dato ya cargado.
