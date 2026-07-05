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
      "Custom Cartoon Portraits from Your Photo — Hand-Drawn, No AI • 48h Delivery • From $15 | Negasva",
    template: "%s | Negasva",
  },
  description:
    "Turn your photo into a custom cartoon portrait, 100% hand-drawn by a real artist — no AI. Simpsons, Rick and Morty & more styles. Delivered in 48 hours, from $15.",
  keywords: [
    "custom cartoon portrait",
    "turn photo into cartoon",
    "hand drawn portrait from photo",
    "simpsons style portrait",
    "rick and morty custom portrait",
    "custom couple portrait",
    "custom family portrait",
    "personalized gift portrait",
    "cartoon yourself",
    "no AI portrait",
  ],
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
    images: [
      {
        url: "/backgrounds/rm-1.jpg",
        width: 1200,
        height: 630,
        alt: "Custom cartoon portrait hand drawn from photo — Negasva",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Cartoon Portraits from Your Photo — Hand-Drawn, No AI • 48h • From $15",
    description:
      "Turn your photo into a hand-drawn cartoon portrait by a real artist — no AI. Delivered in 48 hours, from $15.",
    images: ["/backgrounds/rm-1.jpg"],
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
  logo: "https://negasva.shop/favicon.png",
  description:
    "Custom cartoon portraits hand-drawn from your photo by a real artist — no AI. Digital delivery in 48 hours, from $15.",
  areaServed: ["United States", "Europe", "Colombia", "Mexico"],
  priceRange: "$15-$160",
  sameAs: ["https://instagram.com/negasva", "https://tiktok.com/@negasva"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
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
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="zAkVF4nhVT9cGpq+Y87ZNw"
          async
        />
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
