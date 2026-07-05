import type { PageDict } from '@/lib/i18n/pageContent';

export const blogContent = {
  es: {
    badge: 'Blog',
    title: 'Guías e Inspiración',
    subtitle:
      'Consejos, historias y novedades del mundo de los retratos animados personalizados.',
    cta_title: '¿Listo para tu retrato?',
    cta_subtitle: 'Desde $15 · Entrega en 48h · +1000 clientes felices',
    cta_button: 'Pedir mi retrato',
  },
  en: {
    badge: 'Blog',
    title: 'Guides & Inspiration',
    subtitle:
      'Tips, stories and news from the world of custom cartoon portraits.',
    cta_title: 'Ready for your portrait?',
    cta_subtitle: 'From $15 · 48h delivery · +1000 happy customers',
    cta_button: 'Order my portrait',
  },
  fr: {
    badge: 'Blog',
    title: 'Guides et inspiration',
    subtitle:
      "Conseils, histoires et nouveautés du monde des portraits animés personnalisés.",
    cta_title: 'Prêt pour votre portrait ?',
    cta_subtitle: 'À partir de 20 $ · Livraison en 48h · +1000 clients satisfaits',
    cta_button: 'Commander mon portrait',
  },
} satisfies PageDict<Record<string, string>>;
