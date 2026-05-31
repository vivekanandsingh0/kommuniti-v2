-- Run after about_schema.sql if you already applied an older version.
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT / WHERE NOT EXISTS throughout.

-- ---------------------------------------------------------------------------
-- Volunteer application read policy + profile badge
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "volunteer_applications_own_read" ON volunteer_applications;
CREATE POLICY "volunteer_applications_own_read" ON volunteer_applications
  FOR SELECT USING (
    auth.uid() = user_id
    OR lower(applicant_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_approved_volunteer boolean NOT NULL DEFAULT false;

-- ---------------------------------------------------------------------------
-- Dedicated volunteer page (/volunteer) — benefits, roles, page copy
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS volunteer_page_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hero_eyebrow text NOT NULL DEFAULT 'Join the movement',
  hero_title text NOT NULL DEFAULT 'Volunteer with Kommuniti',
  hero_subtitle text NOT NULL DEFAULT 'Help neighbourhoods become Kores.',
  hero_description text NOT NULL DEFAULT 'Whether you have five hours a week or five hours a month — your time shapes real community. Earn recognition, grow skills, and belong to something bigger than yourself.',
  benefits_section_label text NOT NULL DEFAULT 'WHY VOLUNTEER',
  benefits_intro text NOT NULL DEFAULT 'Volunteering with Kommuniti is not unpaid labour — it is co-ownership of the communities we are building together.',
  roles_section_label text NOT NULL DEFAULT 'OPEN ROLES',
  roles_intro text NOT NULL DEFAULT 'These are areas where we are actively looking for volunteers right now.',
  featured_roles_label text NOT NULL DEFAULT 'Actively recruiting',
  all_roles_label text NOT NULL DEFAULT 'All volunteer roles',
  form_section_label text NOT NULL DEFAULT 'APPLY NOW',
  cta_title text NOT NULL DEFAULT 'Ready to shape your Kore?',
  cta_description text NOT NULL DEFAULT 'Fill in the application below. We review every submission and reply within a week.',
  accent_color text NOT NULL DEFAULT '#C9A84C',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS volunteer_benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  icon text NOT NULL DEFAULT '✦',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS volunteer_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  commitment text,
  location_type text NOT NULL DEFAULT 'remote'
    CHECK (location_type IN ('remote', 'in-person', 'hybrid')),
  icon text NOT NULL DEFAULT '◉',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE volunteer_applications
  ADD COLUMN IF NOT EXISTS preferred_role_id uuid REFERENCES volunteer_roles(id) ON DELETE SET NULL;

ALTER TABLE volunteer_page_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "volunteer_page_settings_public_read" ON volunteer_page_settings;
CREATE POLICY "volunteer_page_settings_public_read" ON volunteer_page_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "volunteer_benefits_public_read" ON volunteer_benefits;
CREATE POLICY "volunteer_benefits_public_read" ON volunteer_benefits FOR SELECT USING (is_visible = true);

DROP POLICY IF EXISTS "volunteer_roles_public_read" ON volunteer_roles;
CREATE POLICY "volunteer_roles_public_read" ON volunteer_roles FOR SELECT USING (is_active = true);

INSERT INTO volunteer_page_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

INSERT INTO volunteer_benefits (sort_order, icon, title, description)
SELECT * FROM (VALUES
  (1, '🪙', 'Earn KO Coins', 'Contributions are recognised in our community economy — your time has tangible value.'),
  (2, '🎓', 'Learn by doing', 'Work alongside facilitators, authors, and Kore leaders across Konnect, KO Reads, and events.'),
  (3, '🌻', 'Belong to a Kore', 'Volunteers often become core members of neighbourhood hubs — this is how community sticks.'),
  (4, '📜', 'Official recognition', 'Approved volunteers receive a profile badge and credit across Kommuniti programmes.'),
  (5, '🗺️', 'Shape real places', 'From content to events to local outreach — you help decide what gets built next.'),
  (6, '🤝', 'Flexible commitment', 'Remote, weekend, or part-time — choose a rhythm that fits your life.')
) AS v(sort_order, icon, title, description)
WHERE NOT EXISTS (SELECT 1 FROM volunteer_benefits LIMIT 1);

INSERT INTO volunteer_roles (sort_order, is_featured, title, description, commitment, location_type, icon)
SELECT * FROM (VALUES
  (1, true, 'Community Events Coordinator', 'Help plan and run Konnect workshops and Kore gatherings — online and in Kerala.', '5–8 hrs/week', 'hybrid', '🎓'),
  (2, true, 'KO Reads Community Moderator', 'Welcome readers, encourage contributions, and help authors respond to community input.', '3–5 hrs/week', 'remote', '📖'),
  (3, true, 'Content & Storytelling', 'Write, edit, or produce content about Kores, volunteers, and community impact.', 'Flexible', 'remote', '✍️'),
  (4, false, 'Local Kore Outreach', 'Represent Kommuniti in your neighbourhood — invite people, share events, grow the circle.', 'Weekends', 'in-person', '📍'),
  (5, false, 'Tech & Platform Support', 'Help improve the Kommuniti web app, test features, and support members with technical questions.', '4–6 hrs/week', 'remote', '⚙️'),
  (6, false, 'Translation & Localization', 'Help Kommuniti reach more cultures by translating content and supporting multilingual events.', 'Flexible', 'remote', '🌍')
) AS v(sort_order, is_featured, title, description, commitment, location_type, icon)
WHERE NOT EXISTS (SELECT 1 FROM volunteer_roles LIMIT 1);

INSERT INTO volunteer_form_fields (sort_order, field_key, label, field_type, placeholder, is_required, options)
SELECT 5, 'volunteer_role', 'Preferred volunteer role', 'select', NULL, true, '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM volunteer_form_fields WHERE field_key = 'volunteer_role');

-- ---------------------------------------------------------------------------
-- Volunteer hub — profile details, notices, gigs (shown on /profile)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS volunteer_member_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid REFERENCES volunteer_roles(id) ON DELETE SET NULL,
  location text,
  availability text,
  joined_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS volunteer_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  is_pinned boolean NOT NULL DEFAULT false,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS volunteer_gigs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  role_id uuid REFERENCES volunteer_roles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  location text,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled')),
  due_date date,
  ko_coins_reward int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE volunteer_member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_gigs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_approved_volunteer(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (SELECT is_approved_volunteer FROM profiles WHERE id = uid),
    false
  );
$$;

DROP POLICY IF EXISTS "volunteer_member_profiles_own_read" ON volunteer_member_profiles;
CREATE POLICY "volunteer_member_profiles_own_read" ON volunteer_member_profiles
  FOR SELECT USING (auth.uid() = user_id AND public.is_approved_volunteer(auth.uid()));

DROP POLICY IF EXISTS "volunteer_notices_volunteer_read" ON volunteer_notices;
CREATE POLICY "volunteer_notices_volunteer_read" ON volunteer_notices
  FOR SELECT USING (
    is_visible = true
    AND public.is_approved_volunteer(auth.uid())
    AND (user_id IS NULL OR user_id = auth.uid())
  );

DROP POLICY IF EXISTS "volunteer_gigs_volunteer_read" ON volunteer_gigs;
CREATE POLICY "volunteer_gigs_volunteer_read" ON volunteer_gigs
  FOR SELECT USING (
    public.is_approved_volunteer(auth.uid())
    AND (
      assigned_user_id = auth.uid()
      OR (assigned_user_id IS NULL AND status = 'open')
    )
  );
