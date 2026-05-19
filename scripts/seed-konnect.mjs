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
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY);

const { count } = await supabase.from("konnect_events").select("*", { count: "exact", head: true });
if (count && count > 0) {
  console.log(`Already ${count} events — skipping seed.`);
  process.exit(0);
}

const events = [
  { sort_order: 1, session_type: "in-person", event_date: "2026-05-08", month_label: "MAY", day_label: "08", category: "Natural Building Methods", title: "Arun Pillai · Kore Zero", icon: "🏗️", tile_color: "#4DC9C9" },
  { sort_order: 2, session_type: "in-person", event_date: "2026-05-15", month_label: "MAY", day_label: "15", category: "Organic Farm-to-Fork", title: "KHDP Farmers Guild", icon: "🌾", tile_color: "#8B1A1A" },
  { sort_order: 3, session_type: "online", event_date: "2026-05-22", month_label: "MAY", day_label: "22", category: "Community Finance 101", title: "Anish Varma · Thrissur", icon: "💰", tile_color: "#7B6FBA" },
  { sort_order: 4, session_type: "in-person", event_date: "2026-06-05", month_label: "JUN", day_label: "05", category: "Tribal Textile Arts", title: "WTDS Artisan Kore", icon: "🧵", tile_color: "#E8823A" },
  { sort_order: 5, session_type: "in-person", event_date: "2026-06-12", month_label: "JUN", day_label: "12", category: "Ayurvedic Kitchen", title: "Dr. Meera Nair · Kottayam", icon: "🌿", tile_color: "#3B8C5E" },
  { sort_order: 6, session_type: "in-person", event_date: "2026-06-19", month_label: "JUN", day_label: "19", category: "Pottery & Clay Work", title: "Binu Thomas · Alappuzha", icon: "🏺", tile_color: "#8B9A2A" },
  { sort_order: 7, session_type: "online", event_date: "2026-07-03", month_label: "JUL", day_label: "03", category: "Digital Storytelling", title: "Sindhu Rajan · Media Kore", icon: "📱", tile_color: "#2C2C2C" },
  { sort_order: 8, session_type: "in-person", event_date: "2026-07-17", month_label: "JUL", day_label: "17", category: "Bamboo Architecture", title: "Bamboo Corp Kerala", icon: "🎋", tile_color: "#6B7B8D" },
];

const { error } = await supabase.from("konnect_events").insert(events);
if (error) {
  console.error("Seed failed:", error.message);
  process.exit(1);
}
console.log(`✅ Seeded ${events.length} Konnect events.`);
