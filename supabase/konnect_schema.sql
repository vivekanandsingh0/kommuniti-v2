-- Konnect CMS tables — run once in Supabase SQL Editor
-- Dashboard → SQL → New query → paste & run

-- Page copy & labels (singleton)
CREATE TABLE IF NOT EXISTS konnect_page_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  tagline text NOT NULL DEFAULT 'Skill up · Share forward · Earn KO Coins',
  hero_line_1 text NOT NULL DEFAULT 'Konnect.',
  hero_line_2 text NOT NULL DEFAULT 'Learn from your',
  hero_line_3 text NOT NULL DEFAULT 'community.',
  sessions_section_label text NOT NULL DEFAULT '2026 · Upcoming Sessions Across Kores',
  featured_section_label text NOT NULL DEFAULT 'Featured Workshop Series',
  filter_upcoming_label text NOT NULL DEFAULT 'Upcoming',
  filter_online_label text NOT NULL DEFAULT 'Online',
  filter_in_person_label text NOT NULL DEFAULT 'In-Person',
  filter_on_demand_label text NOT NULL DEFAULT 'On-Demand',
  accent_color text NOT NULL DEFAULT '#FF6B35',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Event tiles
CREATE TABLE IF NOT EXISTS konnect_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  session_type text NOT NULL DEFAULT 'in-person'
    CHECK (session_type IN ('online', 'in-person', 'on-demand')),
  event_date date,
  month_label text NOT NULL,
  day_label text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  icon text NOT NULL DEFAULT '📅',
  tile_color text NOT NULL DEFAULT '#4DC9C9',
  registration_url text,
  ko_coins_earned int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Featured workshop banner (singleton)
CREATE TABLE IF NOT EXISTS konnect_featured (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  is_visible boolean NOT NULL DEFAULT true,
  icon text NOT NULL DEFAULT '🌱',
  badge_text text NOT NULL DEFAULT '6-Week Series · Online + In-Person',
  title text NOT NULL DEFAULT 'Regenerative Living Intensive',
  description text NOT NULL DEFAULT 'A comprehensive 6-week programme across natural building, organic farming, community finance, and sustainable living. Facilitated by 6 Kore experts.',
  schedule_text text NOT NULL DEFAULT 'Every Saturday, 6 weeks',
  seats_text text NOT NULL DEFAULT '20 seats remaining',
  ko_coins_text text NOT NULL DEFAULT 'Earn 500 KO Coins',
  price_inr text NOT NULL DEFAULT '₹3,500',
  price_ko_coins text NOT NULL DEFAULT 'or 875 KO Coins',
  button_label text NOT NULL DEFAULT 'Book Now',
  button_url text,
  button_color text NOT NULL DEFAULT '#FF6B35',
  border_color text NOT NULL DEFAULT '#FF6B35',
  icon_bg_start text NOT NULL DEFAULT '#3A1800',
  icon_bg_end text NOT NULL DEFAULT '#1A0800',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: public read, admin writes via service role
ALTER TABLE konnect_page_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE konnect_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE konnect_featured ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "konnect_page_settings_public_read" ON konnect_page_settings;
CREATE POLICY "konnect_page_settings_public_read"
  ON konnect_page_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "konnect_events_public_read" ON konnect_events;
CREATE POLICY "konnect_events_public_read"
  ON konnect_events FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "konnect_featured_public_read" ON konnect_featured;
CREATE POLICY "konnect_featured_public_read"
  ON konnect_featured FOR SELECT USING (is_visible = true);

-- Defaults
INSERT INTO konnect_page_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO konnect_featured (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Seed events (only if table is empty)
INSERT INTO konnect_events (
  sort_order, session_type, event_date, month_label, day_label,
  category, title, icon, tile_color
)
SELECT * FROM (VALUES
  (1,  'in-person', '2026-05-08'::date, 'MAY', '08', 'Natural Building Methods', 'Arun Pillai · Kore Zero', '🏗️', '#4DC9C9'),
  (2,  'in-person', '2026-05-15'::date, 'MAY', '15', 'Organic Farm-to-Fork', 'KHDP Farmers Guild', '🌾', '#8B1A1A'),
  (3,  'online',    '2026-05-22'::date, 'MAY', '22', 'Community Finance 101', 'Anish Varma · Thrissur', '💰', '#7B6FBA'),
  (4,  'in-person', '2026-06-05'::date, 'JUN', '05', 'Tribal Textile Arts', 'WTDS Artisan Kore', '🧵', '#E8823A'),
  (5,  'in-person', '2026-06-12'::date, 'JUN', '12', 'Ayurvedic Kitchen', 'Dr. Meera Nair · Kottayam', '🌿', '#3B8C5E'),
  (6,  'in-person', '2026-06-19'::date, 'JUN', '19', 'Pottery & Clay Work', 'Binu Thomas · Alappuzha', '🏺', '#8B9A2A'),
  (7,  'online',    '2026-07-03'::date, 'JUL', '03', 'Digital Storytelling', 'Sindhu Rajan · Media Kore', '📱', '#2C2C2C'),
  (8,  'in-person', '2026-07-17'::date, 'JUL', '17', 'Bamboo Architecture', 'Bamboo Corp Kerala', '🎋', '#6B7B8D')
) AS v(sort_order, session_type, event_date, month_label, day_label, category, title, icon, tile_color)
WHERE NOT EXISTS (SELECT 1 FROM konnect_events LIMIT 1);
