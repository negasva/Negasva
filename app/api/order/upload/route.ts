import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createServiceClient } from '@/lib/supabase/server';
import { errorResponse, rateLimitByIp, validateSameOrigin } from '@/lib/security/apiHelpers';

/**
 * Receives the customer's reference photos during checkout and stores them in
 * the private `order-photos` bucket. Returns an `uploadId` (folder) and the
 * storage paths, which the wizard threads into /api/checkout so the paid order
 * carries its photos and the illustrator can see them in the admin.
 *
 * Uses the service role to write, so the bucket stays private and no anon
 * storage policy is needed. Files are still validated here (count/size/type).
 */

const MAX_FILES = 8;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB each
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);
const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export async function POST(request: Request) {
  if (!validateSameOrigin(request)) return errorResponse('Invalid origin', 403);

  const rl = await rateLimitByIp(request, { prefix: 'order-upload', max: 10, windowMs: 60_000 });
  if (rl) return rl;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse('Invalid form data', 400);
  }

  const files = form.getAll('photos').filter((f): f is File => f instanceof File);
  if (files.length === 0) return errorResponse('No photos provided', 400);
  if (files.length > MAX_FILES) return errorResponse('Too many photos', 400);

  for (const file of files) {
    if (file.size > MAX_BYTES) return errorResponse('A photo exceeds the 10 MB limit', 400);
    if (!ALLOWED.has(file.type)) return errorResponse('Only JPG, PNG or WEBP images are allowed', 400);
  }

  const uploadId = randomUUID();
  const supabase = createServiceClient();
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

  return NextResponse.json({ uploadId, paths });
}
