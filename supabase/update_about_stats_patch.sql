-- SQL patch to update About page stats
-- Run this in your Supabase Dashboard SQL Editor (https://supabase.com)

-- 1. Update Kore Members -> 100+ Ko Members
UPDATE about_stats 
SET value = '100+', label = 'Ko Members' 
WHERE label = 'Kore Members' OR sort_order = 1;

-- 2. Update Active Kores -> 5
UPDATE about_stats 
SET value = '5', label = 'Active Kores' 
WHERE label = 'Active Kores' OR sort_order = 2;

-- 3. Update Community Earned -> Growing Earning Potential
UPDATE about_stats 
SET value = 'Growing', label = 'Earning Potential' 
WHERE label = 'Community Earned' OR sort_order = 3;
