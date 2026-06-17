import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'order-photos';

/**
 * List the storage paths of the photos uploaded under a given uploadId folder.
 * Returns [] when there's no folder (e.g. the customer skipped the upload).
 * Used by the Stripe webhook, which only carries the short uploadId in
 * metadata rather than the full path array.
 */
export async function listOrderPhotos(
  supabase: SupabaseClient,
  uploadId?: string | null,
): Promise<string[]> {
  if (!uploadId) return [];
  try {
    const { data, error } = await supabase.storage.from(BUCKET).list(uploadId);
    if (error || !data) return [];
    return data
      .filter((f) => f.id) // skip folder placeholders
      .map((f) => `${uploadId}/${f.name}`);
  } catch {
    return [];
  }
}

/**
 * Create short-lived signed URLs for a set of order-photo paths so the admin
 * view can preview private images without making the bucket public.
 */
export async function signOrderPhotos(
  supabase: SupabaseClient,
  paths: string[],
  expiresInSeconds = 3600,
): Promise<string[]> {
  if (!paths || paths.length === 0) return [];
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(paths, expiresInSeconds);
    if (error || !data) return [];
    return data.map((d) => d.signedUrl).filter(Boolean) as string[];
  } catch {
    return [];
  }
}
