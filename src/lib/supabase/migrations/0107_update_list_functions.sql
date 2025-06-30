-- Drop existing function first
DROP FUNCTION IF EXISTS get_list_items(UUID);
DROP FUNCTION IF EXISTS delete_list(UUID);

-- Create delete_list function
CREATE OR REPLACE FUNCTION delete_list(p_list_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Check if user owns the list
  IF NOT EXISTS (
    SELECT 1 FROM lists
    WHERE id = p_list_id
    AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized to delete this list';
  END IF;

  -- Delete the list (cascade will handle items, likes, comments)
  DELETE FROM lists
  WHERE id = p_list_id
  AND owner_id = auth.uid();
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION delete_list TO authenticated;

-- Update get_list_items function to include race details
CREATE OR REPLACE FUNCTION get_list_items(p_list_id UUID)
RETURNS TABLE (
  id UUID,
  list_id UUID,
  race_id INTEGER,
  note TEXT,
  created_at TIMESTAMPTZ,
  display_order INTEGER,
  race JSON
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- First check if the list exists
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
    li.id,
    li.list_id,
    li.race_id,
    li.note,
    li.created_at,
    li.display_order,
    json_build_object(
      'id', m.id,
      'name', m.title,
      'date', m.starts_at,
      'circuit_name', m.meta->>'circuit',
      'circuit_location', m.meta->>'location',
      'circuit_country', m.meta->>'country',
      'poster_url', m.poster_url,
      'season', EXTRACT(YEAR FROM m.starts_at),
      'status', 
      CASE 
        WHEN m.starts_at < NOW() THEN 'completed'
        ELSE 'upcoming'
      END
    ) AS race
  FROM list_items li
  JOIN matches m ON m.id = li.race_id
  WHERE li.list_id = p_list_id
  ORDER BY li.display_order;
END;
$$;

-- Create function to remove list item
CREATE OR REPLACE FUNCTION remove_list_item(p_item_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM list_items
  WHERE list_items.id = p_item_id
  AND EXISTS (
    SELECT 1 FROM lists
    WHERE lists.id = list_items.list_id
    AND lists.owner_id = auth.uid()
  );
END;
$$; 