import { createClient } from "@supabase/supabase-js";

// Single Supabase client built from public env vars.
// We only use the anon (public) key. Access is governed by Row Level Security
// policies defined in supabase/schema.sql, so this key is safe to expose.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Copy .env.local.example to .env.local and fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
