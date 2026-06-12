import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { CurrencyProvider } from "@/lib/currency/CurrencyContext";
import InstagramFloat from "@/components/InstagramFloat";
import EmailCapturePopup from "@/components/EmailCapturePopup";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FF9EC5',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://negasva.shop'),
  title: {
    default: 'NEGASVA — Tu Retrato Animado Personalizado desde $20',
    template: '%s | NEGASVA',
  },
  description:
    'Transforma tu foto en un personaje de caricatura: Rick & Morty, Los Simpsons, Gravity Falls, Padrinos Mágicos y más. Entrega en 48h, desde $20 USD.',
  keywords: [
    'retrato animado', 'retrato personalizado', 'ilustración personalizada',
    'caricatura personalizada', 'regalo original', 'retrato rick y morty',
    'retrato simpsons', 'cartoon portrait', 'custom art', 'gravity falls',
  ],
  alternates: {
    canonical: '/',
    languages: { es: '/', en: '/', fr: '/', 'x-default': '/' },
  },
  openGraph: {
    type: 'website',
    url: 'https://negasva.shop',
    siteName: 'NEGASVA',
    title: 'NEGASVA — Tu Retrato Animado Personalizado desde $20',
    description:
      'Transforma tu foto en un personaje de caricatura icónico. Rick & Morty, Simpsons, Gravity Falls y más. Entrega en 48 horas.',
    images: [{ url: '/backgrounds/rm-1.jpg', width: 1200, height: 630, alt: 'NEGASVA — Retratos animados personalizados' }],
    locale: 'es_CO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEGASVA — Tu Retrato Animado Personalizado desde $20',
    description:
      'Transforma tu foto en un personaje de caricatura icónico. Entrega en 48 horas, desde $20 USD.',
    images: ['/backgrounds/rm-1.jpg'],
  },
  robots: { index: true, follow: true },
};

const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  // OnlineStore es subtipo de Organization/LocalBusiness pensado para
  // negocios 100% online — activa señales regionales sin dirección física.
  '@type': 'OnlineStore',
  name: 'NEGASVA',
  url: 'https://negasva.shop',
  logo: 'https://negasva.shop/favicon.png',
  description:
    'Retratos animados personalizados dibujados a mano: Rick & Morty, Los Simpsons, Gravity Falls y Padrinos Mágicos. Entrega digital en 48 horas.',
  areaServed: ['Colombia', 'España', 'México', 'Estados Unidos'],
  priceRange: '$20-$160',
  sameAs: ['https://instagram.com/negasva', 'https://tiktok.com/@negasva'],
};

const PRODUCT_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Retrato Animado Personalizado',
  description:
    'Retrato digital personalizado en estilo de caricatura: Rick & Morty, Los Simpsons, Gravity Falls y más. Entrega en 48 horas.',
  brand: { '@type': 'Brand', name: 'NEGASVA' },
  image: 'https://negasva.shop/backgrounds/rm-1.jpg',
  offers: {
    '@type': 'AggregateOffer',
    url: 'https://negasva.shop/order',
    priceCurrency: 'USD',
    lowPrice: '20',
    highPrice: '160',
    availability: 'https://schema.org/InStock',
  },
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '5.0', ratingCount: '1000' },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PRODUCT_SCHEMA) }}
        />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
            >
              {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`}
            </Script>
          </>
        )}
        {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
          <Script
            src={`https://www.recaptcha.net/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className={`${montserrat.className} min-h-screen flex flex-col bg-white`}>
        <LanguageProvider>
          <CurrencyProvider>
            {children}
            <InstagramFloat />
            <EmailCapturePopup />
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
