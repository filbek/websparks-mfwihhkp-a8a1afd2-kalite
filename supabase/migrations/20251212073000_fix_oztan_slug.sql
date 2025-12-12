-- Fix Oztan Organization Slug
-- The user is trying to access oztan.intrasoft.io but getting "Organization Not Found".
-- This implies the slug in DB doesn't match 'oztan'.

UPDATE public.organizations
SET slug = 'oztan'
WHERE name ILIKE '%Öztan%' OR name ILIKE '%Oztan%';
