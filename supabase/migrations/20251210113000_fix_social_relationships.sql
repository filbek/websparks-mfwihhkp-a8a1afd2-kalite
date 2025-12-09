-- Fix relationships for PostgREST joins
-- We need explicit FKs to public.users to allow joining user profile data

-- social_posts
ALTER TABLE public.social_posts
ADD CONSTRAINT social_posts_user_id_fkey_public
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- social_comments
ALTER TABLE public.social_comments
ADD CONSTRAINT social_comments_user_id_fkey_public
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- social_likes
ALTER TABLE public.social_likes
ADD CONSTRAINT social_likes_user_id_fkey_public
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
