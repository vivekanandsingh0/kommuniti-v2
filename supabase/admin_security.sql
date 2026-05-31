-- Admin security for Kommuniti CMS
-- Run once in Supabase SQL Editor AFTER your other schema files.
--
-- 1. Adds profiles.is_admin
-- 2. Helper function kommuniti_is_admin() for RLS
-- 3. Admin write/read policies on CMS tables
-- 4. Prevents users from promoting themselves to admin
--
-- Make yourself admin (replace email):
--   UPDATE profiles SET is_admin = true
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'you@example.com');

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.kommuniti_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.kommuniti_is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.kommuniti_is_admin() TO authenticated;

-- Current user's admin flag (used by the app after login)
CREATE OR REPLACE FUNCTION public.kommuniti_my_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.kommuniti_my_is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.kommuniti_my_is_admin() TO authenticated;

-- Lookup auth user id by email — admins only (replaces client-side service role)
CREATE OR REPLACE FUNCTION public.kommuniti_user_id_by_email(lookup_email text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = auth, public
AS $$
  SELECT CASE
    WHEN public.kommuniti_is_admin() THEN (
      SELECT id FROM auth.users
      WHERE lower(email) = lower(trim(lookup_email))
      LIMIT 1
    )
    ELSE NULL
  END;
$$;

REVOKE ALL ON FUNCTION public.kommuniti_user_id_by_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.kommuniti_user_id_by_email(text) TO authenticated;

-- Block self-promotion to admin via profile updates
CREATE OR REPLACE FUNCTION public.kommuniti_prevent_self_admin_promotion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
    -- Allow SQL Editor / service role (no JWT) to grant admin
    IF auth.uid() IS NULL THEN
      RETURN NEW;
    END IF;
    IF NOT public.kommuniti_is_admin() THEN
      NEW.is_admin := OLD.is_admin;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_prevent_self_admin ON profiles;
CREATE TRIGGER trg_profiles_prevent_self_admin
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.kommuniti_prevent_self_admin_promotion();

-- Profiles: users read/update own row; admins read/update all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_own_read" ON profiles;
CREATE POLICY "profiles_own_read" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_admin_read" ON profiles;
CREATE POLICY "profiles_admin_read" ON profiles
  FOR SELECT USING (public.kommuniti_is_admin());

DROP POLICY IF EXISTS "profiles_own_update" ON profiles;
CREATE POLICY "profiles_own_update" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
CREATE POLICY "profiles_admin_update" ON profiles
  FOR UPDATE USING (public.kommuniti_is_admin()) WITH CHECK (public.kommuniti_is_admin());

DROP POLICY IF EXISTS "profiles_admin_insert" ON profiles;
CREATE POLICY "profiles_admin_insert" ON profiles
  FOR INSERT WITH CHECK (public.kommuniti_is_admin() OR auth.uid() = id);

-- Generic admin CMS policy helper (run per table)
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'konnect_page_settings', 'konnect_events', 'konnect_featured',
    'konnect_rsvp_fields', 'konnect_rsvps',
    'about_page_settings', 'about_pillars', 'about_stats', 'about_duty_lines', 'about_voices',
    'volunteer_form_settings', 'volunteer_form_fields', 'volunteer_applications',
    'volunteer_page_settings', 'volunteer_benefits', 'volunteer_roles',
    'volunteer_member_profiles', 'volunteer_notices', 'volunteer_gigs',
    'koreads_authors', 'koreads_books', 'koreads_chapters', 'koreads_tasks',
    'koreads_contributions', 'koreads_task_submissions',
    'koreads_timeline_events', 'koreads_polls', 'koreads_poll_votes',
    'koreads_fan_theories', 'koreads_theory_upvotes', 'koreads_behind_story',
    'koreads_story_circles', 'koreads_circle_members', 'koreads_circle_posts',
    'ko_coin_transactions',
    'map_config', 'map_zones'
  ]
  LOOP
    IF to_regclass('public.' || tbl) IS NOT NULL THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', tbl || '_admin_all', tbl);
      EXECUTE format(
        'CREATE POLICY %I ON %I FOR ALL USING (public.kommuniti_is_admin()) WITH CHECK (public.kommuniti_is_admin())',
        tbl || '_admin_all',
        tbl
      );
    END IF;
  END LOOP;
END $$;

-- Admins can read all volunteer applications (not just own)
DROP POLICY IF EXISTS "volunteer_applications_admin_read" ON volunteer_applications;
CREATE POLICY "volunteer_applications_admin_read" ON volunteer_applications
  FOR SELECT USING (public.kommuniti_is_admin());

-- Admins see unpublished Konnect events (public policy only shows published)
-- Covered by konnect_events_admin_all

-- Example: grant admin to your account
-- UPDATE profiles SET is_admin = true WHERE id = auth.uid(); -- only works if you're already admin
-- Use SQL editor as postgres role:
-- UPDATE profiles SET is_admin = true WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');
