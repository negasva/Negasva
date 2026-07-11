import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createServiceClient } from '@/lib/supabase/server';
import { errorResponse, rateLimitByIp, validateSameOrigin } from '@/lib/security/apiHelpers';
import { getPodProduct } from '@/lib/pricing/products';

/**
 * Post-venta: adjunta al pedido (por provider_reference) las fotos que el
 * cliente no subió en el paso 4, una breve descripción y/o el upsell de
 * versión impresa elegido en la página de éxito.
 *
 * GET  ?ref=…  → { found, hasPhotos } para decidir si mostrar la ventana.
 * POST (form) → reference + photos[] + description + upsell (keys pod).
 *
 * La referencia funciona como token de capacidad: solo la tiene quien pagó
 * (viene en la URL de retorno del proveedor). Las fotos solo se aceptan si el
 * pedido aún no tiene (no se pueden pisar las existentes).
 */

const REF_RE = /^[A-Za-z0-9_-]{6,64}$/;
// Mismos límites que /api/order/upload — duplicados a propósito: los route
// files de Next solo pueden exportar handlers, no constantes compartidas.
const MAX_FILES = 8;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB c/u
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);
const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export async function GET(request: Request) {
  const rl = await rateLimitByIp(request, { prefix: 'attach-status', max: 30, windowMs: 60_000 });
  if (rl) return rl;

  const ref = new URL(request.url).searchParams.get('ref') ?? '';
  if (!REF_RE.test(ref)) return errorResponse('Invalid ref', 400);

  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from('orders')
      .select('photo_paths')
      .eq('provider_reference', ref)
      .maybeSingle();
    if (!data) return NextResponse.json({ found: false, hasPhotos: false });
    return NextResponse.json({ found: true, hasPhotos: (data.photo_paths ?? []).length > 0 });
  } catch (err) {
    return errorResponse('Lookup failed', 500, err);
  }
}

export async function POST(request: Request) {
  if (!validateSameOrigin(request)) return errorResponse('Invalid origin', 403);

  const rl = await rateLimitByIp(request, { prefix: 'attach-photos', max: 10, windowMs: 60_000 });
  if (rl) return rl;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse('Invalid form data', 400);
  }

  const reference = String(form.get('reference') ?? '');
  if (!REF_RE.test(reference)) return errorResponse('Invalid reference', 400);

  const description = String(form.get('description') ?? '').trim().slice(0, 500);
  // Upsell: keys de pod_products separadas por coma; las inválidas se tiran.
  const upsell = String(form.get('upsell') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((k) => k && getPodProduct(k))
    .slice(0, 10);

  const files = form.getAll('photos').filter((f): f is File => f instanceof File);
  if (files.length === 0 && !description && upsell.length === 0) {
    return errorResponse('Nothing to attach', 400);
  }
  if (files.length > MAX_FILES) return errorResponse('Too many photos', 400);
  for (const file of files) {
    if (file.size > MAX_BYTES) return errorResponse('A photo exceeds the 10 MB limit', 400);
    if (!ALLOWED.has(file.type)) return errorResponse('Only JPG, PNG or WEBP images are allowed', 400);
  }

  const supabase = createServiceClient();
  let order: { id: string; photo_paths: string[] | null; special_requests: string | null } | null;
  try {
    const { data } = await supabase
      .from('orders')
      .select('id, photo_paths, special_requests')
      .eq('provider_reference', reference)
      .maybeSingle();
    order = data;
  } catch (err) {
    return errorResponse('Lookup failed', 500, err);
  }
  if (!order) return errorResponse('Order not found', 404);
  if (files.length > 0 && (order.photo_paths ?? []).length > 0) {
    return errorResponse('Photos already attached', 409);
  }

  const update: Record<string, unknown> = {};

  if (files.length > 0) {
    const uploadId = randomUUID();
    const paths: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = `${uploadId}/${i}.${EXT[file.type] ?? 'jpg'}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        const { error } = await supabase.storage
          .from('order-photos')
          .upload(path, buffer, { contentType: file.type, upsert: false });
        if (error) return errorResponse('Failed to store photo', 500, error);
        paths.push(path);
      }
    } catch (err) {
      return errorResponse('Failed to store photo', 500, err);
    }
    update.photo_paths = paths;
    update.upload_id = uploadId;
  }

  // Notas nuevas se ANEXAN a special_requests (visibles en el admin).
  const notes = [
    description ? `Descripción del cliente (post-pago): ${description}` : '',
    upsell.length > 0
      ? `Upsell post-compra: quiere añadir ${upsell.map((k) => getPodProduct(k)!.name.es).join(', ')} (cobrar aparte)`
      : '',
  ].filter(Boolean);
  if (notes.length > 0) {
    update.special_requests = [order.special_requests, ...notes].filter(Boolean).join('\n');
  }

  try {
    await supabase.from('orders').update(update).eq('id', order.id);
  } catch (err) {
    return errorResponse('Failed to update order', 500, err);
  }

  return NextResponse.json({ ok: true });
}
