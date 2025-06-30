-- Drop existing functions
drop function if exists get_list_details(uuid);

-- Function to create a new list
create or replace function create_list(
  p_title text,
  p_description text default null,
  p_is_public boolean default true
) returns uuid language plpgsql security definer as $$
declare
  v_list_id uuid;
begin
  -- Only authenticated users can create lists
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Create the list
  insert into public.lists (
    owner_id,
    title,
    description,
    is_public
  )
  values (
    auth.uid(),
    p_title,
    p_description,
    p_is_public
  )
  returning id into v_list_id;

  return v_list_id;
end;
$$;

-- Function to get popular lists
create or replace function get_popular_lists(
  p_limit integer default 10,
  p_offset integer default 0
) returns table (
  id uuid,
  owner_id uuid,
  owner_username text,
  owner_avatar_url text,
  title text,
  description text,
  is_public boolean,
  created_at timestamptz,
  updated_at timestamptz,
  race_count bigint,
  like_count bigint,
  comment_count bigint,
  is_liked boolean
) language plpgsql security definer as $$
begin
  return query
  select 
    l.id,
    l.owner_id,
    u.username as owner_username,
    u.avatar_url as owner_avatar_url,
    l.title,
    l.description,
    l.is_public,
    l.created_at,
    l.updated_at,
    count(distinct li.id)::bigint as race_count,
    count(distinct lk.id)::bigint as like_count,
    count(distinct c.id)::bigint as comment_count,
    exists (
      select 1 from public.list_likes ul
      where ul.list_id = l.id
      and ul.user_id = auth.uid()
    ) as is_liked
  from public.lists l
  join public.users u on u.id = l.owner_id
  left join public.list_items li on li.list_id = l.id
  left join public.list_likes lk on lk.list_id = l.id
  left join public.list_comments c on c.list_id = l.id
  where l.is_public = true
  group by l.id, l.owner_id, u.username, u.avatar_url, l.title, l.description, l.is_public, l.created_at, l.updated_at
  order by 
    count(distinct lk.id) desc,  -- Most liked first
    count(distinct c.id) desc,   -- Then most commented
    l.created_at desc            -- Then most recent
  limit p_limit
  offset p_offset;
end;
$$;

-- Create new get_list_details function
create function get_list_details(
  p_list_id uuid
) returns table (
  id uuid,
  owner_id uuid,
  owner_username text,
  owner_avatar_url text,
  title text,
  description text,
  is_public boolean,
  created_at timestamptz,
  updated_at timestamptz,
  race_count bigint,
  like_count bigint,
  comment_count bigint,
  is_liked boolean
) language plpgsql security definer as $$
begin
  -- Check if list is accessible
  if not exists (
    select 1 from public.lists
    where id = p_list_id
    and (is_public = true or owner_id = auth.uid())
  ) then
    raise exception 'List not found or not accessible';
  end if;

  return query
  select 
    l.id,
    l.owner_id,
    u.username as owner_username,
    u.avatar_url as owner_avatar_url,
    l.title,
    l.description,
    l.is_public,
    l.created_at,
    l.updated_at,
    count(distinct li.id)::bigint as race_count,
    count(distinct lk.id)::bigint as like_count,
    count(distinct c.id)::bigint as comment_count,
    exists (
      select 1 from public.list_likes ul
      where ul.list_id = l.id
      and ul.user_id = auth.uid()
    ) as is_liked
  from public.lists l
  join public.users u on u.id = l.owner_id
  left join public.list_items li on li.list_id = l.id
  left join public.list_likes lk on lk.list_id = l.id
  left join public.list_comments c on c.list_id = l.id
  where l.id = p_list_id
  group by l.id, l.owner_id, u.username, u.avatar_url, l.title, l.description, l.is_public, l.created_at, l.updated_at;
end;
$$;

-- Grant execute permissions
grant execute on function create_list to authenticated;
grant execute on function get_popular_lists to authenticated, anon;
grant execute on function get_list_details to authenticated, anon; 