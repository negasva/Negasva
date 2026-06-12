/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Gzip/Brotli compression for HTML and API responses.
  compress: true,
  // Drop the `X-Powered-By: Next.js` header (smaller responses, less fingerprinting).
  poweredByHeader: false,
  images: {
    // Allow Next.js image optimization for background/style images served from
    // Supabase Storage. Optimized variants are generated once and cached.
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
    formats: ['image/avif', 'image/webp'],
    // Cache optimized images for 24h before re-validating with the source.
    minimumCacheTTL: 60 * 60 * 24,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  },
  headers: async () => {
    // Content Security Policy. Built to allow the third-parties this app
    // already uses (Google Analytics, reCAPTCHA, Stripe, Supabase) and
    // nothing else. 'unsafe-inline' is required for Next.js bootstrap
    // scripts and Tailwind's injected styles; 'unsafe-eval' is dev-only.
    const cspParts = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${
        process.env.NODE_ENV !== 'production' ? " 'unsafe-eval'" : ''
      } https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://js.stripe.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://api.exchangerate-api.com",
      "frame-src 'self' https://www.google.com https://www.recaptcha.net https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests',
    ];
    const csp = cspParts.join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
      {
        // All API responses are JSON and must never be sniffed as another type.
        source: '/api/:path*',
        headers: [{ key: 'X-Content-Type-Options', value: 'nosniff' }],
      },
      {
        // Sensitive / mutating endpoints (auth, payments, order tracking,
        // newsletter, webhooks) must NEVER be cached. Public read-only
        // endpoints (styles, backgrounds, prices, packages, body-types, rates)
        // are intentionally excluded so the per-route `Cache-Control` headers
        // they set (s-maxage + stale-while-revalidate) survive and get cached
        // by the CDN — fetched from the database once, then served from cache.
        source: '/api/:path(admin|checkout|track|newsletter|webhooks)/:rest*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
      {
        // Static background images are content-addressed by filename and never
        // change in place — cache them aggressively in the browser and CDN.
        source: '/backgrounds/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
