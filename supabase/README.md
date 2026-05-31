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
4. Paste the contents of `koreads_phase2_schema.sql` and click **Run**
5. From the project root:

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
| `koreads_timeline_events` | Version evolution / activity log per book |
| `koreads_polls` / `koreads_poll_votes` | Community decision polls |
| `koreads_fan_theories` / `koreads_theory_upvotes` | Fan theory threads |
| `koreads_behind_story` | Behind-the-story author posts |
| `koreads_story_circles` / `koreads_circle_members` / `koreads_circle_posts` | Story circles |
| `ko_coin_transactions` | Reward ledger for contributions, task bounties, and author grants |

Public users can read published content and submit their own contributions. Authors manage assigned books through `/author`. Admins manage everything through `/admin/koreads`.

---

# Supabase setup — About Us + Volunteer

## One-time setup

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**
2. Paste the contents of `about_schema.sql` and click **Run**
3. Paste the contents of `volunteer_page_schema.sql` and click **Run** (dedicated `/volunteer` page, benefits, roles, role dropdown)
4. Paste the contents of `volunteer_hub_schema.sql` and click **Run** (volunteer profile hub on `/profile` — notices, gigs)

Or if upgrading an existing install, run **`about_volunteer_patch.sql`** once — it includes all volunteer patches above.

## Tables

| Table | Purpose |
|-------|---------|
| `about_page_settings` | Hero, mission, section labels, company info (singleton) |
| `about_pillars` | Kommute / Konnect / Kreate pillar cards |
| `about_stats` | By-the-numbers stats |
| `about_duty_lines` | Mission duty bullet lines |
| `about_voices` | Community testimonial quotes |
| `volunteer_page_settings` | Dedicated volunteer page hero, section labels, CTA copy (singleton) |
| `volunteer_benefits` | Why volunteer cards on `/volunteer` |
| `volunteer_roles` | Open roles — featured on page + dropdown in application form |
| `volunteer_form_settings` | Volunteer form title, copy, open/closed (singleton) |
| `volunteer_form_fields` | Customizable application fields (admin-defined; includes `volunteer_role` dropdown) |
| `volunteer_applications` | Submitted volunteer applications (`preferred_role_id` links to role) |
| `volunteer_member_profiles` | Approved volunteer role, location, availability (shown on profile) |
| `volunteer_notices` | Team updates — all volunteers or individual |
| `volunteer_gigs` | Tasks/gigs assigned to volunteers or open pool |

Public users can **read** About and volunteer page content and **submit** volunteer applications (RLS insert). Admins manage everything through `/admin/about`. Live pages: `/about`, `/volunteer`.

If you already ran an older `about_schema.sql`, run **`about_volunteer_patch.sql`** — it adds volunteer read policy, profile badge, volunteer page tables, and volunteer hub tables.
