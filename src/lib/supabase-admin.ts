import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

/**
 * @deprecated Do NOT set VITE_SUPABASE_SERVICE_ROLE_KEY in production Netlify env.
 * Admin CMS uses authenticated RLS via adminDb (@/lib/admin-db) instead.
 * This client remains for legacy/dev tooling only.
 */
if (import.meta.env.PROD && supabaseServiceKey) {
  console.warn(
    "[SECURITY] VITE_SUPABASE_SERVICE_ROLE_KEY is exposed in the browser bundle. Remove it from Netlify env vars."
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl || "",
  supabaseServiceKey || "missing-service-key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      storageKey: "kommuniti-admin-token",
    },
  }
);
