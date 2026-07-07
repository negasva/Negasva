import { NextResponse } from 'next/server';
import { requireAdminRoute } from '@/lib/admin/auth';
import { errorResponse, rateLimitByIp, validateSameOrigin } from '@/lib/security/apiHelpers';

// Admin image upload. Replaces the old browser-side supabase.storage call that
// relied on a Supabase Auth JWT — with single-password auth the browser has no
// Supabase session, so uploads go through here using the service client (RLS
// bypassed) gated by the admin cookie.

const BUCKET = 'backgrounds';
const MAX_BYTES = 10 * 1024 * 1024; // matches the bucket's 10 MB limit
// 'image/jpg' is a non-standard alias some browsers/OS report for JPEG files.
const MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
// Supabase storage requires the canonical type; normalise before uploading.
const MIME_NORM: Record<string, string> = { 'image/jpg': 'image/jpeg' };

export async function POST(request: Request) {
  if (!validateSameOrigin(request)) return errorResponse('Invalid origin', 403);
  // Límite alto: la subida masiva de la galería dispara muchas subidas seguidas.
  const rl = await rateLimitByIp(request, { prefix: 'admin-upload', max: 120, windowMs: 60_000 });
  if (rl) return rl;

  const db = await requireAdminRoute();
  if (!db) return errorResponse('Unauthorized', 401);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse('Invalid body', 400);
  }

  const file = form.get('file');
  if (!(file instanceof File)) return errorResponse('No file', 400);
  if (!MIME.includes(file.type)) return errorResponse('Tipo no permitido (JPG, PNG, WEBP)', 400);
  if (file.size > MAX_BYTES) return errorResponse('Archivo muy grande (max 10MB)', 400);

  const contentType = MIME_NORM[file.type] ?? file.type;
  const folderRaw = form.get('folder');
  const folder = (typeof folderRaw === 'string' ? folderRaw : 'uploads').replace(/[^a-z0-9_-]/gi, '') || 'uploads';
  // Normalise extension so .jpg files are stored consistently.
  const rawExt = (file.name.split('.').pop() || 'jpg').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'jpg';
  const ext = rawExt === 'jpg' ? 'jpg' : rawExt;
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await db.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType, cacheControl: '3600', upsert: false });
  if (error) {
    const msg = typeof error.message === 'string' ? error.message : '';
    const publicMsg = msg.includes('mime') || msg.includes('type')
      ? 'Tipo de archivo rechazado por el bucket de storage'
      : msg.includes('size') || msg.includes('limit')
      ? 'Archivo demasiado grande para el bucket de storage'
      : msg.includes('not found') || msg.includes('bucket')
      ? 'Bucket de storage no encontrado — ejecuta la migración 009'
      : 'Error al subir imagen al storage';
    return errorResponse(publicMsg, 500, error);
  }

  const { data } = db.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
