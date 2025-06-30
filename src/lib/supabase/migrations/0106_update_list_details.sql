-- Create list_follows table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.list_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(list_id, user_id)
);

-- Enable RLS on list_follows
ALTER TABLE public.list_follows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for list_follows
CREATE POLICY "Anyone can read follows on public lists"
  ON public.list_follows
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_follows.list_id
      AND (lists.is_public = true OR lists.owner_id = auth.uid())
    )
  );

CREATE POLICY "Users can follow/unfollow lists they can view"
  ON public.list_follows
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_follows.list_id
      AND (lists.is_public = true OR lists.owner_id = auth.uid())
    )
    AND auth.uid() = user_id
  );

-- Drop existing function first
DROP FUNCTION IF EXISTS get_list_details(UUID);

-- Update get_list_details function to include basic details and likes
CREATE OR REPLACE FUNCTION get_list_details(p_list_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  is_public BOOLEAN,
  created_at TIMESTAMPTZ,
  owner_id UUID,
  owner_username TEXT,
  owner_avatar_url TEXT,
  like_count BIGINT,
  is_liked BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- First check if the list exists at all
  IF NOT EXISTS (
    SELECT 1 FROM lists WHERE lists.id = p_list_id
  ) THEN
    RETURN;
  END IF;

  -- Then check if the user has access
  IF NOT EXISTS (
    SELECT 1 FROM lists 
    WHERE lists.id = p_list_id 
    AND (lists.is_public = true OR lists.owner_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'List not found or not accessible';
  END IF;

  RETURN QUERY
  SELECT 
    l.id,
    l.title,
    l.description,
    l.is_public,
    l.created_at,
    l.owner_id,
    u.username AS owner_username,
    u.avatar_url AS owner_avatar_url,
    COALESCE(
      (SELECT COUNT(*) FROM list_likes WHERE list_likes.list_id = l.id),
      0
    )::BIGINT AS like_count,
    COALESCE(
      EXISTS (
        SELECT 1 FROM list_likes 
        WHERE list_likes.list_id = l.id AND list_likes.user_id = auth.uid()
      ),
      false
    ) AS is_liked
  FROM lists l
  JOIN public.users u ON u.id = l.owner_id
  WHERE l.id = p_list_id;
END;
$$;

-- Create function to update list
CREATE OR REPLACE FUNCTION update_list(
  p_list_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_is_public BOOLEAN
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE lists
  SET 
    title = p_title,
    description = p_description,
    is_public = p_is_public,
    updated_at = now()
  WHERE id = p_list_id
  AND owner_id = auth.uid();
END;
$$;

-- Grant necessary permissions
GRANT ALL ON public.list_follows TO authenticated;
GRANT EXECUTE ON FUNCTION get_list_details TO authenticated, anon; 