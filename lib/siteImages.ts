// Registro central de imágenes fijas del sitio, editables desde
// /admin/imagenes. Los overrides viven en landing_config bajo la clave
// 'site_images' como { [slotKey]: url }; si no hay override se usa `def`.
export interface SiteImageSlot {
  key: string;
  /** Qué es la imagen, en palabras del sitio. */
  label: string;
  /** Página donde aparece. */
  page: string;
  /** Sección dentro de la página. */
  section: string;
  /** Ruta por defecto (archivo en /public). */
  def: string;
}

export const SITE_IMAGE_SLOTS: SiteImageSlot[] = [
  { key: 'landing_hero_bg',       page: 'Landing (/)', section: 'Header / Hero',   label: 'Fondo del header',                def: '/backgrounds/rm-1.webp' },
  { key: 'landing_before_sample', page: 'Landing (/)', section: 'Header / Hero',   label: 'Antes (slider de ejemplo)',       def: '/samples/before-1.svg' },
  { key: 'landing_after_sample',  page: 'Landing (/)', section: 'Header / Hero',   label: 'Después (slider de ejemplo)',     def: '/samples/after-1.svg' },
  { key: 'landing_how_step_1',    page: 'Landing (/)', section: 'Así de fácil',    label: 'Paso 1 — Elige tu estilo',        def: '/backgrounds/rm-1.webp' },
  { key: 'landing_how_step_2',    page: 'Landing (/)', section: 'Así de fácil',    label: 'Paso 2 — ¿Cuántos personajes?',   def: '/backgrounds/rm-3.webp' },
  { key: 'landing_how_step_3',    page: 'Landing (/)', section: 'Así de fácil',    label: 'Paso 3 — Elige el fondo',         def: '/backgrounds/rm-4.webp' },
  { key: 'landing_how_step_4',    page: 'Landing (/)', section: 'Así de fácil',    label: 'Paso 4 — Fotos e indicaciones',   def: '/backgrounds/rm-5.webp' },
  { key: 'landing_how_step_5',    page: 'Landing (/)', section: 'Así de fácil',    label: 'Paso 5 — Recibe tu retrato',      def: '/backgrounds/rm-6.webp' },
  { key: 'order_body_torso_only', page: 'Pedido (/order)', section: 'Tipo de cuerpo', label: 'Tarjeta Solo Torso',           def: '/body-types/torso_only.webp' },
  { key: 'order_body_full_body',  page: 'Pedido (/order)', section: 'Tipo de cuerpo', label: 'Tarjeta Cuerpo Completo',      def: '/body-types/full_body.webp' },
];

export type SiteImages = Record<string, string>;

/** URL efectiva de un slot: override del admin o default. */
export function siteImg(images: SiteImages | undefined, key: string, fallback?: string): string {
  return images?.[key] || fallback || SITE_IMAGE_SLOTS.find((s) => s.key === key)?.def || '';
}
