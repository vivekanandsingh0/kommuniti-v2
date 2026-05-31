import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: "kommuniti-user-token",
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Avoid Navigator Lock API contention when multiple requests run at once (common in React dev).
    lock: async (_name, _acquireTimeout, fn) => fn(),
  },
});
