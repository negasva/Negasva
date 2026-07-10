import { createAnonClient } from '@/lib/supabase/server';
import type { SiteImages } from './siteImages';

/**
 * Lee las imágenes del sitio (landing_config, clave 'site_images') en el
 * servidor, para que la home las sirva en el HTML inicial y el hero no
 * parpadee con el placeholder mientras un fetch cliente llega. Mismo patrón
 * que homeContent.server.ts. Devuelve {} si no hay env o no hay config.
 */
export async function getSiteImages(): Promise<SiteImages> {
  const db = createAnonClient();
  if (!db) return {};
  try {
    const { data } = await db
      .from('landing_config')
      .select('value')
      .eq('key', 'site_images')
      .limit(1);
    return (data?.[0]?.value as SiteImages) ?? {};
  } catch {
    return {};
  }
}
