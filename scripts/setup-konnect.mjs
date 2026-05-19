/**
 * Verifies Konnect CMS tables exist.
 * If missing, run supabase/konnect_schema.sql in Supabase SQL Editor first.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const raw = readFileSync(resolve(root, ".env"), "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = loadEnv();
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

const { error } = await supabase.from("konnect_events").select("id").limit(1);

if (error) {
  if (error.code === "PGRST205" || error.code === "42P01") {
    console.log("\n❌ Konnect tables not found.\n");
    console.log("1. Open Supabase Dashboard → SQL Editor");
    console.log("2. Paste and run: supabase/konnect_schema.sql");
    console.log("3. Run: node scripts/seed-konnect.mjs");
    console.log("4. Re-run: node scripts/setup-konnect.mjs\n");
    process.exit(1);
  }
  console.error("Error:", error.message);
  process.exit(1);
}

const { count } = await supabase.from("konnect_events").select("*", { count: "exact", head: true });
console.log(`\n✅ Konnect CMS ready — ${count ?? 0} event(s) in database.`);
if (!count) console.log("   Tip: node scripts/seed-konnect.mjs to load sample events");
console.log("   Admin: /admin/konnect");
console.log("   Public: /konnect\n");
