-- Get lists from users that the current user follows
create or replace function get_followed_users_lists()
returns table (
  id uuid,
  title text,
  description text,
  owner_id uuid,
  owner_username text,
  owner_avatar_url text,
  is_public boolean,
  is_liked boolean,
  like_count bigint,
  comment_count bigint,
  race_count bigint,
  created_at timestamptz,
  updated_at timestamptz
)
security definer
set search_path = public
language plpgsql
as $$
begin
  return query
  select 
    l.id,
    l.title,
    l.description,
    l.owner_id,
    u.username as owner_username,
    u.avatar_url as owner_avatar_url,
    l.is_public,
    exists(
      select 1 
      from list_likes ll 
      where ll.list_id = l.id 
      and ll.user_id = auth.uid()
    ) as is_liked,
    (
      select count(*)
      from list_likes ll
      where ll.list_id = l.id
    ) as like_count,
    (
      select count(*)
      from list_comments lc
      where lc.list_id = l.id
    ) as comment_count,
    (
      select count(*)
      from list_items li
      where li.list_id = l.id
    ) as race_count,
    l.created_at,
    l.updated_at
  from lists l
  join users u on u.id = l.owner_id
  join follows f on f.following_id = l.owner_id
  where f.follower_id = auth.uid()
  and (l.is_public = true or l.owner_id = auth.uid())
  order by l.created_at desc;
end;
$$; 