import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* Server-only Supabase client using the service_role key.
   The browser never talks to Supabase — every read/write goes
   through server components, server actions, or route handlers.

   When the env vars are absent (local dev without a project),
   `supabaseAdmin()` returns null and the app falls back to the
   built-in fixture content. */

let cached: SupabaseClient | null | undefined;

export function supabaseAdmin(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    cached = null;
    return cached;
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function isCmsConfigured() {
  return supabaseAdmin() !== null;
}
