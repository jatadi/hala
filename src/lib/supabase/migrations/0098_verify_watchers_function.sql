-- First check the current function definition
select 'Current function definition' as check,
  p.prosrc
from pg_proc p
join pg_namespace n on p.pronamespace = n.oid
where p.proname = 'get_race_watchers';

-- Check raw logs data
select 'Raw logs data' as check,
  l.*,
  u.username,
  u.avatar_url
from public.logs l
join public.users u on u.id = l.user_id
where l.match_id = 414
order by l.created_at desc;

-- Compare with direct function call
select 'Function output' as check,
  *
from get_race_watchers(414);

-- Check if there's any filtering happening in joins
select 'Join verification' as check,
  l.id as log_id,
  l.user_id,
  l.match_id,
  l.rating,
  l.review,
  u.username,
  u.avatar_url,
  f.race_id as f1_race_id
from public.logs l
join public.users u on u.id = l.user_id
left join public.f1_races f on f.race_id = l.match_id
where l.match_id = 414; 