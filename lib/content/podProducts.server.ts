import { createAnonClient } from '@/lib/supabase/server';
import { DEFAULT_POD_PRODUCTS, mergePodProducts, type PodProductConfig } from './podProducts';

/** Lee la presentación de productos POD desde landing_config ('pod_products'). */
export async function getPodProductsConfig(): Promise<PodProductConfig[]> {
  const db = createAnonClient();
  if (!db) return DEFAULT_POD_PRODUCTS;
  try {
    const { data } = await db
      .from('landing_config')
      .select('value')
      .eq('key', 'pod_products')
      .limit(1);
    return mergePodProducts(data?.[0]?.value);
  } catch {
    return DEFAULT_POD_PRODUCTS;
  }
}
