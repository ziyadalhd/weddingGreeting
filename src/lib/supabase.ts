import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** Both variables are inlined at build time, so this never changes at runtime. */
export const supabaseConfigured = Boolean(url && publishableKey);

let client: SupabaseClient | null = null;

/**
 * The single browser Supabase client, created on first use so a missing
 * environment variable fails at call time instead of breaking the static build.
 */
export function getSupabase(): SupabaseClient {
  if (!url || !publishableKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  client ??= createClient(url, publishableKey);

  return client;
}
