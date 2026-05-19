# Supabase setup — Konnect CMS

## One-time setup

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**
2. Paste the contents of `konnect_schema.sql` and click **Run**
3. From the project root:

```bash
node scripts/seed-konnect.mjs
node scripts/setup-konnect.mjs
```

## Tables

| Table | Purpose |
|-------|---------|
| `konnect_page_settings` | Hero copy, section labels, filter tab labels, accent color |
| `konnect_events` | Event tiles (date, colors, registration URL, session type) |
| `konnect_featured` | Featured workshop banner (pricing, button, colors) |

Public users can **read** published content (RLS). Admin panel uses the **service role** key to create/update/delete.
