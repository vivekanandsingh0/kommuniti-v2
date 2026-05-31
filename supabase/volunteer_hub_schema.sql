-- Volunteer hub — profile details, notices, gigs for approved volunteers
-- Run after about_schema.sql and volunteer_page_schema.sql (or about_volunteer_patch.sql)

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
