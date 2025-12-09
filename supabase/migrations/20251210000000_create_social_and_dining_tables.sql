-- Create social_posts table
CREATE TABLE IF NOT EXISTS public.social_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    image_url TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    facility_id INTEGER NOT NULL REFERENCES public.facilities(id),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create social_comments table
CREATE TABLE IF NOT EXISTS public.social_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create social_likes table
CREATE TABLE IF NOT EXISTS public.social_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Create dining_menus table
CREATE TABLE IF NOT EXISTS public.dining_menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    facility_id INTEGER NOT NULL REFERENCES public.facilities(id),
    soup TEXT,
    main_dish TEXT,
    side_dish TEXT,
    dessert TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, facility_id)
);

-- Enable RLS
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dining_menus ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user belongs to facility
CREATE OR REPLACE FUNCTION public.check_user_facility(required_facility_id INT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND facility_id = required_facility_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for social_posts

-- Read: Users can see posts from their facility
CREATE POLICY "Users can view posts from their facility"
ON public.social_posts FOR SELECT
USING (check_user_facility(facility_id));

-- Insert: Users can create posts for their facility
CREATE POLICY "Users can create posts for their facility"
ON public.social_posts FOR INSERT
WITH CHECK (check_user_facility(facility_id));

-- Update: Users can update their own posts
CREATE POLICY "Users can update their own posts"
ON public.social_posts FOR UPDATE
USING (auth.uid() = user_id);

-- Delete: Users can delete their own posts
CREATE POLICY "Users can delete their own posts"
ON public.social_posts FOR DELETE
USING (auth.uid() = user_id);


-- RLS Policies for social_comments

-- Read: Users can see comments on posts visible to them
-- (Indirectly checks facility via post existence, but explicit check is safer/faster if we join)
-- Simplifying: Check if user facility matches post facility? 
-- Actually, easier to just check if the post they are commenting on is visible.
-- But standard pattern: Users access comments if they can access the post.
-- Since we filter queries by post_id, we can rely on that, but RLS needs to be robust.
-- Let's use a join or the same facility check if comments don't store facility_id (they don't).
-- We need to check the facility of the *post*.
CREATE POLICY "Users can view comments on visible posts"
ON public.social_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.social_posts p
    WHERE p.id = post_id
    AND check_user_facility(p.facility_id)
  )
);

-- Insert: Users can comment on visible posts
CREATE POLICY "Users can create comments on visible posts"
ON public.social_comments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.social_posts p
    WHERE p.id = post_id
    AND check_user_facility(p.facility_id)
  )
);

-- Delete: Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON public.social_comments FOR DELETE
USING (auth.uid() = user_id);


-- RLS Policies for social_likes

-- Read
CREATE POLICY "Users can view likes on visible posts"
ON public.social_likes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.social_posts p
    WHERE p.id = post_id
    AND check_user_facility(p.facility_id)
  )
);

-- Insert
CREATE POLICY "Users can like visible posts"
ON public.social_likes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.social_posts p
    WHERE p.id = post_id
    AND check_user_facility(p.facility_id)
  )
);

-- Delete
CREATE POLICY "Users can un-like their own likes"
ON public.social_likes FOR DELETE
USING (auth.uid() = user_id);


-- RLS Policies for dining_menus

-- Read: Users can view menus for their facility
CREATE POLICY "Users can view menus for their facility"
ON public.dining_menus FOR SELECT
USING (check_user_facility(facility_id));

-- Insert: Any user can add menu (for V1 as requested)
CREATE POLICY "Users can create menus for their facility"
ON public.dining_menus FOR INSERT
WITH CHECK (check_user_facility(facility_id));

-- Update: Any user can update menu for their facility (for V1)
CREATE POLICY "Users can update menus for their facility"
ON public.dining_menus FOR UPDATE
USING (check_user_facility(facility_id));


-- Triggers to update counts
CREATE OR REPLACE FUNCTION public.handle_social_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF (TG_TABLE_NAME = 'social_comments') THEN
      UPDATE public.social_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_TABLE_NAME = 'social_likes') THEN
      UPDATE public.social_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    IF (TG_TABLE_NAME = 'social_comments') THEN
      UPDATE public.social_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    ELSIF (TG_TABLE_NAME = 'social_likes') THEN
      UPDATE public.social_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_post_comments_count
AFTER INSERT OR DELETE ON public.social_comments
FOR EACH ROW EXECUTE FUNCTION public.handle_social_counts();

CREATE TRIGGER update_post_likes_count
AFTER INSERT OR DELETE ON public.social_likes
FOR EACH ROW EXECUTE FUNCTION public.handle_social_counts();
