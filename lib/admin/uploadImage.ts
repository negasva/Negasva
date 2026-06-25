// Client helper: upload an image through the admin API route (service-client +
// cookie auth) and return its public URL. Throws with a readable message on
// failure. Replaces the per-page browser-side supabase.storage calls.
export async function uploadAdminImage(file: File, folder: string): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('folder', folder);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Error al subir imagen');
  }
  const { url } = await res.json();
  return url as string;
}
