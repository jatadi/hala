-- Create list_comments table
CREATE TABLE list_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE list_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on public lists"
  ON list_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_comments.list_id
      AND (lists.is_public = true OR lists.owner_id = auth.uid())
    )
  );

CREATE POLICY "Users can create comments on lists they can view"
  ON list_comments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_comments.list_id
      AND (lists.is_public = true OR lists.owner_id = auth.uid())
    )
    AND auth.uid() = user_id
  );

CREATE POLICY "Users can delete their own comments"
  ON list_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to get list comments
CREATE OR REPLACE FUNCTION get_list_comments(p_list_id UUID)
RETURNS TABLE (
  id UUID,
  list_id UUID,
  user_id UUID,
  user_username TEXT,
  content TEXT,
  created_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.list_id,
    c.user_id,
    u.username AS user_username,
    c.content,
    c.created_at
  FROM list_comments c
  JOIN auth.users u ON u.id = c.user_id
  WHERE c.list_id = p_list_id
  ORDER BY c.created_at DESC;
END;
$$;

-- Create function to add a comment
CREATE OR REPLACE FUNCTION add_list_comment(
  p_list_id UUID,
  p_content TEXT
) RETURNS TABLE (
  id UUID,
  list_id UUID,
  user_id UUID,
  user_username TEXT,
  content TEXT,
  created_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_comment_id UUID;
BEGIN
  -- Insert the comment
  INSERT INTO list_comments (list_id, user_id, content)
  VALUES (p_list_id, auth.uid(), p_content)
  RETURNING id INTO v_comment_id;

  -- Return the newly created comment with user info
  RETURN QUERY
  SELECT 
    c.id,
    c.list_id,
    c.user_id,
    u.username AS user_username,
    c.content,
    c.created_at
  FROM list_comments c
  JOIN auth.users u ON u.id = c.user_id
  WHERE c.id = v_comment_id;
END;
$$;

-- Create function to delete a comment
CREATE OR REPLACE FUNCTION delete_list_comment(p_comment_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM list_comments
  WHERE id = p_comment_id
  AND user_id = auth.uid();
END;
$$; 