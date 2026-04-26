import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qhwdpchkguyurbefddjy.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFod2RwY2hrZ3V5dXJiZWZkZGp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEyMjIzNSwiZXhwIjoyMDkyNjk4MjM1fQ._0ij3-pRAKoztendwkOM9FJtU8KhOr2q-Xb5Mo7fAmw";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkTables() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.log('Profiles table does not exist or error:', error.message);
  } else {
    console.log('Profiles table exists.');
  }
}

checkTables();
