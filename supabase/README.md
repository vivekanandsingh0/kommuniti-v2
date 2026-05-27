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

---

# Supabase setup — KO Reads

## One-time setup

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**
2. Paste the contents of `koreads_schema.sql` and click **Run**
3. Paste the contents of `koreads_phase1_schema.sql` and click **Run**
4. From the project root:

```bash
npm run setup:koreads
```

## Tables

| Table | Purpose |
|-------|---------|
| `koreads_authors` | Admin-created author profiles linked to existing users |
| `koreads_books` | Book metadata, visibility, tags, homepage curation, publish status |
| `koreads_chapters` | Editable chapters; inline contribution toggle; optional `scheduled_at` |
| `koreads_tasks` | Bounty tasks inside a book (title, cover, research, etc.) |
| `koreads_task_submissions` | User submissions on bounty tasks |
| `koreads_contributions` | Reader highlights, comments, author/admin responses, statuses, rewards |
| `koreads_book_follows` | Users following a book for updates |
| `ko_coin_transactions` | Reward ledger for contributions, task bounties, and author grants |

Public users can read published content and submit their own contributions. Authors manage assigned books through `/author`. Admins manage everything through `/admin/koreads`.
