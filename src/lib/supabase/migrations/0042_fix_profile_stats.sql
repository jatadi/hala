-- Drop existing function
drop function if exists get_profile_stats;

-- Recreate function with proper UUID handling
create or replace function get_profile_stats(username_param text)
returns table (
  races_watched bigint,
  races_rated bigint,
  races_reviewed bigint,
  average_rating numeric,
  last_watched_at timestamptz
) as $$
begin
  return query
  select
    count(distinct l.match_id)::bigint as races_watched,
    count(distinct case when l.rating is not null then l.match_id end)::bigint as races_rated,
    count(distinct case when l.review is not null then l.match_id end)::bigint as races_reviewed,
    round(avg(l.rating)::numeric, 1) as average_rating,
    max(l.watched_at) as last_watched_at
  from public.logs l
  join public.users u on u.id::text = l.user_id::text
  where u.username = username_param;
end;
$$ language plpgsql security definer;

-- Grant execute to authenticated users
grant execute on function get_profile_stats to authenticated;

-- Test the function
select 'Profile stats check' as check,
  *
from get_profile_stats('maxv'); 