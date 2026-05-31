-- Konnect RSVP & event pages — run after konnect_schema.sql
-- Adds event detail fields, configurable RSVP form, submissions, post-event content

ALTER TABLE konnect_page_settings ADD COLUMN IF NOT EXISTS past_section_label text NOT NULL DEFAULT 'Past Sessions';
ALTER TABLE konnect_page_settings ADD COLUMN IF NOT EXISTS rsvp_section_label text NOT NULL DEFAULT 'RSVP';
ALTER TABLE konnect_page_settings ADD COLUMN IF NOT EXISTS post_event_section_label text NOT NULL DEFAULT 'Event recap';

ALTER TABLE konnect_events ADD COLUMN IF NOT EXISTS long_description text;
ALTER TABLE konnect_events ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE konnect_events ADD COLUMN IF NOT EXISTS schedule_detail text;
ALTER TABLE konnect_events ADD COLUMN IF NOT EXISTS capacity int;
ALTER TABLE konnect_events ADD COLUMN IF NOT EXISTS post_event_message text;
ALTER TABLE konnect_events ADD COLUMN IF NOT EXISTS post_event_images jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE konnect_events ADD COLUMN IF NOT EXISTS rsvp_enabled boolean NOT NULL DEFAULT true;

ALTER TABLE konnect_featured ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE konnect_featured ADD COLUMN IF NOT EXISTS post_event_message text;
ALTER TABLE konnect_featured ADD COLUMN IF NOT EXISTS post_event_images jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE konnect_featured ADD COLUMN IF NOT EXISTS rsvp_enabled boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS konnect_rsvp_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  applies_to text NOT NULL DEFAULT 'all'
    CHECK (applies_to IN ('all', 'event', 'featured')),
  event_id uuid REFERENCES konnect_events(id) ON DELETE CASCADE,
  field_key text NOT NULL,
  label text NOT NULL,
  field_type text NOT NULL DEFAULT 'text'
    CHECK (field_type IN ('text', 'email', 'tel', 'textarea', 'select')),
  placeholder text,
  help_text text,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_required boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS konnect_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES konnect_events(id) ON DELETE CASCADE,
  is_featured boolean NOT NULL DEFAULT false,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  attendee_name text,
  attendee_email text NOT NULL,
  responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS konnect_rsvps_event_id_idx ON konnect_rsvps(event_id);
CREATE INDEX IF NOT EXISTS konnect_rsvps_featured_idx ON konnect_rsvps(is_featured) WHERE is_featured = true;

ALTER TABLE konnect_rsvp_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE konnect_rsvps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "konnect_rsvp_fields_public_read" ON konnect_rsvp_fields;
CREATE POLICY "konnect_rsvp_fields_public_read" ON konnect_rsvp_fields
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "konnect_rsvps_public_insert" ON konnect_rsvps;
CREATE POLICY "konnect_rsvps_public_insert" ON konnect_rsvps
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "konnect_rsvps_own_read" ON konnect_rsvps;
CREATE POLICY "konnect_rsvps_own_read" ON konnect_rsvps
  FOR SELECT USING (
    auth.uid() = user_id
    OR lower(attendee_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- Default RSVP fields (if empty)
INSERT INTO konnect_rsvp_fields (sort_order, field_key, label, field_type, is_required, placeholder)
SELECT * FROM (VALUES
  (1, 'full_name', 'Full name', 'text', true, 'Your name'),
  (2, 'email', 'Email', 'email', true, 'you@example.com'),
  (3, 'phone', 'Phone / WhatsApp', 'tel', false, '+91 …'),
  (4, 'location', 'City / Kore', 'text', false, 'Where you are joining from'),
  (5, 'notes', 'Anything we should know?', 'textarea', false, 'Dietary needs, accessibility, questions…')
) AS v(sort_order, field_key, label, field_type, is_required, placeholder)
WHERE NOT EXISTS (SELECT 1 FROM konnect_rsvp_fields LIMIT 1);

-- Admin policies (requires kommuniti_is_admin from admin_security.sql)
DO $$
BEGIN
  IF to_regprocedure('public.kommuniti_is_admin()') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS konnect_rsvp_fields_admin_all ON konnect_rsvp_fields';
    EXECUTE 'CREATE POLICY konnect_rsvp_fields_admin_all ON konnect_rsvp_fields FOR ALL USING (public.kommuniti_is_admin()) WITH CHECK (public.kommuniti_is_admin())';
    EXECUTE 'DROP POLICY IF EXISTS konnect_rsvps_admin_read ON konnect_rsvps';
    EXECUTE 'CREATE POLICY konnect_rsvps_admin_read ON konnect_rsvps FOR SELECT USING (public.kommuniti_is_admin())';
  END IF;
END $$;
