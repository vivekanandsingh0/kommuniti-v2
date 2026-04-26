import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qhwdpchkguyurbefddjy.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFod2RwY2hrZ3V5dXJiZWZkZGp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEyMjIzNSwiZXhwIjoyMDkyNjk4MjM1fQ._0ij3-pRAKoztendwkOM9FJtU8KhOr2q-Xb5Mo7fAmw";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkUsers() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error listing users:', error);
  } else {
    console.log('Users found:', data.users.length);
    console.log(JSON.stringify(data.users, null, 2));
  }
}

checkUsers();
