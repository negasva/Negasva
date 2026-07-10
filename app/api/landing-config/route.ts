import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createAnonClient, createServiceClient } from '@/lib/supabase/server';
import { requireAdminRoute } from '@/lib/admin/auth';
import { errorResponse, rateLimitByIp, readJson, validateSameOrigin } from '@/lib/security/apiHelpers';

// Solo las claves con lector en la web actual: 'home_content' (textos de la
// home, server component), 'footer' (PageFooter) y 'site_images' (fotos de la
// landing y de /order). Las claves antiguas (hero, how_it_works,
// gallery_images, stats) se retiran — ver CLEANUP.sql.
const ALLOWED_KEYS = ['home_content', 'footer', 'site_images', 'pod_products'];

export async function GET(request: Request) {
  const rl = await rateLimitByIp(request, { prefix: 'pub-landing', max: 60, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = createAnonClient();
  if (!supabase) return errorResponse('Supabase no configurado: falta NEXT_PUBLIC_SUPABASE_URL/ANON_KEY', 503);

  const { data, error } = await supabase
    .from('landing_config')
    .select('key, value');

  // El detalle real (p. ej. "relation landing_config does not exist" → falta la
  // migración 015) viaja al cliente, no solo a los logs del servidor.
  if (error) return errorResponse(`No se pudo leer landing_config: ${error.message}`, 500, error);

  const config: Record<string, unknown> = {};
  for (const row of data ?? []) config[row.key] = row.value;

  // Contenido editable por el admin: no cachear en el edge para que los
  // cambios del panel se reflejen de inmediato en la web.
  return NextResponse.json(config, {
    headers: { 'Cache-Control': 'no-store, must-revalidate' },
  });
}

export async function PATCH(request: Request) {
  if (!validateSameOrigin(request)) return errorResponse('Invalid origin', 403);
  const rl = await rateLimitByIp(request, { prefix: 'admin-landing', max: 30, windowMs: 60_000 });
  if (rl) return rl;

  if (!(await requireAdminRoute())) return errorResponse('Unauthorized', 401);

  const body = await readJson(request);
  if (!body || typeof body !== 'object') return errorResponse('Invalid body', 400);

  const { key, value } = body as { key?: string; value?: unknown };
  if (!key || !ALLOWED_KEYS.includes(key)) return errorResponse('Invalid key', 400);
  if (value === undefined || value === null) return errorResponse('Missing value', 400);

  let db;
  try {
    db = createServiceClient();
  } catch (e) {
    // Env de Supabase incompleta: mensaje explícito de qué falta configurar.
    return errorResponse(e instanceof Error ? e.message : 'Supabase no configurado', 503, e);
  }

  const { error } = await db
    .from('landing_config')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  // El detalle real (tabla inexistente, permisos, etc.) va al cliente para que
  // el admin vea la causa y NO crea que se guardó.
  if (error) return errorResponse(`No se pudo guardar: ${error.message}`, 500, error);

  // La home es estática (ISR): regenerarla ya para que el cambio del admin se
  // vea en la siguiente petición sin esperar al revalidate periódico.
  revalidatePath('/');
  return NextResponse.json({ ok: true });
}
