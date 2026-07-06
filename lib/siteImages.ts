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
  /** Tamaño recomendado en píxeles (ancho × alto). */
  recommended: string;
}

export const SITE_IMAGE_SLOTS: SiteImageSlot[] = [
  // Landing actual (app/home-islands.tsx). Sin default: mientras no se suba
  // una imagen, la landing muestra el placeholder "Photo here".
  { key: 'landing_hero_img1', page: 'Landing (/)', section: 'Hero',           label: 'Hero — foto "Before" (original)', def: '', recommended: '500 × 660 px' },
  { key: 'landing_hero_img2', page: 'Landing (/)', section: 'Hero',           label: 'Hero — foto "After" (retrato)',   def: '', recommended: '440 × 580 px' },
  { key: 'landing_paso_img1', page: 'Landing (/)', section: '3 simple steps', label: 'Pasos — foto 1 (retrato estilo)', def: '', recommended: '480 × 640 px' },
  { key: 'landing_paso_img2', page: 'Landing (/)', section: '3 simple steps', label: 'Pasos — foto 2 (retrato pareja)', def: '', recommended: '440 × 600 px' },
  { key: 'order_body_torso_only', page: 'Pedido (/order)', section: 'Tipo de cuerpo', label: 'Tarjeta Solo Torso',         def: '/body-types/torso_only.webp', recommended: '600 × 400 px'   },
  { key: 'order_body_full_body',  page: 'Pedido (/order)', section: 'Tipo de cuerpo', label: 'Tarjeta Cuerpo Completo',    def: '/body-types/full_body.webp',  recommended: '600 × 400 px'   },
];

export type SiteImages = Record<string, string>;

/** URL efectiva de un slot: override del admin o default. */
export function siteImg(images: SiteImages | undefined, key: string, fallback?: string): string {
  return images?.[key] || fallback || SITE_IMAGE_SLOTS.find((s) => s.key === key)?.def || '';
}
