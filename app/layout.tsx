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
    default: "NEGASVA - Tu Retrato Animado Personalizado desde $20",
    template: "%s | NEGASVA",
  },
  description:
    "Retratos personalizados dibujados a mano en estilos cartoon, familiares, sci-fi y fantasia. Entrega digital en 48h, desde $20 USD.",
  keywords: [
    "retrato animado",
    "retrato personalizado",
    "ilustracion personalizada",
    "caricatura personalizada",
    "regalo original",
    "retrato cartoon",
    "retrato familiar personalizado",
    "cartoon portrait",
    "custom art",
    "estilo cartoon fantasia",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://negasva.shop",
    siteName: "NEGASVA",
    title: "NEGASVA - Tu Retrato Animado Personalizado desde $20",
    description:
      "Convierte tu foto en un retrato digital personalizado, dibujado a mano y listo para regalar. Entrega en 48 horas.",
    images: [
      {
        url: "/backgrounds/rm-1.jpg",
        width: 1200,
        height: 630,
        alt: "NEGASVA - Retratos animados personalizados",
      },
    ],
    locale: "es_CO",
  },
  twitter: {
    card: "summary_large_image",
    title: "NEGASVA - Tu Retrato Animado Personalizado desde $20",
    description:
      "Transforma tu foto en un personaje de caricatura iconico. Entrega en 48 horas, desde $20 USD.",
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
  name: "NEGASVA",
  url: "https://negasva.shop",
  logo: "https://negasva.shop/favicon.png",
  description:
    "Retratos personalizados dibujados a mano en estilos cartoon, familiares, sci-fi y fantasia. Entrega digital en 48 horas.",
  areaServed: ["Colombia", "Espana", "Mexico", "Estados Unidos"],
  priceRange: "$20-$160",
  sameAs: ["https://instagram.com/negasva", "https://tiktok.com/@negasva"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
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
