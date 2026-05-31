import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const raw = readFileSync(resolve(root, ".env"), "utf8");
  const env: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    env[trimmed.slice(0, index).trim()] = trimmed
      .slice(index + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = loadEnv();
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY);

const { error } = await supabase.from("about_page_settings").select("id").limit(1);

if (error) {
  if (error.code === "PGRST205" || error.code === "42P01") {
    console.log("\nAbout CMS tables not found.\n");
    console.log("1. Open Supabase Dashboard -> SQL Editor");
    console.log("2. Paste and run: supabase/about_schema.sql");
    console.log("3. Re-run: npm run setup:about\n");
    process.exit(1);
  }
  console.error(error.message);
  process.exit(1);
}

const { count: fieldCount } = await supabase
  .from("volunteer_form_fields")
  .select("*", { count: "exact", head: true });

console.log(`About CMS ready — ${fieldCount ?? 0} volunteer form field(s) configured.`);
