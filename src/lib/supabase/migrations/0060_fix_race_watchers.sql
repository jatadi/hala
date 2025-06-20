-- First check current watchers for race 11
select 'Current race 11 watchers' as check,
  *
from get_race_watchers(11);

-- Drop and recreate the function with proper UUID handling
create or replace function public.get_race_watchers(race_id_param bigint)
returns table (
  user_id uuid,
  username text,
  avatar_url text,
  watched_at timestamptz,
  rating numeric,
  review text
) language plpgsql security definer as $$
begin
  return query
  select 
    l.user_id::uuid,
    up.username,
    up.avatar_url,
    l.watched_at,
    l.rating,
    l.review
  from public.logs l
  join public.user_profiles up on up.id::text = l.user_id::text
  where l.match_id = race_id_param
  order by l.watched_at desc;
end;
$$;

-- Grant execute to authenticated users
grant execute on function get_race_watchers to authenticated;

-- Verify the fix by checking watchers for race 11 again
select 'Race 11 watchers after fix' as check,
  *
from get_race_watchers(11); 