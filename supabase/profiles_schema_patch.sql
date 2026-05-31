-- Kommuniti profiles + admin access (run once in Supabase SQL Editor)
-- Fixes: missing columns, admin read all profiles, CMS admin policies

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ko_coins integer NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_approved_volunteer boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.kommuniti_is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT coalesce((SELECT is_admin FROM public.profiles WHERE id = auth.uid()), false);
$$;
GRANT EXECUTE ON FUNCTION public.kommuniti_is_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.kommuniti_prevent_self_admin_promotion()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
    IF auth.uid() IS NULL THEN RETURN NEW; END IF;
    IF NOT public.kommuniti_is_admin() THEN NEW.is_admin := OLD.is_admin; END IF;
  END IF;
  RETURN NEW;
END;
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_own_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;

CREATE POLICY "profiles_own_read" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_own_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_admin_read" ON public.profiles FOR SELECT USING (public.kommuniti_is_admin());
CREATE POLICY "profiles_admin_update" ON public.profiles FOR UPDATE USING (public.kommuniti_is_admin()) WITH CHECK (public.kommuniti_is_admin());

-- Re-apply CMS admin policies (Konnect, About, KO Reads, etc.)
DO $$
DECLARE tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'konnect_page_settings', 'konnect_events', 'konnect_featured',
    'about_page_settings', 'about_pillars', 'about_stats', 'about_duty_lines', 'about_voices',
    'volunteer_form_settings', 'volunteer_form_fields', 'volunteer_applications',
    'volunteer_page_settings', 'volunteer_benefits', 'volunteer_roles',
    'volunteer_member_profiles', 'volunteer_notices', 'volunteer_gigs',
    'koreads_authors', 'koreads_books', 'koreads_chapters', 'koreads_tasks',
    'koreads_contributions', 'koreads_task_submissions',
    'map_config', 'map_zones'
  ]
  LOOP
    IF to_regclass('public.' || tbl) IS NOT NULL THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', tbl || '_admin_all', tbl);
      EXECUTE format(
        'CREATE POLICY %I ON %I FOR ALL USING (public.kommuniti_is_admin()) WITH CHECK (public.kommuniti_is_admin())',
        tbl || '_admin_all', tbl
      );
    END IF;
  END LOOP;
END $$;

DROP POLICY IF EXISTS "volunteer_applications_admin_read" ON volunteer_applications;
CREATE POLICY "volunteer_applications_admin_read" ON volunteer_applications
  FOR SELECT USING (public.kommuniti_is_admin());
