-- Check all logs for maxv
select 'Logs check' as check,
  l.*,
  m.title as race_title
from public.logs l
join public.matches m on m.id = l.match_id
join public.users u on u.id = l.user_id
where u.username = 'maxv'
order by l.watched_at;

-- Check profile stats function
select 'Profile stats check' as check,
  *
from get_profile_stats('maxv');

-- Check raw stats calculation
select 'Raw stats check' as check,
  count(distinct l.match_id) as races_watched,
  count(distinct case when l.rating is not null then l.match_id end) as races_rated,
  count(distinct case when l.review is not null then l.match_id end) as races_reviewed,
  round(avg(l.rating)::numeric, 1) as average_rating,
  max(l.watched_at) as last_watched_at
from public.logs l
join public.users u on u.id = l.user_id
where u.username = 'maxv'; 