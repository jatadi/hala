-- Check logs for race 12
select 'Race 12 logs' as check,
  l.id,
  l.user_id,
  l.match_id,
  l.rating,
  l.review,
  l.watched_at,
  u.username
from public.logs l
join public.users u on u.id::text = l.user_id::text
where l.match_id = 12;

-- Check race details function
select 'Race 12 details' as check,
  *
from get_race_details(12);

-- Check profile stats for both users
with user_stats as (
  select 
    u.username,
    s.races_watched,
    s.races_rated,
    s.races_reviewed,
    s.average_rating
  from public.users u
  cross join lateral get_profile_stats(u.username) s
  where u.username in ('lewish', 'maxv')
)
select 'Profile stats' as check,
  *
from user_stats;

-- Check raw logs count
select 'Raw logs count' as check,
  u.username,
  count(distinct l.match_id) as races_watched
from public.users u
left join public.logs l on l.user_id::text = u.id::text
where u.username in ('lewish', 'maxv')
group by u.username; 