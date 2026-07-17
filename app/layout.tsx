import type { Metadata, Viewport } from "next";
import { Montserrat, Caveat } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { CurrencyProvider } from "@/lib/currency/CurrencyContext";
import SocialFloats from "@/components/SocialFloats";
import EmailCapturePopup from "@/components/EmailCapturePopup";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-caveat",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Que el contenido use toda la pantalla incluida el área del notch en iPhone.
  viewportFit: "cover",
  themeColor: "#FF9EC5",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://negasva.shop"),
  title: {
    default:
      "Custom Cartoon Portraits from Your Photo — Hand-Drawn, No AI | Negasva",
    template: "%s | Negasva",
  },
  description:
    "Turn your photo into a custom cartoon portrait, 100% hand-drawn by a real artist — no AI. Simpsons, Rick and Morty & more styles. Delivered in 48 hours, from $15.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://negasva.shop",
    siteName: "Negasva",
    title: "Custom Cartoon Portraits from Your Photo — Hand-Drawn, No AI • 48h Delivery • From $15",
    description:
      "Turn your photo into a hand-drawn cartoon portrait by a real artist — no AI. Delivered in 48 hours, from $15.",
    // og:image la aporta app/opengraph-image.tsx (convención de archivo).
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Cartoon Portraits from Your Photo — Hand-Drawn, No AI • 48h • From $15",
    description:
      "Turn your photo into a hand-drawn cartoon portrait by a real artist — no AI. Delivered in 48 hours, from $15.",
  },
  robots: { index: true, follow: true },
  // PWA: iOS la abre en modo app (sin barra del navegador) desde "Añadir a
  // pantalla de inicio". El apple-touch-icon lo aporta app/apple-icon.png.
  appleWebApp: {
    capable: true,
    title: "NEGASVA",
    statusBarStyle: "default",
  },
  // Equivalente estándar para Android/Chrome.
  other: {
    "mobile-web-app-capable": "yes",
  },
};

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  name: "Negasva",
  url: "https://negasva.shop",
  logo: "https://negasva.shop/logo-512.png",
  description:
    "Custom cartoon portraits hand-drawn from your photo by a real artist — no AI. Digital delivery in 48 hours, from $15.",
  areaServed: ["United States", "Europe", "Colombia", "Mexico"],
  priceRange: "$15-$160",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "hola@negasva.com",
    availableLanguage: ["English"],
  },
  sameAs: [
    "https://instagram.com/negasva",
    "https://tiktok.com/@negasva",
    "https://www.behance.net/negasva",
  ],
};

// Host de Supabase Storage (de donde salen las fotos del hero servidas por
// <img>, fuera del optimizador de next/image). El preconnect abre la conexión
// TLS antes de que el navegador descubra la imagen, recortando el LCP.
const SUPABASE_ORIGIN = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
      : null;
  } catch {
    return null;
  }
})();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {SUPABASE_ORIGIN && (
          <>
            <link rel="preconnect" href={SUPABASE_ORIGIN} />
            <link rel="dns-prefetch" href={SUPABASE_ORIGIN} />
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }}
        />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`}
            </Script>
          </>
        )}
        {process.env.NEXT_PUBLIC_AHREFS_KEY && (
          <script
            src="https://analytics.ahrefs.com/analytics.js"
            data-key={process.env.NEXT_PUBLIC_AHREFS_KEY}
            async
          />
        )}
        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1699380964607850');
          fbq('track', 'PageView');`}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1699380964607850&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body className={`${montserrat.className} ${montserrat.variable} ${caveat.variable} min-h-screen flex flex-col bg-white`}>
        <LanguageProvider>
          <CurrencyProvider>
            {children}
            <SocialFloats />
            <EmailCapturePopup />
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
