-- SQL migration patch to support registration materials and links for Konnect Events.
-- Run in the Supabase SQL editor to apply.

-- 1. Add brochure_url, wa_group_link, and post_rsvp_message columns to konnect_events
ALTER TABLE konnect_events ADD COLUMN IF NOT EXISTS brochure_url text;
ALTER TABLE konnect_events ADD COLUMN IF NOT EXISTS wa_group_link text;
ALTER TABLE konnect_events ADD COLUMN IF NOT EXISTS post_rsvp_message text;

-- 2. Add brochure_url, wa_group_link, and post_rsvp_message columns to konnect_featured
ALTER TABLE konnect_featured ADD COLUMN IF NOT EXISTS brochure_url text;
ALTER TABLE konnect_featured ADD COLUMN IF NOT EXISTS wa_group_link text;
ALTER TABLE konnect_featured ADD COLUMN IF NOT EXISTS post_rsvp_message text;
