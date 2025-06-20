-- First check current stats
select 'Current stats' as check,
  *
from get_profile_stats('lewish');

-- Drop and recreate the function with proper table references
create or replace function get_profile_stats(username_param text)
returns table (
  races_watched bigint,
  races_rated bigint,
  races_reviewed bigint,
  average_rating numeric,
  last_watched_at timestamptz,
  number_of_lists bigint,
  following_count bigint,
  followers_count bigint
) language sql security definer as $$
  with user_stats as (
    select
      u.id,
      count(distinct l.match_id) as races_watched,
      count(distinct case when l.rating is not null then l.match_id end) as races_rated,
      count(distinct case when l.review is not null then l.match_id end) as races_reviewed,
      round(avg(l.rating)::numeric, 1) as average_rating,
      max(l.watched_at) as last_watched_at
    from public.users u
    left join public.logs l on l.user_id::text = u.id::text
    where u.username = username_param
    group by u.id
  )
  select
    us.races_watched::bigint,
    us.races_rated::bigint,
    us.races_reviewed::bigint,
    us.average_rating,
    us.last_watched_at,
    count(distinct li.list_id)::bigint as number_of_lists,
    count(distinct f1.followee_id)::bigint as following_count,
    count(distinct f2.follower_id)::bigint as followers_count
  from user_stats us
  join public.users u on u.username = username_param
  left join public.list_items li on li.list_id in (
    select id from public.lists where owner_id = u.id
  )
  left join public.follows f1 on f1.follower_id = u.id
  left join public.follows f2 on f2.followee_id = u.id
  group by 
    us.races_watched,
    us.races_rated,
    us.races_reviewed,
    us.average_rating,
    us.last_watched_at;
$$;

-- Grant execute to authenticated users
grant execute on function get_profile_stats to authenticated;

-- Verify the fix
select 'Profile stats after fix' as check,
  *
from get_profile_stats('lewish'); 