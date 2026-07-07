// Contenido editable de la landing (/). La fuente de verdad es la clave
// 'home_content' de la tabla landing_config (editada en /adminlanding/landing);
// estos defaults son SOLO el fallback si la BD no responde y replican
// exactamente el copy actual de app/page.tsx.
//
// Módulo sin imports de servidor: lo consumen el server component de la home
// (vía lib/content/homeContent.server.ts) y el editor del admin.

export interface HomeStat { value: string; label: string }
export interface HomeStep { title: string; desc: string }
export interface HomeTestimonial {
  name: string;
  comment: string;
  photo: string | null;
  rating?: number;      // 1–5 estrellas (default 5)
  title?: string;       // titular corto opcional
  visible?: boolean;    // oculta la reseña en la home si es false (default true)
}

export interface HomeContent {
  texts: Record<string, string>;
  stats: HomeStat[];
  trust: string[];
  steps: HomeStep[];
  pod_bullets: string[];
  testimonials: HomeTestimonial[];
}

export interface HomeTextField {
  key: string;
  label: string;
  value: string;
  long?: boolean;
}

// Registro de todos los textos simples de la home, agrupados por sección.
// El editor del admin se genera a partir de esta lista; `value` es a la vez
// el default y el copy actual de la landing.
export const HOME_TEXT_SECTIONS: Array<{ section: string; fields: HomeTextField[] }> = [
  {
    section: 'Hero',
    fields: [
      { key: 'hero_badge', label: 'Badge', value: 'Portraits from $15' },
      { key: 'hero_headline', label: 'Titular (parte 1)', value: 'Custom Cartoon Portrait,' },
      { key: 'hero_highlight', label: 'Titular destacado (subrayado)', value: 'Hand-Drawn' },
      { key: 'hero_tail', label: 'Titular (parte final)', value: 'from your photo — no AI.' },
      { key: 'hero_subheadline', label: 'Subtítulo', long: true, value: 'Turn your photo into an iconic cartoon character — Simpsons style, Rick and Morty style and more. 100% hand-drawn by a real artist and delivered in 48 hours, from $15.' },
      { key: 'hero_cta_label', label: 'CTA principal — texto', value: 'Order my portrait →' },
      { key: 'hero_cta_href', label: 'CTA principal — destino', value: '/order' },
      { key: 'hero_cta2_label', label: 'CTA secundario — texto', value: 'See how it works' },
      { key: 'hero_cta2_href', label: 'CTA secundario — destino', value: '#pasos' },
      { key: 'hero_note', label: 'Nota manuscrita', value: 'make them laugh!' },
    ],
  },
  {
    section: 'Pasos (3 simple steps)',
    fields: [
      { key: 'steps_heading', label: 'Título (parte 1)', value: 'Create your personalized gift portrait in' },
      { key: 'steps_highlight', label: 'Título destacado (círculo)', value: '3 simple steps' },
      { key: 'steps_cta_label', label: 'CTA — texto', value: 'Start now →' },
      { key: 'steps_cta_href', label: 'CTA — destino', value: '/order' },
    ],
  },
  {
    section: 'Estilos',
    fields: [
      { key: 'styles_heading', label: 'Título', value: 'Pick Your Cartoon Style' },
      { key: 'styles_subtitle', label: 'Subtítulo', long: true, value: '13 hand-drawn styles — from Simpsons yellow to anime, Ghibli-inspired and Disney-Pixar' },
      { key: 'styles_see_all', label: 'Link "ver todos"', value: 'See all styles →' },
      { key: 'gifts_heading', label: 'Título chips de regalo', value: 'The perfect gift for…' },
    ],
  },
  {
    section: 'Productos (POD)',
    fields: [
      { key: 'pod_badge', label: 'Etiqueta manuscrita', value: 'new' },
      { key: 'pod_heading', label: 'Título (parte 1)', value: 'Your drawing, on anything' },
      { key: 'pod_highlight', label: 'Título destacado (subrayado)', value: 'you want' },
      { key: 'pod_body', label: 'Texto', long: true, value: 'Beyond the digital file, put your custom portrait on real printed products — mugs, t-shirts, canvas and more — shipped to your door.' },
      { key: 'pod_cta_label', label: 'CTA — texto', value: 'See products' },
      { key: 'pod_cta_href', label: 'CTA — destino', value: '/products' },
      { key: 'pod_from_label', label: 'Prefijo de precio en tarjetas', value: 'from' },
    ],
  },
  {
    section: 'Precios',
    fields: [
      { key: 'pricing_heading', label: 'Título', value: 'Transparent Pricing' },
      { key: 'pricing_subtitle', label: 'Subtítulo', value: 'No surprises, no hidden fees' },
      { key: 'pricing_torso_title', label: 'Tarjeta torso — título', value: 'One Person — Torso' },
      { key: 'pricing_torso_sub', label: 'Tarjeta torso — subtítulo', value: 'Bust up to the waist' },
      { key: 'pricing_full_title', label: 'Tarjeta full body — título', value: 'One Person — Full Body' },
      { key: 'pricing_full_sub', label: 'Tarjeta full body — subtítulo', value: 'Full body character' },
      { key: 'pricing_popular_badge', label: 'Badge "más popular"', value: '★ Most popular' },
      { key: 'pricing_cta_label', label: 'CTA de las tarjetas', value: 'Create My Portrait Now →' },
      { key: 'pricing_bg_label', label: 'Nota fondo — etiqueta', value: 'Custom Background' },
      { key: 'pricing_bg_desc', label: 'Nota fondo — descripción', value: 'Custom scene or background' },
    ],
  },
  {
    section: 'Testimonios y FAQ',
    fields: [
      { key: 'faq_heading', label: 'FAQ — título', value: 'Frequently asked questions' },
      { key: 'faq_see_all', label: 'FAQ — link "ver todas"', value: 'See all questions' },
    ],
  },
  {
    section: 'CTA final y barra móvil',
    fields: [
      { key: 'final_heading', label: 'Título (parte 1)', value: 'Ready to turn your photo into' },
      { key: 'final_highlight', label: 'Título destacado (subrayado)', value: 'cartoon art' },
      { key: 'final_body', label: 'Texto', long: true, value: 'Over 1,000 hand-drawn portraits delivered. Have a special idea not in the shop? Write to us — we are here to draw it.' },
      { key: 'final_cta_label', label: 'CTA — texto', value: 'Order my portrait' },
      { key: 'final_cta_href', label: 'CTA — destino', value: '/order' },
      { key: 'final_or', label: 'Separador ("or")', value: 'or' },
      { key: 'final_secondary_label', label: 'Link secundario — texto', value: 'Ask me!' },
      { key: 'final_secondary_href', label: 'Link secundario — destino', value: '/contact' },
      { key: 'sticky_cta_label', label: 'CTA fija móvil — texto', value: 'Order my portrait · from $15' },
    ],
  },
];

const DEFAULT_TEXTS: Record<string, string> = Object.fromEntries(
  HOME_TEXT_SECTIONS.flatMap((s) => s.fields.map((f) => [f.key, f.value])),
);

export const DEFAULT_HOME_CONTENT: HomeContent = {
  texts: DEFAULT_TEXTS,
  stats: [
    { value: '1.8M', label: 'TikTok' },
    { value: '50K', label: 'Instagram' },
    { value: '+1000', label: 'happy clients' },
  ],
  trust: ['Delivered in 48 hours', 'Unlimited revisions', '100% hand-drawn — no AI'],
  steps: [
    { title: 'Choose your style', desc: 'Pick your favourite cartoon style, how many people or pets, and the background you want.' },
    { title: 'Upload your photos', desc: 'A clear photo of each person + your pose and detail instructions.' },
    { title: 'Receive it in 48h', desc: 'Your hand-drawn illustration arrives by email within 48 hours, ready to print and gift.' },
  ],
  pod_bullets: ['Digital file always included', 'Print on demand', 'Shipped to your door'],
  testimonials: [
    { name: 'Maria Gonzalez', comment: 'Mi retrato quedó increíble, la calidad es asombrosa.', photo: null },
    { name: 'Emma Thompson', comment: 'Absolutely stunning! Got my portrait in under 24 hours.', photo: null },
    { name: 'Lucas Muller', comment: 'Incredible quality, so much personality.', photo: null },
    { name: 'Carlos Reyes', comment: 'Perfecto para regalo, mi hermano quedó sin palabras.', photo: null },
    { name: 'Camille Dubois', comment: 'Portrait magnifique, la ressemblance est frappante.', photo: null },
    { name: 'Valentina Sanchez', comment: 'El nivel de detalle es increíble.', photo: null },
    { name: "James O'Brien", comment: 'Best gift ever, my wife cried happy tears.', photo: null },
    { name: 'Alejandro Garcia', comment: 'Capturó perfectamente mi estilo, lo recomiendo al 100%.', photo: null },
    { name: 'Isabella Rossi', comment: 'Sono rimasta senza parole, bellissimo.', photo: null },
    { name: 'Noah Williams', comment: 'My kids absolutely love it.', photo: null },
    { name: 'Sofia Lindstrom', comment: 'My family portrait is now framed on my wall.', photo: null },
    { name: 'Pierre Laurent', comment: 'Le résultat dépasse toutes mes attentes.', photo: null },
    { name: 'Oliver Schneider', comment: 'Every single detail was perfect.', photo: null },
    { name: 'Catalina Herrera', comment: 'El retrato le encantó a toda mi familia.', photo: null },
    { name: 'Sofia Martinez', comment: 'Proceso muy fácil y entrega rápida.', photo: null },
    { name: 'Daniel Kim', comment: 'Great communication and a flawless result.', photo: null },
    { name: 'Laura Pérez', comment: 'Superó lo que imaginaba, volveré a pedir.', photo: null },
    { name: 'Tom Becker', comment: 'Fast, friendly and incredibly talented artists.', photo: null },
    { name: 'Ana Suárez', comment: 'El mejor regalo de aniversario que he dado.', photo: null },
    { name: 'Chloé Martin', comment: 'Très professionnel et rapide, je recommande.', photo: null },
  ],
};

/**
 * Fusiona lo guardado en BD sobre los defaults. Textos: por clave (los vacíos
 * caen al default). Arrays: el override completo sustituye al default si trae
 * elementos; así el admin puede añadir/quitar filas.
 */
export function mergeHomeContent(override: unknown): HomeContent {
  if (!override || typeof override !== 'object') return DEFAULT_HOME_CONTENT;
  const o = override as Partial<HomeContent>;

  const texts = { ...DEFAULT_HOME_CONTENT.texts };
  if (o.texts && typeof o.texts === 'object') {
    for (const [k, v] of Object.entries(o.texts)) {
      if (typeof v === 'string' && v.trim() !== '' && k in texts) texts[k] = v;
    }
  }

  const arr = <T,>(ov: unknown, def: T[]): T[] =>
    Array.isArray(ov) && ov.length > 0 ? (ov as T[]) : def;

  return {
    texts,
    stats: arr(o.stats, DEFAULT_HOME_CONTENT.stats),
    trust: arr(o.trust, DEFAULT_HOME_CONTENT.trust),
    steps: arr(o.steps, DEFAULT_HOME_CONTENT.steps),
    pod_bullets: arr(o.pod_bullets, DEFAULT_HOME_CONTENT.pod_bullets),
    testimonials: arr(o.testimonials, DEFAULT_HOME_CONTENT.testimonials),
  };
}
