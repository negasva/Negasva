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

// Bypasses RLS — only for server-side trusted operations (webhooks, crons)
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
