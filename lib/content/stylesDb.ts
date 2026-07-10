import { createAnonClient } from '@/lib/supabase/server';
import { STYLES_CONTENT, getStyleBySlug, DB_SLUG_TO_URL } from './styles';

// Lectura pública (ISR) de los estilos gestionados en el admin
// (tabla portrait_styles). La home lee los `show_in_home`; la landing
// /styles/[slug] fusiona la fila de BD (imagen/nombre/descripción editables)
// sobre el copy SEO de lib/content/styles.ts. Si la BD no responde, se cae al
// contenido en código, así el SEO nunca desaparece.

export interface DbStyle {
  slug: string;
  landing_slug: string | null;
  name: string;
  description: string | null;
  example_image_url: string | null;
}

/** URL de la landing de una fila de BD: landing_slug, o el mapa dbSlug→url, o el propio slug. */
export function landingUrlFor(s: Pick<DbStyle, 'slug' | 'landing_slug'>): string {
  return s.landing_slug || DB_SLUG_TO_URL[s.slug] || s.slug;
}

/**
 * Imagen canónica de un estilo — la MISMA en home, /styles y wizard:
 * example_image_url de BD → imagen del contenido en código → fallback.
 */
export function styleImageFor(
  s: Pick<DbStyle, 'slug' | 'landing_slug' | 'example_image_url'>,
): string {
  return s.example_image_url || getStyleBySlug(landingUrlFor(s))?.image || '/backgrounds/rm-1.webp';
}

/** Mapa slug-de-landing → imagen resuelta (todas las filas de BD), para /styles. */
export async function getStyleImageMap(): Promise<Record<string, string>> {
  const db = createAnonClient();
  if (!db) return {};
  try {
    const { data } = await db
      .from('portrait_styles')
      .select('slug, landing_slug, example_image_url');
    return Object.fromEntries((data ?? []).map((s) => [landingUrlFor(s), styleImageFor(s)]));
  } catch {
    return {};
  }
}

export interface HomeStyleCard {
  key: string;
  name: string;
  href: string;
  image: string;
  imageAlt: string;
}

/**
 * Tarjetas de la grilla "Pick your style" de la home: SOLO los estilos
 * realmente disponibles en /order (is_active = true). El resto sigue accesible
 * vía "See all styles" (/styles) y conserva su landing SEO.
 */
export async function getHomeStyles(): Promise<HomeStyleCard[]> {
  const db = createAnonClient();
  if (db) {
    try {
      const { data } = await db
        .from('portrait_styles')
        .select('slug, landing_slug, name, example_image_url')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name');
      if (data && data.length > 0) {
        return data.map((s) => {
          const url = landingUrlFor(s);
          return {
            key: s.slug,
            name: s.name,
            href: `/styles/${url}`,
            image: styleImageFor(s),
            imageAlt: getStyleBySlug(url)?.imageAlt || `${s.name} custom portrait`,
          };
        });
      }
    } catch {
      /* fallback abajo */
    }
  }
  // Fallback: el catálogo en código.
  return STYLES_CONTENT.map((s) => ({
    key: s.dbSlug,
    name: s.name,
    href: `/styles/${s.slug}`,
    image: s.image,
    imageAlt: s.imageAlt,
  }));
}

/** Fila de BD de un estilo por su slug de landing (o wizard slug). null si no existe. */
export async function getLandingStyle(landingSlug: string): Promise<DbStyle | null> {
  // El slug viene de la URL: solo [a-z0-9-] antes de construir el filtro PostgREST.
  if (!/^[a-z0-9-]+$/.test(landingSlug)) return null;
  const db = createAnonClient();
  if (!db) return null;
  try {
    const { data } = await db
      .from('portrait_styles')
      .select('slug, landing_slug, name, description, example_image_url')
      .or(`landing_slug.eq.${landingSlug},slug.eq.${landingSlug}`)
      .limit(1);
    return data?.[0] ?? null;
  } catch {
    return null;
  }
}
