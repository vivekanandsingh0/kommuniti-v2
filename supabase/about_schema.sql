-- About Us + Volunteer CMS — run once in Supabase SQL Editor

-- Page copy (singleton)
CREATE TABLE IF NOT EXISTS about_page_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hero_eyebrow text NOT NULL DEFAULT 'About Kommuniti',
  hero_title text NOT NULL DEFAULT 'Build the Community You Deserve',
  hero_subtitle text NOT NULL DEFAULT 'A Feeling of Home.',
  hero_description text NOT NULL DEFAULT 'Building resilient communities through commerce, creativity, and collective action. Based in Kerala, rooted everywhere.',
  mission_section_label text NOT NULL DEFAULT 'WHY KOMMUNITI',
  mission_text text NOT NULL DEFAULT 'Kommuniti envisions to be a decentralised, international and non-partisan commune where mankind can function as one while expressing their individual uniqueness.',
  what_section_label text NOT NULL DEFAULT 'WHAT IS KOMMUNITI',
  what_text text NOT NULL DEFAULT 'Kommuniti is a decentralized, international, and politically non-partisan commune. We empower mankind to function as one collective consciousness while celebrating individual uniqueness.',
  pillars_section_label text NOT NULL DEFAULT 'THREE PILLARS',
  stats_section_label text NOT NULL DEFAULT 'BY THE NUMBERS',
  duty_section_label text NOT NULL DEFAULT 'OUR DUTY',
  duty_headline text NOT NULL DEFAULT 'WE HAVE A DUTY TO UNITE — WHATEVER OUR DIFFERENCES',
  duty_footer text NOT NULL DEFAULT 'KOMMUTE · KONNECT · KREATE',
  voices_section_label text NOT NULL DEFAULT 'VOICES',
  voices_subtitle text NOT NULL DEFAULT 'Stories from our global community',
  volunteer_section_label text NOT NULL DEFAULT 'JOIN AS VOLUNTEER',
  company_section_label text NOT NULL DEFAULT 'COMPANY',
  company_name text NOT NULL DEFAULT 'Kommuniti Private Limited',
  company_cin text NOT NULL DEFAULT 'CIN: U74999KL2026PTC083000',
  company_location text NOT NULL DEFAULT 'Registered in Kerala, India',
  company_tagline text NOT NULL DEFAULT 'Community · Commerce · Action',
  accent_color text NOT NULL DEFAULT '#C9A84C',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Three pillars (CMS-editable)
CREATE TABLE IF NOT EXISTS about_pillars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  detail text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '◉',
  accent_color text NOT NULL DEFAULT '#C9A84C',
  link_href text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Stats row
CREATE TABLE IF NOT EXISTS about_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  value text NOT NULL,
  label text NOT NULL,
  color text NOT NULL DEFAULT '#C9A84C',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Duty / mission bullet lines
CREATE TABLE IF NOT EXISTS about_duty_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Community voices / testimonials
CREATE TABLE IF NOT EXISTS about_voices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  quote text NOT NULL,
  name text NOT NULL,
  country text NOT NULL DEFAULT '',
  initials text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Volunteer form settings (singleton)
CREATE TABLE IF NOT EXISTS volunteer_form_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  is_open boolean NOT NULL DEFAULT true,
  form_title text NOT NULL DEFAULT 'Volunteer with Kommuniti',
  form_description text NOT NULL DEFAULT 'Help us build neighbourhood-first community — from events and content to local Kores and beyond.',
  success_message text NOT NULL DEFAULT 'Thank you! Your volunteer application has been received. We will be in touch soon.',
  closed_message text NOT NULL DEFAULT 'Volunteer applications are paused for now. Check back soon or explore Konnect and KO Reads.',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Customizable volunteer application fields
CREATE TABLE IF NOT EXISTS volunteer_form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  field_key text NOT NULL UNIQUE,
  label text NOT NULL,
  field_type text NOT NULL DEFAULT 'text'
    CHECK (field_type IN ('text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'url')),
  placeholder text,
  help_text text,
  options jsonb NOT NULL DEFAULT '[]',
  is_required boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Volunteer applications
CREATE TABLE IF NOT EXISTS volunteer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  applicant_name text,
  applicant_email text,
  responses jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE about_page_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_duty_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_form_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "about_page_settings_public_read" ON about_page_settings;
CREATE POLICY "about_page_settings_public_read" ON about_page_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "about_pillars_public_read" ON about_pillars;
CREATE POLICY "about_pillars_public_read" ON about_pillars FOR SELECT USING (is_visible = true);

DROP POLICY IF EXISTS "about_stats_public_read" ON about_stats;
CREATE POLICY "about_stats_public_read" ON about_stats FOR SELECT USING (is_visible = true);

DROP POLICY IF EXISTS "about_duty_lines_public_read" ON about_duty_lines;
CREATE POLICY "about_duty_lines_public_read" ON about_duty_lines FOR SELECT USING (is_visible = true);

DROP POLICY IF EXISTS "about_voices_public_read" ON about_voices;
CREATE POLICY "about_voices_public_read" ON about_voices FOR SELECT USING (is_visible = true);

DROP POLICY IF EXISTS "volunteer_form_settings_public_read" ON volunteer_form_settings;
CREATE POLICY "volunteer_form_settings_public_read" ON volunteer_form_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "volunteer_form_fields_public_read" ON volunteer_form_fields;
CREATE POLICY "volunteer_form_fields_public_read" ON volunteer_form_fields FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "volunteer_applications_public_insert" ON volunteer_applications;
CREATE POLICY "volunteer_applications_public_insert" ON volunteer_applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "volunteer_applications_own_read" ON volunteer_applications;
CREATE POLICY "volunteer_applications_own_read" ON volunteer_applications
  FOR SELECT USING (
    auth.uid() = user_id
    OR lower(applicant_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- Volunteer badge on user profile
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_approved_volunteer boolean NOT NULL DEFAULT false;

-- Singleton defaults
INSERT INTO about_page_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO volunteer_form_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Seed pillars
INSERT INTO about_pillars (sort_order, title, subtitle, description, detail, icon, accent_color, link_href)
SELECT * FROM (VALUES
  (1, 'KOMMUTE', 'Travel & Cultural Exchange',
   'Travelling opens your mind to changes and helps you be free of attachments. We encourage people to pursue travel where their heart calls — not as a tourist, but as an observer and problem solver.',
   'Explore curated stays and neighbourhood journeys across Kores in Kerala and beyond.',
   '🗺️', '#6BBFB5', '/kommute'),
  (2, 'KONNECT', 'Sharing & Learning',
   'Conversations and storytelling have ever been a part of human evolution. Kommuniti encourages meaningful discussions that open minds from different perspectives.',
   'Through talks, workshops, events, webinars and conferences, we create awareness about the larger goal of life.',
   '🎓', '#FF6B35', '/konnect'),
  (3, 'KREATE', 'Innovate and Transform',
   'An observation needs a healthy mind and body to innovate and the right ecosystem for transforming an idea into a product or business.',
   'Kommuniti envisions to be an incubation centre where we build the right individual, connect them with tribe members, and help them go to market.',
   '⚡', '#AAFF00', '/kreate')
) AS v(sort_order, title, subtitle, description, detail, icon, accent_color, link_href)
WHERE NOT EXISTS (SELECT 1 FROM about_pillars LIMIT 1);

-- Seed stats
INSERT INTO about_stats (sort_order, value, label, color)
SELECT * FROM (VALUES
  (1, '2,000+', 'Kore Members', '#C9A84C'),
  (2, '45', 'Active Kores', '#6BBFB5'),
  (3, '₹12L+', 'Community Earned', '#FF6B35')
) AS v(sort_order, value, label, color)
WHERE NOT EXISTS (SELECT 1 FROM about_stats LIMIT 1);

-- Seed duty lines
INSERT INTO about_duty_lines (sort_order, text)
SELECT * FROM (VALUES
  (1, 'To travel to meet new cultures, practices and innovations'),
  (2, 'To give education a new perspective to solve real problems'),
  (3, 'To create a greater equity in world economic order'),
  (4, 'To preserve individual identities for world unity')
) AS v(sort_order, text)
WHERE NOT EXISTS (SELECT 1 FROM about_duty_lines LIMIT 1);

-- Seed voices
INSERT INTO about_voices (sort_order, quote, name, country, initials)
SELECT * FROM (VALUES
  (1, 'Kommuniti changed the way I see the world. The connections I made through Kommute are friendships for life.', 'Priya Sharma', 'INDIA', 'PS'),
  (2, 'Being part of this community gave me the courage to share my story. Konnect made my voice heard across borders.', 'Carlos Mendes', 'BRAZIL', 'CM'),
  (3, 'Kreate helped me turn my passion project into a real initiative that is impacting hundreds of students.', 'Aisha Okafor', 'NIGERIA', 'AO'),
  (4, 'The retro spirit of Kommuniti is infectious. It is modern community building with heart and soul.', 'Yuki Tanaka', 'JAPAN', 'YT')
) AS v(sort_order, quote, name, country, initials)
WHERE NOT EXISTS (SELECT 1 FROM about_voices LIMIT 1);

-- Seed volunteer form fields
INSERT INTO volunteer_form_fields (sort_order, field_key, label, field_type, placeholder, is_required, options)
SELECT * FROM (VALUES
  (1, 'full_name', 'Full name', 'text', 'Your full name', true, '[]'::jsonb),
  (2, 'email', 'Email', 'email', 'you@example.com', true, '[]'::jsonb),
  (3, 'phone', 'Phone / WhatsApp', 'phone', '+91 ...', false, '[]'::jsonb),
  (4, 'location', 'City / Country', 'text', 'Where are you based?', false, '[]'::jsonb),
  (5, 'availability', 'Availability', 'select', NULL, true, '["Full-time","Part-time","Weekends only","Remote only"]'::jsonb),
  (6, 'interests', 'Areas of interest', 'textarea', 'Events, content, local Kores, tech, design...', false, '[]'::jsonb),
  (7, 'why_volunteer', 'Why do you want to volunteer?', 'textarea', 'Tell us what draws you to Kommuniti', true, '[]'::jsonb),
  (8, 'skills', 'Skills & experience', 'textarea', 'Relevant skills, past community work, links', false, '[]'::jsonb)
) AS v(sort_order, field_key, label, field_type, placeholder, is_required, options)
WHERE NOT EXISTS (SELECT 1 FROM volunteer_form_fields LIMIT 1);
