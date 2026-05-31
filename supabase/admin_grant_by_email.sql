-- Grant Kommuniti admin by email (safe upsert — works even if profiles row is missing)
-- Replace the email below, then Run in Supabase SQL Editor.

INSERT INTO public.profiles (id, is_admin, full_name, updated_at)
SELECT
  u.id,
  true,
  coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1)),
  now()
FROM auth.users u
WHERE lower(u.email) = lower('YOUR_EMAIL@example.com')
ON CONFLICT (id) DO UPDATE
SET is_admin = true, updated_at = now();

-- Verify (should show is_admin = true)
SELECT u.email, p.id, p.is_admin, p.full_name
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE lower(u.email) = lower('YOUR_EMAIL@example.com');
