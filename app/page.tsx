'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronDown, Palette, Users, Image as ImageIcon, Camera, Sparkles, Tag } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAutoTranslate } from '@/lib/i18n/useAutoTranslate';
import { useCurrency } from '@/lib/currency/CurrencyContext';
import { cachedFetchJSON } from '@/lib/cache/clientCache';
import Navbar from '@/components/Navbar';
import PageFooter from '@/components/PageFooter';
import TestimonialsScroll from '@/components/TestimonialsScroll';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';

// ── Tipos y defaults (fallback si /api/landing-config no responde) ──────────

interface HeroConfig {
  badge_es: string; badge_en: string; badge_fr?: string;
  headline_es: string; headline_en: string; headline_fr?: string;
  headline_highlight_es: string; headline_highlight_en: string; headline_highlight_fr?: string;
  subheadline_es: string; subheadline_en: string; subheadline_fr?: string;
  cta_primary_es: string; cta_primary_en: string; cta_primary_fr?: string;
  cta_secondary_es: string; cta_secondary_en: string; cta_secondary_fr?: string;
}
interface StepConfig { step: number; icon: string; title_es: string; title_en: string; title_fr?: string; desc_es: string; desc_en: string; desc_fr?: string; }
interface GalleryImage { url: string; caption: string; }
interface StatConfig { value: string; label_es: string; label_en: string; label_fr?: string; }
interface ApiFaq { id: string; question: string; answer: string; }
interface LandingConfig { hero: HeroConfig; how_it_works: StepConfig[]; gallery_images: GalleryImage[]; stats: StatConfig[]; }
interface BeforeAfterPair { id: string; title: string; style: string | null; image_url: string; before_url: string | null; }

// Par de ejemplo: se usa solo mientras no haya obras reales con foto "antes",
// para que la sección de transformación nunca quede vacía en la landing.
const SAMPLE_PAIR: BeforeAfterPair = {
  id: 'sample', title: '', style: null,
  before_url: '/samples/before-1.svg', image_url: '/samples/after-1.svg',
};

const DEFAULT_CONFIG: LandingConfig = {
  hero: {
    badge_es: '✦ Ilustración digital personalizada', badge_en: '✦ Custom digital illustration', badge_fr: '✦ Illustration numérique personnalisée',
    headline_es: 'Tu Retrato Animado', headline_en: 'Your Personalized', headline_fr: 'Votre Portrait Animé',
    headline_highlight_es: 'Personalizado', headline_highlight_en: 'Animated Portrait', headline_highlight_fr: 'Personnalisé',
    subheadline_es: 'Convierte tu foto en un retrato personalizado dibujado a mano, con estilo cartoon y entrega digital en 48 horas.',
    subheadline_en: 'Turn your photo into a hand-drawn custom cartoon portrait with digital delivery in 48 hours.',
    subheadline_fr: 'Transformez votre photo en portrait cartoon personnalise, dessine a la main et livre en 48 heures.',
    cta_primary_es: 'Pedir mi retrato', cta_primary_en: 'Order my portrait', cta_primary_fr: 'Commander mon portrait',
    cta_secondary_es: 'Ver cómo funciona', cta_secondary_en: 'See how it works', cta_secondary_fr: 'Voir comment ça marche',
  },
  how_it_works: [
    { step: 1, icon: 'palette', title_es: 'Elige tu estilo', title_en: 'Choose your style', title_fr: 'Choisis ton style', desc_es: 'Cartoon sci-fi, familia amarilla, misterio del bosque, fantasia brillante y mas', desc_en: 'Sci-fi cartoon, yellow family, forest mystery, bright fantasy and more', desc_fr: 'Cartoon sci-fi, famille jaune, mystere de foret, fantaisie brillante et plus' },
    { step: 2, icon: 'users', title_es: 'Elige tus personajes', title_en: 'Choose your characters', title_fr: 'Choisis tes personnages', desc_es: 'Selecciona cuántas personas y si quieres retrato de torso o cuerpo completo', desc_en: 'Select how many people and whether you want a torso or full-body portrait', desc_fr: 'Choisis combien de personnes et si tu veux un portrait buste ou corps entier' },
    { step: 3, icon: 'image', title_es: 'Elige el fondo', title_en: 'Choose the background', title_fr: 'Choisis le fond', desc_es: 'Fondos temáticos del estilo elegido, fondo personalizado o sin fondo', desc_en: 'Themed backgrounds from your chosen style, a custom background, or none', desc_fr: 'Fonds thématiques du style choisi, fond personnalisé ou sans fond' },
    { step: 4, icon: 'camera', title_es: 'Sube tus fotos e indicaciones', title_en: 'Upload your photos & instructions', title_fr: 'Téléverse tes photos et consignes', desc_es: 'Cuéntanos poses, orden y detalles. Sube una foto clara de cada persona', desc_en: 'Tell us poses, order and details. Upload a clear photo of each person', desc_fr: 'Indique poses, ordre et détails. Téléverse une photo nette de chaque personne' },
    { step: 5, icon: 'sparkles', title_es: 'Recibe tu retrato', title_en: 'Receive your portrait', title_fr: 'Reçois ton portrait', desc_es: 'En 48 horas recibes tu ilustración digital lista para imprimir y compartir', desc_en: 'In 48 hours you get your digital illustration, ready to print and share', desc_fr: 'En 48 heures, reçois ton illustration numérique prête à imprimer et partager' },
  ],
  gallery_images: [
    { url: '/backgrounds/rm-1.webp', caption: 'Cartoon sci-fi' },
    { url: '/backgrounds/rm-3.webp', caption: 'Laboratorio sci-fi' },
    { url: '/backgrounds/rm-4.webp', caption: 'Aventura espacial' },
    { url: '/backgrounds/rm-5.webp', caption: 'Planeta alienigena' },
    { url: '/backgrounds/rm-6.webp', caption: 'Nave espacial' },
  ],
  stats: [
    { value: '1000+', label_es: 'clientes felices', label_en: 'happy clients', label_fr: 'clients satisfaits' },
    { value: '48h', label_es: 'entrega', label_en: 'delivery', label_fr: 'livraison' },
    { value: '100%', label_es: 'satisfacción', label_en: 'satisfaction', label_fr: 'satisfaction' },
    { value: '4+', label_es: 'estilos', label_en: 'styles', label_fr: 'styles' },
  ],
};

const STEP_ICONS: Record<string, typeof Palette> = {
  palette: Palette,
  users: Users,
  image: ImageIcon,
  camera: Camera,
  sparkles: Sparkles,
};

// Pasos visuales de "Así de fácil" — título corto + imagen de fondo.
const HOW_STEPS = [
  { step: 1, icon: 'palette',  img: '/backgrounds/rm-1.webp', title_es: 'Elige tu estilo',        title_en: 'Choose your style' },
  { step: 2, icon: 'users',    img: '/backgrounds/rm-3.webp', title_es: '¿Cuántos personajes?',   title_en: 'How many characters?' },
  { step: 3, icon: 'image',    img: '/backgrounds/rm-4.webp', title_es: 'Elige el fondo',         title_en: 'Choose the background' },
  { step: 4, icon: 'camera',   img: '/backgrounds/rm-5.webp', title_es: 'Fotos e indicaciones',   title_en: 'Photos & instructions' },
  { step: 5, icon: 'sparkles', img: '/backgrounds/rm-6.webp', title_es: 'Recibe tu retrato ✨',    title_en: 'Receive your portrait ✨' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.5 } }),
};

// Entrada escalonada del hero al cargar la página (no depende del scroll).
const heroItem = (delay: number) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.55, ease: 'easeOut' as const },
});

// Backfill del francés desde los defaults cuando la BD (es/en) no lo trae, para
// que el contenido editable no caiga a inglés/español al elegir francés.
function mergeWithFrench(data: Partial<LandingConfig>): LandingConfig {
  const d = DEFAULT_CONFIG;
  return {
    hero: { ...d.hero, ...data.hero, badge_fr: data.hero?.badge_fr || d.hero.badge_fr, headline_fr: data.hero?.headline_fr || d.hero.headline_fr, headline_highlight_fr: data.hero?.headline_highlight_fr || d.hero.headline_highlight_fr, subheadline_fr: data.hero?.subheadline_fr || d.hero.subheadline_fr, cta_primary_fr: data.hero?.cta_primary_fr || d.hero.cta_primary_fr, cta_secondary_fr: data.hero?.cta_secondary_fr || d.hero.cta_secondary_fr },
    how_it_works: (data.how_it_works?.length ? data.how_it_works : d.how_it_works).map((s, i) => ({
      ...s,
      title_fr: s.title_fr || d.how_it_works[i]?.title_fr,
      desc_fr: s.desc_fr || d.how_it_works[i]?.desc_fr,
    })),
    gallery_images: data.gallery_images?.length ? data.gallery_images : d.gallery_images,
    stats: (data.stats?.length ? data.stats : d.stats).map((s, i) => ({
      ...s,
      label_fr: s.label_fr || d.stats[i]?.label_fr,
    })),
  };
}

export default function Home() {
  const { t, lang } = useLanguage();
  const { fmt } = useCurrency();

  const [config, setConfig] = useState<LandingConfig>(DEFAULT_CONFIG);
  const [faqs, setFaqs] = useState<ApiFaq[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [weeklyOrders, setWeeklyOrders] = useState(0);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [pairs, setPairs] = useState<BeforeAfterPair[]>([]);
  const [activePair, setActivePair] = useState(0);

  useEffect(() => {
    // ttlMs:0 + no-store → el contenido editable del admin se ve al instante
    cachedFetchJSON<Partial<LandingConfig>>('/api/landing-config', { ttlMs: 0, init: { cache: 'no-store' } })
      .then((data) => { if (data) setConfig(mergeWithFrench(data)); })
      .catch(() => null);
    cachedFetchJSON<ApiFaq[]>('/api/faqs')
      .then((data) => { if (Array.isArray(data)) setFaqs(data.slice(0, 5)); })
      .catch(() => null);
    cachedFetchJSON<{ weekly_orders: number }>('/api/public-stats')
      .then((data) => { if (data) setWeeklyOrders(data.weekly_orders); })
      .catch(() => null);
    // Pares antes/después: solo obras con ambas imágenes alimentan el slider.
    cachedFetchJSON<BeforeAfterPair[]>('/api/gallery')
      .then((data) => { if (Array.isArray(data)) setPairs(data.filter((g) => g.before_url && g.image_url)); })
      .catch(() => null);
  }, []);

  // Sticky CTA en mobile: aparece cuando el hero ya salió de pantalla.
  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const orderHref = '/order';
  // Pares reales si existen; si no, el de ejemplo para que la sección no quede vacía.
  const displayPairs = pairs.length > 0 ? pairs : [SAMPLE_PAIR];
  const currentPair = displayPairs[Math.min(activePair, displayPairs.length - 1)];
  const hero = config.hero;
  const heroImage = config.gallery_images[0]?.url ?? '/backgrounds/rm-1.webp';
  // Selección por idioma con fallback fr → en → es.
  const pick = (esVal: string, enVal: string, frVal?: string) =>
    lang === 'fr' ? (frVal || enVal || esVal) : lang === 'en' ? enVal : esVal;
  // Atajo trilingüe para textos inline (los tres son obligatorios).
  const tr = (esVal: string, enVal: string, frVal: string) =>
    lang === 'fr' ? frVal : lang === 'en' ? enVal : esVal;

  // Pasos visuales: títulos editables desde el admin (config.how_it_works) +
  // imagen estática por índice. Así "Paso a paso" del panel se refleja aquí.
  const stepsSource = config.how_it_works?.length ? config.how_it_works : DEFAULT_CONFIG.how_it_works;
  const howSteps = stepsSource.map((s, i) => ({
    step: s.step,
    icon: s.icon,
    title_es: s.title_es,
    title_en: s.title_en,
    title_fr: s.title_fr || DEFAULT_CONFIG.how_it_works[i]?.title_fr,
    img: HOW_STEPS[i]?.img ?? '/backgrounds/rm-1.webp',
  }));

  // FAQ del admin (español) traducida al idioma activo automáticamente.
  const faqFlatSrc = faqs.flatMap((f) => [f.question, f.answer]);
  const { translated: faqFlatTr } = useAutoTranslate(faqFlatSrc);
  const faqsT = faqs.map((f, i) => ({
    ...f,
    question: faqFlatTr[i * 2] ?? f.question,
    answer: faqFlatTr[i * 2 + 1] ?? f.answer,
  }));

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* A — HERO full viewport */}
      <section className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center overflow-hidden">
        <Image src={heroImage} alt={config.gallery_images[0]?.caption ?? 'Negasva'} fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-black/65" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Izquierda: antes y después arrastrable + miniaturas */}
          <motion.div {...heroItem(0)}>
            <BeforeAfterSlider
              key={currentPair.id}
              beforeSrc={currentPair.before_url ?? SAMPLE_PAIR.before_url!}
              afterSrc={currentPair.image_url}
              beforeLabel={tr('Antes', 'Before', 'Avant')}
              afterLabel={tr('Después', 'After', 'Après')}
            />
            {displayPairs.length > 1 && (
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {displayPairs.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePair(i)}
                    aria-label={tr('Ver transformación', 'View transformation', 'Voir la transformation') + (p.title ? ` — ${p.title}` : ` ${i + 1}`)}
                    className={`relative h-14 w-14 rounded-lg overflow-hidden border-2 transition-all ${i === activePair ? 'border-primary scale-105' : 'border-white/40 opacity-70 hover:opacity-100'}`}
                  >
                    <Image src={p.image_url} alt={p.title || `Antes y después ${i + 1}`} fill className="object-cover" sizes="56px" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Derecha: todo el texto del hero + CTA */}
          <div className="text-center md:text-left">
            {/* Parche de precio */}
            <motion.div {...heroItem(0.1)} className="flex justify-center md:justify-start mb-6">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                className="inline-flex items-center gap-2.5 bg-primary rounded-full px-7 py-3.5 shadow-2xl shadow-primary/50 ring-4 ring-white/20 -rotate-2"
              >
                <Tag className="w-5 h-5 text-white" />
                <span className="text-white font-black text-lg sm:text-xl tracking-tight">
                  {tr('Retratos desde', 'Portraits from', 'Portraits dès')} {fmt(20)}
                </span>
              </motion.div>
            </motion.div>

            <motion.h1 {...heroItem(0.2)} className="font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter leading-none mb-5">
              <span className="text-white block">{pick(hero.headline_es, hero.headline_en, hero.headline_fr)}</span>
              <span className="text-primary block">{pick(hero.headline_highlight_es, hero.headline_highlight_en, hero.headline_highlight_fr)}</span>
            </motion.h1>
            <motion.p {...heroItem(0.3)} className="text-base sm:text-lg text-gray-200 leading-relaxed max-w-xl mx-auto md:mx-0 mb-8">
              {pick(hero.subheadline_es, hero.subheadline_en, hero.subheadline_fr)}
            </motion.p>
            <motion.div {...heroItem(0.4)} className="flex flex-col items-center md:items-start gap-4 mb-8">
              <Link href={orderHref} className="inline-flex items-center gap-3 rounded-xl bg-primary px-12 py-5 font-black text-white hover:bg-primary-dark transition-all hover:shadow-2xl hover:scale-105 text-xl sm:text-2xl shadow-xl shadow-primary/40">
                {pick(hero.cta_primary_es, hero.cta_primary_en, hero.cta_primary_fr)}
                <ChevronRight className="w-6 h-6" />
              </Link>
              <a href="#how-it-works" className="inline-flex items-center gap-2 rounded-lg border border-white/60 px-5 py-2.5 font-bold text-white/90 hover:bg-white hover:text-secondary transition-colors text-sm">
                {pick(hero.cta_secondary_es, hero.cta_secondary_en, hero.cta_secondary_fr)}
              </a>
              {weeklyOrders >= 3 && (
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white/90 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5">
                  🔥 {weeklyOrders} {tr('retratos pedidos esta semana', 'portraits ordered this week', 'portraits commandés cette semaine')}
                </span>
              )}
            </motion.div>

            <motion.div {...heroItem(0.5)} className="flex flex-wrap justify-center md:justify-start items-center gap-x-8 gap-y-2 text-white">
              <span><span className="font-black text-xl">1.8M</span> <span className="text-sm text-gray-300">TikTok</span></span>
              <span><span className="font-black text-xl">50K</span> <span className="text-sm text-gray-300">Instagram</span></span>
              <span><span className="font-black text-xl">+1000</span> <span className="text-sm text-gray-300">{tr('clientes', 'clients', 'clients')}</span></span>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-6 z-10 text-white"
          animate={{ opacity: [0.4, 1, 0.4], y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </section>

      {/* B — HOW IT WORKS funcional */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary mb-4">
              {tr('Así de fácil', 'This easy', 'Aussi simple que ça')}
            </h2>
            <p className="text-lg text-secondary-lighter">
              {tr('Empieza tu pedido aquí mismo', 'Start your order right here', 'Commence ta commande ici même')}
            </p>
          </div>

          {/* Desktop: fila de 5 pasos con flechas · Mobile: timeline vertical */}
          <div className="flex flex-col md:flex-row md:items-stretch md:justify-center gap-6 md:gap-0">
            {howSteps.map((s, i) => {
              const Icon = STEP_ICONS[s.icon] ?? Sparkles;
              return (
                <div key={s.step} className="flex md:items-center">
                  {/* Conector vertical en mobile */}
                  {i > 0 && (
                    <div className="md:hidden w-1 bg-primary-lighter rounded-full mr-4 -mt-6 mb-2" />
                  )}
                  <motion.div
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    variants={fadeUp}
                    className="group flex-1 md:w-48 bg-white rounded-2xl border-2 border-primary-lighter hover:border-primary transition-colors overflow-hidden"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={s.img}
                        alt={pick(s.title_es, s.title_en, s.title_fr)}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 200px"
                      />
                      <div className="absolute inset-0 bg-black/35 group-hover:bg-black/15 transition-colors" />
                      <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-primary text-white font-black text-lg flex items-center justify-center shadow-lg">
                        {s.step}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-4">
                      <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                      <h3 className="font-black text-lg text-secondary leading-tight">{pick(s.title_es, s.title_en, s.title_fr)}</h3>
                    </div>
                  </motion.div>

                  {/* Flecha entre pasos — desktop */}
                  {i < howSteps.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.15, duration: 0.4 }}
                      className="hidden md:flex items-center px-1"
                    >
                      <ChevronRight className="w-8 h-8 text-primary" />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link href={orderHref} className="inline-flex items-center gap-2 rounded-lg bg-secondary px-10 py-5 font-black text-white hover:bg-secondary-light transition-all hover:shadow-xl text-lg">
              {tr('Empezar ahora', 'Start now', 'Commencer maintenant')}
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-secondary py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {config.stats.map((stat, i) => (
              <div key={i}>
                <p className="font-black text-4xl text-primary mb-2">{stat.value}</p>
                <p className="text-sm text-secondary-lighter">{pick(stat.label_es, stat.label_en, stat.label_fr)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* C — GALLERY marquee */}
      <section className="py-16 overflow-hidden bg-primary-lighter/30">
        <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary text-center mb-10">
          {tr('Estilos que enamoran', 'Styles you’ll love', 'Des styles qu’on adore')}
        </h2>
        <div className="flex animate-marquee-left hover:[animation-play-state:paused]" style={{ width: 'max-content' }}>
          {[...config.gallery_images, ...config.gallery_images].map((img, i) => (
            <div key={i} className="relative h-[280px] w-[420px] mx-3 rounded-xl overflow-hidden flex-shrink-0">
              <Image src={img.url} alt={img.caption} fill className="object-cover" sizes="420px" />
              <span className="absolute bottom-3 left-3 text-white font-bold text-sm bg-black/50 px-3 py-1.5 rounded-full">
                {img.caption}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* D — Testimonios */}
      <TestimonialsScroll />

      {/* E — Precios */}
      <section className="bg-primary-lighter py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary mb-4">
              {t.home.pricing.title}
            </h2>
            <p className="text-lg text-secondary font-semibold">{t.home.pricing.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="forma-cuadro1 group relative bg-white px-8 pt-12 pb-10 text-center">
              <h4 className="font-black text-secondary text-xl mb-1">{t.home.pricing.one_torso}</h4>
              <p className="text-sm text-secondary-lighter mb-4">{t.home.pricing.one_torso_desc}</p>
              <p className="font-black text-5xl text-primary mb-6">{fmt(15)}</p>
              <Link href={orderHref} className="block rounded-xl bg-secondary px-6 py-4 font-black text-white hover:bg-secondary-light transition-colors">
                {t.home.pricing.cta}
              </Link>
            </div>
            {/* Envoltorio relativo: la etiqueta va FUERA del contenedor
                enmascarado para que el mask-image no la recorte. */}
            <div className="relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-primary text-white text-xs font-black px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                {tr('Más popular', 'Most popular', 'Le plus populaire')}
              </span>
              <div className="forma-cuadro2 group relative bg-white px-8 pt-12 pb-10 text-center">
                <h4 className="font-black text-secondary text-xl mb-1">{t.home.pricing.one_full}</h4>
                <p className="text-sm text-secondary-lighter mb-4">{t.home.pricing.one_full_desc}</p>
                <p className="font-black text-5xl text-primary mb-6">{fmt(25)}</p>
                <Link href={orderHref} className="block rounded-xl bg-primary px-6 py-4 font-black text-white hover:bg-primary-dark transition-colors">
                  {t.home.pricing.cta}
                </Link>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-secondary-lighter">
            {t.home.pricing.background}: +{fmt(15)} · {t.home.pricing.background_desc}
          </p>
        </div>
      </section>

      {/* F — FAQ */}
      {faqs.length > 0 && (
        <section className="py-20 px-4 bg-white">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-secondary text-center mb-10">
              {tr('Preguntas frecuentes', 'Frequently asked questions', 'Questions fréquentes')}
            </h2>
            <div className="space-y-3">
              {faqsT.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border-2 transition-all ${
                      isOpen ? 'border-primary bg-primary-lighter shadow-md' : 'border-primary-lighter bg-white'
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full flex items-center justify-between gap-4 p-5 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="font-bold text-secondary">{item.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-secondary-lighter flex-shrink-0 transition-transform ${isOpen ? 'rotate-180 text-primary' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-secondary-lighter leading-relaxed">{item.answer}</div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-8">
              <Link href="/faq" className="font-bold text-primary hover:text-primary-dark underline underline-offset-4">
                {tr('Ver todas las preguntas', 'See all questions', 'Voir toutes les questions')}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* G — CTA final */}
      <section className="relative bg-secondary overflow-hidden py-20 px-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary opacity-10 rounded-full -mr-40"></div>
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="font-black text-4xl md:text-5xl tracking-tighter text-white mb-6">
            {t.home.cta_final.title}
          </h2>
          <p className="text-lg text-secondary-lighter mb-8">{t.home.cta_final.subtitle}</p>
          <Link
            href={orderHref}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-10 py-5 font-black text-white hover:bg-primary-dark transition-all hover:shadow-2xl text-lg"
          >
            {t.home.cta_final.cta}
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <PageFooter />

      {/* Sticky CTA — solo mobile, aparece tras pasar el hero */}
      <motion.div
        initial={false}
        animate={{ y: showStickyCta ? 0 : 96, opacity: showStickyCta ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white/95 backdrop-blur border-t border-primary-lighter shadow-[0_-4px_20px_rgba(0,0,0,0.12)]"
        style={{ pointerEvents: showStickyCta ? 'auto' : 'none' }}
      >
        <Link
          href={orderHref}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary py-4 font-black text-white text-lg shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
        >
          {tr('Pedir mi retrato', 'Order my portrait', 'Commander mon portrait')} · {tr('desde', 'from', 'dès')} {fmt(20)}
          <ChevronRight className="w-5 h-5" />
        </Link>
      </motion.div>
    </div>
  );
}
