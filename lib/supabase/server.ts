import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export function createServerClient() {
  return createServerComponentClient({ cookies });
}

export function createRouteClient() {
  return createRouteHandlerClient({ cookies });
}

// Cliente anónimo sin cookies: para server components públicos con ISR
// (los hubs SEO). Devuelve null si faltan las env vars (p. ej. build sin
// entorno) — el caller usa su contenido fallback.
export function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// Bypasses RLS — only for server-side trusted operations (webhooks, crons)
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
