import { supabase } from "@/lib/supabase";

/**
 * Authenticated Supabase client for admin CMS.
 * Requires profiles.is_admin = true — enforced by RLS (see supabase/admin_security.sql).
 * Do NOT use the service role key in the browser.
 */
export const adminDb = supabase;
