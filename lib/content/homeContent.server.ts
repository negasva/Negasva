import { createAnonClient } from '@/lib/supabase/server';
import { DEFAULT_HOME_CONTENT, mergeHomeContent, type HomeContent } from './homeContent';

/**
 * Lee el contenido de la home desde landing_config ('home_content') y lo
 * fusiona con los defaults del código. La home es estática (ISR); el PATCH de
 * /api/landing-config hace revalidatePath('/') al guardar, así que los cambios
 * del admin se ven en la siguiente petición sin redeploy.
 */
export async function getHomeContent(): Promise<HomeContent> {
  const db = createAnonClient();
  if (!db) return DEFAULT_HOME_CONTENT;
  try {
    const { data } = await db
      .from('landing_config')
      .select('value')
      .eq('key', 'home_content')
      .limit(1);
    return mergeHomeContent(data?.[0]?.value);
  } catch {
    return DEFAULT_HOME_CONTENT;
  }
}
