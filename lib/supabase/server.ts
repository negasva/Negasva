import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export function createServerClient() {
  return createServerComponentClient({ cookies });
}

export function createRouteClient() {
  return createRouteHandlerClient({ cookies });
}
